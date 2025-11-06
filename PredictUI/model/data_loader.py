import os
import numpy as np
import mne

def load_subject_data(set_file):
    """读取EEGLAB .set文件，并根据文件名生成标签"""
    raw = mne.io.read_raw_eeglab(set_file, preload=True)
    data = raw.get_data()  # (n_channels, n_times)

    # 根据文件名生成标签
    filename = os.path.basename(set_file).lower()
    if "left" in filename:
        label = 0
    elif "right" in filename:
        label = 1
    else:
        raise ValueError(f"无法判断文件标签: {set_file}")

    # 每个文件只有一个整体标签（left/right）
    labels = np.array([label])
    return data, labels


def load_all_data(data_dir):
    """加载多个 .set 文件并合并"""
    all_X, all_y = [], []

    for fname in os.listdir(data_dir):
        if fname.endswith(".set"):
            fpath = os.path.join(data_dir, fname)
            try:
                X, y = load_subject_data(fpath)
                all_X.append(X)
                all_y.append(y)
            except Exception as e:
                print(f"警告: 无法处理文件 {fpath}: {str(e)}")

    if not all_X:
        raise ValueError("未找到有效的训练数据文件")

    # 统一时间长度（取最小长度）
    min_len = min([x.shape[1] for x in all_X])
    all_X = [x[:, :min_len] for x in all_X]

    X = np.stack(all_X, axis=0)  # (n_subjects, n_channels, n_times)
    y = np.concatenate(all_y, axis=0)

    return X, y
