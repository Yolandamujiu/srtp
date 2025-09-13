import React from 'react';
import { Clock, Target, CheckCircle, Zap, BarChart2, Clock8, Brain } from 'lucide-react';

interface TrainingMetricsProps {
  metrics: {
    focusLevel: number;
    accuracy: number;
    sessionProgress: number;
    currentTask: string;
    difficulty: string;
    trainingTime: string;
    trialCount: number;
    successfulTrials: number;
    averageFeedbackDelay: number;
  };
}

const TrainingMetrics: React.FC<TrainingMetricsProps> = ({ metrics }) => {
  // 计算成功率
  const successRate = metrics.trialCount > 0 
    ? (metrics.successfulTrials / metrics.trialCount) * 100 
    : 0;
  
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
        <BarChart2 size={18} />
        训练指标
      </h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 专注度 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-400 flex items-center gap-1.5">
              <Target size={14} />
              专注度
            </span>
            <span className="text-sm font-medium text-white">{metrics.focusLevel}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500" 
              style={{ 
                width: `${metrics.focusLevel}%`,
                backgroundColor: metrics.focusLevel > 70 ? '#10B981' : 
                               metrics.focusLevel > 40 ? '#F59E0B' : '#EF4444'
              }}
            ></div>
          </div>
        </div>
        
        {/* 准确率 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-400 flex items-center gap-1.5">
              <CheckCircle size={14} />
              准确率
            </span>
            <span className="text-sm font-medium text-white">{metrics.accuracy}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500" 
              style={{ 
                width: `${metrics.accuracy}%`,
                backgroundColor: '#3B82F6'
              }}
            ></div>
          </div>
        </div>
        
        {/* 训练进度 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-400 flex items-center gap-1.5">
              <BarChart2 size={14} />
              训练进度
            </span>
            <span className="text-sm font-medium text-white">{metrics.sessionProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500" 
              style={{ 
                width: `${metrics.sessionProgress}%`,
                backgroundColor: '#8B5CF6'
              }}
            ></div>
          </div>
        </div>
        
        {/* 反馈延迟 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-400 flex items-center gap-1.5">
              <Zap size={14} />
              反馈延迟
            </span>
            <span className="text-sm font-medium text-white">{metrics.averageFeedbackDelay} ms</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500" 
              style={{ 
                width: `${Math.max(0, 100 - metrics.averageFeedbackDelay / 2)}%`,
                backgroundColor: metrics.averageFeedbackDelay < 100 ? '#10B981' : 
                               metrics.averageFeedbackDelay < 200 ? '#F59E0B' : '#EF4444'
              }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* 详细指标 */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-gray-400 mb-1 flex items-center gap-1.5">
            <Clock size={14} />
            训练时长
          </div>
          <div className="text-white font-medium">{metrics.trainingTime}</div>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-gray-400 mb-1 flex items-center gap-1.5">
            <Target size={14} />
            当前任务
          </div>
          <div className="text-white font-medium truncate">{metrics.currentTask}</div>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-gray-400 mb-1 flex items-center gap-1.5">
            <CheckCircle size={14} />
            任务完成率
          </div>
          <div className="text-white font-medium">
            {successRate.toFixed(1)}% ({metrics.successfulTrials}/{metrics.trialCount})
          </div>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-gray-400 mb-1 flex items-center gap-1.5">
            <Brain size={14} />
            难度等级
          </div>
          <div className="text-white font-medium">
            {metrics.difficulty}
            <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-gray-600 text-gray-300">
              {metrics.difficulty === '简单' ? '入门' : 
               metrics.difficulty === '中等' ? '标准' : '高级'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingMetrics;