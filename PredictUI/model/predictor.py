import os
import torch
import numpy as np
import mne
from braindecode.models import ShallowFBCSPNet

MODEL_SAVE_PATH = "trained_models/shallow_fbcspnet.pth"

# 与训练脚本一致的参数
WINDOW_SIZE = 512
WINDOW_STEP = 256

def load_trained_model(n_chans, input_time_length):
    """加载训练好的模型"""
    if not os.path.exists(MODEL_SAVE_PATH):
        raise FileNotFoundError("模型文件不存在，请先训练模型")

    model = ShallowFBCSPNet(
        n_chans,
        n_classes=2,
        input_window_samples=input_time_length,
        final_conv_length="auto"
    )

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.load_state_dict(torch.load(MODEL_SAVE_PATH, map_location=device))
    model.to(device)
    model.eval()
    return model

def create_epochs(data, window_size=WINDOW_SIZE, step=WINDOW_STEP):
    """将原始EEG信号切分成多个时间窗，与训练一致"""
    X_epochs = []
    for start in range(0, data.shape[1] - window_size + 1, step):
        X_epochs.append(data[:, start:start+window_size])
    return np.stack(X_epochs)  # (n_epochs, n_chans, window_size)

def predict_model(file_path):
    """
    预测单个EEG文件的标签

    参数:
        file_path: .set文件路径
    返回:
        0 (左手) 或 1 (右手)
    """
    # 读取EEG数据
    raw = mne.io.read_raw_eeglab(file_path, preload=True)
    data = raw.get_data()  # (n_chans, n_times)

    # 标准化每个通道（与训练一致）
    data = (data - data.mean(axis=1, keepdims=True)) / (data.std(axis=1, keepdims=True) + 1e-6)

    # 切分时间窗
    X_epochs = create_epochs(data)  # (n_epochs, n_chans, window_size)
    X_tensor = torch.tensor(X_epochs, dtype=torch.float32)

    # 加载模型
    model = load_trained_model(n_chans=X_tensor.shape[1], input_time_length=X_tensor.shape[2])

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)
    model.eval()

    # 对每个时间窗预测，取多数投票
    with torch.no_grad():
        out = model(X_tensor.to(device))
        preds = out.argmax(dim=1).cpu().numpy()
    # 多数投票决定最终分类
    final_pred = np.bincount(preds).argmax()
    return final_pred
