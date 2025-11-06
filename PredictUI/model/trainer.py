import os
import torch
import numpy as np
from torch.utils.data import TensorDataset, DataLoader, random_split
import torch.nn.functional as F
from braindecode.models import ShallowFBCSPNet
from model.data_loader import load_all_data

MODEL_SAVE_PATH = "trained_models/shallow_fbcspnet.pth"

# 参数配置
WINDOW_SIZE = 512      # 时间窗长度，可根据采样率调整
WINDOW_STEP = 256      # 滑动步长
BATCH_SIZE = 16
EPOCHS = 10

def create_epochs(X, y, window_size=WINDOW_SIZE, step=WINDOW_STEP):
    """将每个样本切成多个时间窗"""
    X_epochs, y_epochs = [], []
    for i in range(len(X)):
        x = X[i]
        label = y[i]
        for start in range(0, x.shape[1] - window_size + 1, step):
            X_epochs.append(x[:, start:start + window_size])
            y_epochs.append(label)
    return np.stack(X_epochs), np.array(y_epochs)

def train_model(X, y, update_progress=None):
    """
    训练模型并保存

    参数:
        X: 输入数据 (n_subjects, n_channels, n_times)
        y: 标签 (n_subjects,)
        update_progress: 回调函数，用于更新训练进度 (epoch, acc) -> None
    """
    # 切分时间窗
    X, y = create_epochs(X, y)
    print(f"[INFO] 切分后数据形状: X={X.shape}, y分布={np.bincount(y)}")

    # 标准化每个通道
    X = (X - X.mean(axis=2, keepdims=True)) / (X.std(axis=2, keepdims=True) + 1e-6)

    # 转换为Tensor
    X_tensor = torch.tensor(X, dtype=torch.float32)
    y_tensor = torch.tensor(y, dtype=torch.long)

    # 创建数据集和数据加载器
    dataset = TensorDataset(X_tensor, y_tensor)
    train_size = int(0.8 * len(dataset))
    test_size = len(dataset) - train_size
    train_ds, test_ds = random_split(dataset, [train_size, test_size])

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
    test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE, shuffle=False)

    # 创建模型
    n_chans = X.shape[1]
    input_time_length = X.shape[2]

    model = ShallowFBCSPNet(
        n_chans,
        n_classes=2,  # 二分类（左右手运动想象）
        input_window_samples=input_time_length,
        final_conv_length="auto"
    )

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)

    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

    # 训练循环
    for epoch in range(EPOCHS):
        model.train()
        for X_batch, y_batch in train_loader:
            X_batch, y_batch = X_batch.to(device), y_batch.to(device)
            optimizer.zero_grad()
            out = model(X_batch)
            loss = F.cross_entropy(out, y_batch)
            loss.backward()
            optimizer.step()

        # 在测试集上评估
        model.eval()
        correct, total = 0, 0
        with torch.no_grad():
            for X_batch, y_batch in test_loader:
                X_batch, y_batch = X_batch.to(device), y_batch.to(device)
                out = model(X_batch)
                pred = out.argmax(dim=1)
                correct += (pred == y_batch).sum().item()
                total += y_batch.size(0)

        acc = correct / total if total > 0 else 0
        if update_progress:
            update_progress(epoch, acc)
        else:
            print(f"Epoch {epoch+1}/{EPOCHS} - 测试准确率: {acc:.4f}")

    # 保存模型
    os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
    torch.save(model.state_dict(), MODEL_SAVE_PATH)
    print(f"[INFO] 模型已保存到 {MODEL_SAVE_PATH}")

    return MODEL_SAVE_PATH
