import os
import numpy as np
import torch
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt
from braindecode.models import ShallowFBCSPNet
import joblib

# ======================
# 1. 数据加载
# ======================
import mne
from mne.io import read_raw_eeglab

def load_eeglab_data(set_file_path):
    raw = read_raw_eeglab(set_file_path, preload=True)
    data = raw.get_data()
    sfreq = raw.info['sfreq']
    return data, sfreq

def detect_trials(data, sfreq, trial_length_sec=4):
    trial_len = int(trial_length_sec * sfreq)
    n_trials = data.shape[1] // trial_len
    X = np.array([data[:, i*trial_len:(i+1)*trial_len] for i in range(n_trials)])
    return X

def load_dataset_from_folder(folder_path):
    X_list, y_list = [], []
    for f in os.listdir(folder_path):
        if f.endswith('.set'):
            label = 0 if 'left' in f.lower() else 1
            file_path = os.path.join(folder_path, f)
            data, sfreq = load_eeglab_data(file_path)
            X = detect_trials(data, sfreq)
            y = np.full(X.shape[0], label, dtype=np.int64)
            X_list.append(X)
            y_list.append(y)
            print(f"加载 {f}, 样本数: {X.shape[0]}")
    if not X_list:
        raise FileNotFoundError("训练集文件夹没有有效的 .set 文件")
    X = np.concatenate(X_list, axis=0)
    y = np.concatenate(y_list, axis=0)
    return X, y, sfreq

# ======================
# 2. 标准化
# ======================
def standardize_dataset(X, scaler=None):
    orig_shape = X.shape
    X_reshaped = X.reshape(X.shape[0], -1)
    if scaler is None:
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_reshaped)
    else:
        X_scaled = scaler.transform(X_reshaped)
    X_scaled = X_scaled.reshape(orig_shape)
    return X_scaled, scaler

# ======================
# 3. 训练函数
# ======================
def train_model(X_train, y_train, sfreq, model_path='shallowfbcspnet_model.pth', scaler_path='scaler.save',
                batch_size=16, max_epochs=10, incremental=False):
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    n_chans = X_train.shape[1]
    n_times = X_train.shape[2]
    n_classes = 2

    X_train_scaled, scaler = standardize_dataset(X_train)
    joblib.dump(scaler, scaler_path)  # 保存标准化器

    # 转 Tensor
    X_tensor = torch.tensor(X_train_scaled, dtype=torch.float32)
    y_tensor = torch.tensor(y_train, dtype=torch.long)
    dataset = TensorDataset(X_tensor, y_tensor)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    # 构建模型
    model = ShallowFBCSPNet(n_chans=n_chans, n_classes=n_classes, n_times=n_times, final_conv_length='auto').to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    criterion = torch.nn.CrossEntropyLoss()

    # 如果增量训练，加载权重
    if incremental and os.path.exists(model_path):
        state_dict = torch.load(model_path, map_location=device)
        model.load_state_dict(state_dict)
        print("检测到已有模型，加载继续训练...")

    # 每轮训练
    for epoch in range(max_epochs):
        model.train()
        total_loss = 0
        for batch_X, batch_y in loader:
            batch_X = batch_X.to(device)
            batch_y = batch_y.to(device)
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item() * batch_X.size(0)
        avg_loss = total_loss / len(dataset)
        # 每轮输出训练准确率
        model.eval()
        with torch.no_grad():
            preds = torch.argmax(model(X_tensor.to(device)), dim=1).cpu().numpy()
            acc = accuracy_score(y_train, preds)
        print(f"Epoch {epoch+1}/{max_epochs}, Loss: {avg_loss:.4f}, Train Acc: {acc:.4f}")

    # 保存权重
    torch.save(model.state_dict(), model_path)
    print(f"训练完成，模型已保存: {model_path}, 标准化器已保存: {scaler_path}")
    return model, scaler

# ======================
# 4. 预测函数
# ======================
def predict_set_file(set_file_path, model_path='shallowfbcspnet_model.pth', scaler_path='scaler.save'):
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    data, sfreq = load_eeglab_data(set_file_path)
    X = detect_trials(data, sfreq)
    # 加载标准化器
    if not os.path.exists(scaler_path):
        raise FileNotFoundError("标准化器不存在，请先训练模型")
    scaler = joblib.load(scaler_path)
    X_scaled, _ = standardize_dataset(X, scaler)

    X_tensor = torch.tensor(X_scaled, dtype=torch.float32).to(device)

    # 构建模型
    n_chans = X.shape[1]
    n_times = X.shape[2]
    n_classes = 2
    model = ShallowFBCSPNet(n_chans=n_chans, n_classes=n_classes, n_times=n_times, final_conv_length='auto').to(device)
    if not os.path.exists(model_path):
        raise FileNotFoundError("模型不存在，请先训练")
    state_dict = torch.load(model_path, map_location=device)
    model.load_state_dict(state_dict)
    model.eval()

    with torch.no_grad():
        outputs = model(X_tensor)
        y_pred = torch.argmax(outputs, dim=1).cpu().numpy()
    print(f"预测结果: {y_pred}")
    print(f"总样本数: {len(y_pred)}, 左手: {np.sum(y_pred==0)}, 右手: {np.sum(y_pred==1)}")

    return y_pred

# ======================
# 5. 主程序
# ======================
if __name__ == "__main__":
    choice = input("请选择操作: 1-训练模型, 2-预测单个.set文件: ")
    if choice == '1':
        folder_path = input("请输入训练集文件夹路径: ").strip()
        incremental = input("是否增量训练已有模型? (y/n): ").strip().lower() == 'y'
        X_train, y_train, sfreq = load_dataset_from_folder(folder_path)
        train_model(X_train, y_train, sfreq, incremental=incremental)
    elif choice == '2':
        set_file = input("请输入待预测的 .set 文件路径: ").strip()
        predict_set_file(set_file)
    else:
        print("无效选择")
