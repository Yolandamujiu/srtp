# 运动想象EEG模型网页应用

这是一个基于Flask和PyTorch的网页应用，用于训练和预测运动想象EEG模型，可识别左手和右手运动想象。

## 功能特点

- 网页界面操作，无需命令行
- 模型训练功能，支持自定义数据目录
- 实时训练进度显示
- 单文件预测功能，支持上传EEG .set文件
- 直观的预测结果展示

## 项目结构

```
motion_imagination_webapp/
├── app.py              # Flask后端主程序
├── model/              # 模型相关代码
│   ├── __init__.py
│   ├── data_loader.py  # 数据加载函数
│   ├── trainer.py      # 训练函数
│   └── predictor.py    # 预测函数
├── static/             # 静态文件
│   ├── css/
│   │   └── style.css   # 样式表
│   └── js/
│       └── script.js   # 前端交互逻辑
├── templates/          # HTML模板
│   └── index.html      # 主页面
├── uploads/            # 上传文件存储目录
├── trained_models/     # 训练好的模型存储目录
├── requirements.txt    # 依赖包列表
└── README.md           # 运行说明
```

## 环境要求

- Python 3.7+
- 支持Windows, macOS和Linux系统

## 安装步骤

1. 克隆或下载本项目到本地
2. 进入项目目录
3. 创建并激活虚拟环境（可选但推荐）:
   ```
   python -m venv venv
   # Windows激活
   venv\Scripts\activate
   # macOS/Linux激活
   source venv/bin/activate
   ```
4. 安装依赖包:
   ```
   pip install -r requirements.txt
   ```

## 使用说明

1. 启动应用:
   ```
  python app.py 
   ```
2. 在浏览器中访问: `http://localhost:5000`

### 模型训练

1. 在"模型训练"区域输入包含EEG .set文件的目录路径
2. 点击"开始训练"按钮
3. 查看训练进度和日志

### 模型预测

1. 在"模型预测"区域点击"选择EEG文件"按钮
2. 选择一个EEG .set文件
3. 点击"开始预测"按钮
4. 查看预测结果（左手或右手）

## 注意事项

- 训练数据目录应包含多个EEG .set文件，文件名需包含"left"或"right"以区分标签
- 首次使用需要先训练模型，然后才能进行预测
- 训练过程可能需要较长时间，具体取决于数据量和计算机性能
- 确保有足够的磁盘空间存储上传的文件和训练好的模型

## 故障排除

- **训练失败**: 检查训练数据目录是否正确，文件是否为有效的EEG .set格式
- **预测错误**: 确保已先训练模型，且上传的文件格式正确
- **依赖问题**: 确保所有依赖包已正确安装，可尝试重新安装requirements.txt中的包