import React, { useState, useEffect } from 'react';
import { Play, Pause, StopCircle, RefreshCw, Download, Upload, Settings } from 'lucide-react';

type SystemStatus = 'ready' | 'acquiring' | 'training-with-feedback' | 'training-without-feedback' | 'paused' | 'completed';

interface ExperimentControlsProps {
  status: SystemStatus;
  onStatusChange: (status: SystemStatus) => void;
  feedbackType: 'with-feedback' | 'without-feedback';
  onFeedbackTypeChange: (type: 'with-feedback' | 'without-feedback') => void;
}

const ExperimentControls: React.FC<ExperimentControlsProps> = ({ 
  status, 
  onStatusChange, 
  feedbackType,
  onFeedbackTypeChange
}) => {
  const [trainingTime, setTrainingTime] = useState(0); // 秒数
  
  // 训练计时器
  useEffect(() => {
    let interval: number;
    
    if (['acquiring', 'training-with-feedback', 'training-without-feedback'].includes(status)) {
      interval = setInterval(() => {
        setTrainingTime(prev => prev + 1);
      }, 1000);
    } else if (status === 'completed') {
      setTrainingTime(0);
    }
    
    return () => clearInterval(interval);
  }, [status]);
  
  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onFeedbackTypeChange('with-feedback')}
          className={`py-2 px-3 rounded-md text-sm transition-colors ${
            feedbackType === 'with-feedback'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          disabled={status !== 'ready' && status !== 'completed'}
        >
          有反馈训练
        </button>
        <button
          onClick={() => onFeedbackTypeChange('without-feedback')}
          className={`py-2 px-3 rounded-md text-sm transition-colors ${
            feedbackType === 'without-feedback'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          disabled={status !== 'ready' && status !== 'completed'}
        >
          无反馈训练
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => {
            if (status === 'ready' || status === 'completed' || status === 'paused') {
              if (feedbackType === 'with-feedback') {
                onStatusChange('training-with-feedback');
              } else if (feedbackType === 'without-feedback') {
                onStatusChange('training-without-feedback');
              } else {
                onStatusChange('acquiring');
              }
            }
          }}
          className={`py-2 px-3 rounded-md text-sm transition-colors flex flex-col items-center ${
            ['ready', 'completed', 'paused'].includes(status)
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!['ready', 'completed', 'paused'].includes(status)}
        >
          <Play size={16} className="mb-1" />
          {status === 'paused' ? '继续' : '开始'}
        </button>
        
        <button
          onClick={() => status === 'acquiring' || status.includes('training') 
            ? onStatusChange('paused') 
            : null}
          className={`py-2 px-3 rounded-md text-sm transition-colors flex flex-col items-center ${
            status === 'acquiring' || status.includes('training')
              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          disabled={status !== 'acquiring' && !status.includes('training')}
        >
          <Pause size={16} className="mb-1" />
          暂停
        </button>
        
        <button
          onClick={() => onStatusChange('completed')}
          className={`py-2 px-3 rounded-md text-sm transition-colors flex flex-col items-center ${
            status === 'acquiring' || status.includes('training') || status === 'paused'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          disabled={status === 'ready' || status === 'completed'}
        >
           <StopCircle size={16} className="mb-1" />
          结束
        </button>
      </div>
      
      <div className="pt-2 border-t border-gray-700 mt-2">
        <div className="flex justify-between items-center text-sm mb-3">
          <span className="text-gray-400">当前状态</span>
          <span className={`font-medium px-2 py-1 rounded text-xs ${
            status === 'ready' || status === 'completed' ? 'bg-gray-700 text-gray-300' :
            status === 'paused' ? 'bg-yellow-900 text-yellow-300' :
            status.includes('training') ? 'bg-blue-900 text-blue-300' :
            'bg-green-900 text-green-300'
          }`}>
            {status === 'ready' && '准备就绪'}
            {status === 'acquiring' && '数据采集中'}
            {status === 'training-with-feedback' && '有反馈训练中'}
            {status === 'training-without-feedback' && '无反馈训练中'}
            {status === 'paused' && '已暂停'}
            {status === 'completed' && '实验已结束'}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">训练时长</span>
          <span className="text-white font-medium">{formatTime(trainingTime)}</span>
        </div>
      </div>
    </div>
  );
};

export default ExperimentControls;