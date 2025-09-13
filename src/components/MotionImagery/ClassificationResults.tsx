import React, { useEffect, useState } from 'react';
import { BrainCircuit, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ClassificationResultsProps {
  results: {
    currentClass: string | null;
    confidence: number;
    recentClasses: string[];
    accuracy: number;
    confusionMatrix: {
      leftHand: { trueLeft: number; falseRight: number };
      rightHand: { trueRight: number; falseLeft: number };
    };
  };
  status: string;
}

const ClassificationResults: React.FC<ClassificationResultsProps> = ({ 
  results, 
  status 
}) => {
  const [confidenceColor, setConfidenceColor] = useState('#6B7280');
  const [accuracyColor, setAccuracyColor] = useState('#6B7280');
  
  // 模拟分类结果更新
  useEffect(() => {
    let interval: number;
    
    if (status.includes('training') && !status.includes('paused')) {
      interval = setInterval(() => {
        // 这里可以添加更复杂的分类逻辑
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);
  
  // 根据置信度设置颜色
  useEffect(() => {
    if (results.confidence < 30) {
      setConfidenceColor('#EF4444'); // 低置信度 - 红色
    } else if (results.confidence < 70) {
      setConfidenceColor('#F59E0B'); // 中等置信度 - 黄色
    } else {
      setConfidenceColor('#10B981'); // 高置信度 - 绿色
    }
    
    // 根据准确率设置颜色
    if (results.accuracy < 50) {
      setAccuracyColor('#EF4444'); // 低准确率 - 红色
    } else if (results.accuracy < 80) {
      setAccuracyColor('#F59E0B'); // 中等准确率 - 黄色
    } else {
      setAccuracyColor('#10B981'); // 高准确率 - 绿色
    }
  }, [results.confidence, results.accuracy]);
  
  // 计算总试验次数和准确率
  const totalTrials = 
    results.confusionMatrix.leftHand.trueLeft + 
    results.confusionMatrix.leftHand.falseRight +
    results.confusionMatrix.rightHand.trueRight + 
    results.confusionMatrix.rightHand.falseLeft;
  
  const calculatedAccuracy = totalTrials > 0 
    ? ((results.confusionMatrix.leftHand.trueLeft + results.confusionMatrix.rightHand.trueRight) / totalTrials) * 100 
    : 0;
  
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
        <BrainCircuit size={18} />
        分类结果与性能指标
      </h2>
      
      {/* 当前分类结果 */}
      <div className="mb-6">
        <h3 className="text-sm text-gray-400 mb-2">当前分类结果</h3>
        <div className="flex items-center gap-4">
          <div className={`
            flex-1 bg-gray-700 rounded-lg p-4 text-center transition-all duration-300
            ${status.includes('training') && !status.includes('paused') ? 'animate-pulse' : ''}
          `}>
            <div className="text-3xl font-bold mb-1">
              {results.currentClass 
                ? results.currentClass === 'leftHand' ? (
                    <span className="text-blue-400">左手</span>
                  ) : (
                    <span className="text-green-400">右手</span>
                  )
                : status.includes('training') ? (
                    <span className="text-gray-500">分析中...</span>
                  ) : (
                    <span className="text-gray-500">未开始</span>
                  )}
            </div>
            <div className="text-sm text-gray-400">运动想象</div>
          </div>
          
          <div className="flex-1 bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold mb-1" style={{ color: confidenceColor }}>
              {results.confidence.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">置信度</div>
          </div>
        </div>
      </div>
      
      {/* 置信度指示器 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-400">分类置信度</span>
          <span className="text-sm font-medium text-white">{results.confidence.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-500 ease-out" 
            style={{ 
              width: `${results.confidence}%`,
              backgroundColor: confidenceColor
            }}
          ></div>
        </div>
      </div>
      
      {/* 性能指标 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-400">总体准确率</span>
            <span className="text-sm font-medium text-white">{results.accuracy.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500" 
              style={{ 
                width: `${results.accuracy}%`,
                backgroundColor: accuracyColor
              }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-400">平均反馈延迟</span>
            <span className="text-sm font-medium text-white">125 ms</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-blue-500" 
              style={{ width: '75%' }} // 假设125ms是良好水平(满分167ms)
            ></div>
          </div>
        </div>
      </div>
      
      {/* 近期分类历史 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">近期分类历史</span>
          <span className="text-xs text-gray-500">最后10次</span>
        </div>
        <div className="flex justify-between">
          {results.recentClasses.length > 0 ? (
            results.recentClasses.map((cls, index) => (
              <div 
                key={index} 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  ${cls === 'leftHand' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    cls === 'rightHand' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}
              >
                {cls === 'leftHand' ? '左' : cls === 'rightHand' ? '右' : '?'}
              </div>
            ))
          ) : (
            <div className="w-full text-center text-sm text-gray-500 py-2">
              暂无分类历史
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassificationResults;