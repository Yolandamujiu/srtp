// 全局变量
let selectedFiles = [];

// DOM元素
const trainDirInput = document.getElementById('train-dir');
const trainBtn = document.getElementById('train-btn');
const trainLog = document.getElementById('train-log');
const progressBar = document.getElementById('progress');
const fileInput = document.getElementById('predict-files');
const fileInfo = document.getElementById('file-info');
const predictBtn = document.getElementById('predict-btn');
const predictionResult = document.getElementById('prediction-result').querySelector('.result-content');

// 训练按钮点击事件
trainBtn.addEventListener('click', async () => {
    const trainDir = trainDirInput.value.trim();
    if (!trainDir) {
        alert('请输入训练数据目录');
        return;
    }

    try {
        const response = await fetch('/train', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data_dir: trainDir })
        });

        const result = await response.json();
        if (result.status === 'error') {
            alert(result.message);
        } else {
            updateTrainingStatus();
        }
    } catch (error) {
        console.error('训练请求失败:', error);
        alert('训练请求失败，请重试');
    }
});

// 预测文件选择事件（支持多文件）
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        selectedFiles = Array.from(e.target.files);
        const names = selectedFiles.map(f => f.name).join(', ');
        fileInfo.textContent = `已选择: ${names}`;
        predictBtn.disabled = false;
    } else {
        selectedFiles = [];
        fileInfo.textContent = '未选择文件';
        predictBtn.disabled = true;
    }
});

// 预测按钮点击事件：直接把两个文件 POST 到 /predict（FormData）
predictBtn.addEventListener('click', async () => {
    if (!selectedFiles || selectedFiles.length < 2) {
        alert('请同时选择 .set 和 .fdt 文件');
        return;
    }

    // 必需上传两个文件（允许多于2，但必须包含 .set 与 .fdt）
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('files', file)); // key = 'files'

    try {
        predictionResult.textContent = '正在上传并预测...';

        const res = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        // 打印调试（浏览器控制台）
        console.log('predict response status:', res.status);

        const data = await res.json();
        if (res.ok && data.status === 'success') {
            predictionResult.innerHTML = `
                <p>预测类别: <strong>${data.prediction}</strong></p>
                ${data.confidence ? `<p>置信度: <strong>${(data.confidence * 100).toFixed(2)}%</strong></p>` : ''}
            `;
        } else {
            predictionResult.innerHTML = `<p style="color:red;">预测失败: ${data.message}</p>`;
        }
    } catch (err) {
        console.error('预测请求失败:', err);
        predictionResult.textContent = '预测失败，请重试';
    }
});

// 更新训练状态（轮询）
function updateTrainingStatus() {
    fetch('/training_status')
        .then(response => response.json())
        .then(status => {
            progressBar.style.width = `${status.progress}%`;
            trainLog.textContent = status.log.join('\n');
            trainLog.scrollTop = trainLog.scrollHeight;

            if (status.in_progress) {
                setTimeout(updateTrainingStatus, 1000);
            } else if (status.error) {
                trainLog.textContent += `\n训练失败: ${status.error}`;
            } else if (status.completed) {
                trainLog.textContent += '\n训练完成!';
            }
        })
        .catch(error => {
            console.error('获取训练状态失败:', error);
            setTimeout(updateTrainingStatus, 1000);
        });
}
