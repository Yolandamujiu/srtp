from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import os
import threading
from model.trainer import train_model
from model.predictor import predict_model
from model.data_loader import load_all_data

app = Flask(__name__)

# 配置上传文件夹
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('trained_models', exist_ok=True)

training_status = {
    'in_progress': False,
    'progress': 0,
    'log': [],
    'completed': False,
    'error': None
}

prediction_result = None


@app.route('/')
def index():
    return render_template('index.html')


# （可选）保留单独 upload 接口，如果你以后需要上传并返回路径。
@app.route('/upload', methods=['POST'])
def upload_file():
    # 支持 'files' (multiple) 或 'file' 或 'set_file'/'fdt_file'
    uploaded = []
    # 先尝试多文件 key 'files'
    uploaded_files = request.files.getlist('files')
    if not uploaded_files:
        # 尝试常见单文件 keys
        for key in ('file', 'set_file', 'fdt_file'):
            f = request.files.get(key)
            if f:
                uploaded_files.append(f)

    if not uploaded_files:
        return jsonify({'status': 'error', 'message': '未选择文件'}), 400

    saved_paths = []
    for f in uploaded_files:
        filename = secure_filename(f.filename)
        if filename == '':
            continue
        path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        f.save(path)
        saved_paths.append(path)

    if not saved_paths:
        return jsonify({'status': 'error', 'message': '没有有效文件被保存'}), 400

    return jsonify({'status': 'success', 'message': '文件上传成功', 'file_paths': saved_paths})


# 训练接口（保持原逻辑）
@app.route('/train', methods=['POST'])
def start_training():
    global training_status
    data_dir = request.json.get('data_dir')

    if not data_dir or not os.path.isdir(data_dir):
        return jsonify({'status': 'error', 'message': '无效的训练数据目录'}), 400

    if training_status['in_progress']:
        return jsonify({'status': 'error', 'message': '训练已在进行中'}), 400

    training_status = {
        'in_progress': True,
        'progress': 0,
        'log': ['开始训练...'],
        'completed': False,
        'error': None
    }

    def train_background():
        global training_status
        try:
            training_status['log'].append('加载训练数据...')
            X, y = load_all_data(data_dir)

            def update_progress(epoch, acc):
                global training_status
                # 这里保持原先假设：20 个 epoch（如果实际不同，你可以调整）
                training_status['progress'] = (epoch / 20) * 100
                training_status['log'].append(f'Epoch {epoch+1}/20 - 测试准确率: {acc:.4f}')

            train_model(X, y, update_progress)
            training_status['completed'] = True
            training_status['log'].append('训练完成! 模型已保存.')
        except Exception as e:
            training_status['error'] = str(e)
            training_status['log'].append(f'训练出错: {str(e)}')
        finally:
            training_status['in_progress'] = False

    thread = threading.Thread(target=train_background)
    thread.start()

    return jsonify({'status': 'success', 'message': '训练已启动'})


# 预测接口：接收两个文件（支持多文件 key 'files' 或者 named keys）
@app.route('/predict', methods=['POST'])
def start_prediction():
    global prediction_result

    # 调试打印：查看 Flask 实际收到的文件 keys 与数量
    print("收到的文件 keys:", list(request.files.keys()))

    # 优先尝试 getlist('files')（前端使用 multiple 时的常见做法）
    uploaded_files = request.files.getlist('files')

    # 如果没有，通过常见命名尝试获取单独上传的两个文件
    if not uploaded_files or len(uploaded_files) == 0:
        # 尝试读取命名字段 set_file / fdt_file / file
        candidates = []
        for key in ('set_file', 'fdt_file', 'file'):
            f = request.files.get(key)
            if f:
                candidates.append(f)
        uploaded_files = candidates

    # 最终仍然检查数量
    if not uploaded_files or len(uploaded_files) < 2:
        # 提示更具体（打印以便调试）
        print("上传的文件不足，request.files keys:", list(request.files.keys()))
        return jsonify({'status': 'error', 'message': '必须同时上传 .set 和 .fdt 文件'}), 400

    set_file = None
    fdt_file = None
    saved_paths = []

    # 接收并保存（允许大于2时从中寻找 .set/.fdt）
    for f in uploaded_files:
        filename = secure_filename(f.filename)
        if not filename:
            continue
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        f.save(file_path)
        saved_paths.append(file_path)
        if filename.lower().endswith('.set'):
            set_file = file_path
        elif filename.lower().endswith('.fdt'):
            fdt_file = file_path

    # 如果刚才没按扩展名识别到 pair，但 saved_paths 有两个且一个看起来像 set（以 .set 结尾）
    if not set_file or not fdt_file:
        # 额外尝试：如果 saved_paths 中有两个文件且一个以 .set 存在，则尝试配对
        if len(saved_paths) >= 2:
            # 尝试以 filename base 匹配（例如 s05right.set 与 s05right.fdt）
            bases = {}
            for p in saved_paths:
                base = os.path.splitext(os.path.basename(p))[0]
                bases.setdefault(base, []).append(p)
            # 找到包含 set 和 fdt 的 base
            for base, paths in bases.items():
                have_set = any(p.lower().endswith('.set') for p in paths)
                have_fdt = any(p.lower().endswith('.fdt') for p in paths)
                if have_set and have_fdt:
                    for p in paths:
                        if p.lower().endswith('.set'):
                            set_file = p
                        elif p.lower().endswith('.fdt'):
                            fdt_file = p
                    break

    if not set_file or not fdt_file:
        print("仍未找到 .set/.fdt 配对；saved_paths:", saved_paths)
        return jsonify({'status': 'error', 'message': '必须上传可匹配的 .set 和 .fdt 文件（文件名应配对）'}), 400

    try:
        # 调用你的预测函数（以 .set 路径作为输入）
        result = predict_model(set_file)

        prediction_result = {
            'status': 'success',
            'prediction': '左手' if result == 0 else '右手',
            'confidence': None
        }
        return jsonify(prediction_result)
    except Exception as e:
        # 打印堆栈信息到控制台有助于调试（生产中可用 logging）
        print("预测出错:", str(e))
        return jsonify({'status': 'error', 'message': f'预测出错: {str(e)}'}), 500


@app.route('/training_status')
def get_training_status():
    return jsonify(training_status)


if __name__ == '__main__':
    app.run(debug=True)
