import React, { useState, useEffect, useRef } from 'react';

type TrialPhase = 'cue' | 'prepare' | 'imagine' | 'rest';
type TrialType = 'leftHand' | 'rightHand';

interface ExperimentParadigmProps {
  status: string;
  trialType: TrialType;
  nextTrial: () => void;
}

export default function ExperimentParadigm({ status, trialType, nextTrial }: ExperimentParadigmProps) {
  const [currentPhase, setCurrentPhase] = useState<TrialPhase>('cue');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [ballPosition, setBallPosition] = useState(50); // 0-100%
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // 试次阶段时长 (毫秒)
  const phaseDurations = {
    cue: 2000,
    prepare: 2000,
    imagine: 2000,
    rest: 2000
  };
  
  // 每个阶段的总帧数
  const totalFrames = 60 * (Object.values(phaseDurations).reduce((a, b) => a + b) / 1000);
  
  useEffect(() => {
    if (status !== 'training-with-feedback') return;
    
    // 初始化音频元素
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    let startTime: number | null = null;
    let phaseStartTime: number | null = null;
    let animationId: number;
    
    // 播放提示音
    const playSound = (type: string) => {
      if (!audioRef.current) return;
      
      // 这里可以根据需要选择不同的提示音
      // 由于我们不能引入外部资源，这里仅作示意
      if (type === 'cue') {
        audioRef.current.src = 'data:audio/wav;base64,UklGRnAAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAACA';
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      } else if (type === 'imagine') {
        audioRef.current.src = 'data:audio/wav;base64,UklGRmQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAACA';
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    };
    
    // 初始化当前阶段
    setCurrentPhase('cue');
    setPhaseProgress(0);
    phaseStartTime = Date.now();
    startTime = Date.now();
    playSound('cue');
    
    const animate = () => {
      if (!startTime || !phaseStartTime) return;
      
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const phaseElapsed = currentTime - phaseStartTime;
      
      // 更新阶段进度
      const phaseDuration = phaseDurations[currentPhase];
      const progress = Math.min(phaseElapsed / phaseDuration, 1);
      setPhaseProgress(progress);
      
      // 模拟小球移动 (基于分类结果)
      if (currentPhase === 'imagine' && status === 'training-with-feedback') {
        // 在实际应用中，这里应该基于真实的脑电信号分类结果
        // 这里我们使用模拟数据来演示
        const targetPosition = trialType === 'leftHand' ? 15 : 85;
        const moveSpeed = 0.5; // 每秒移动的百分比
        
        setBallPosition(prev => {
          if (Math.abs(prev - targetPosition) < 1) return targetPosition;
          return prev + (targetPosition > prev ? 1 : -1) * moveSpeed;
        });
      }
      
      // 检查是否进入下一阶段
      if (progress >= 1) {
        if (currentPhase === 'cue') {
          setCurrentPhase('prepare');
          phaseStartTime = currentTime;
        } else if (currentPhase === 'prepare') {
          setCurrentPhase('imagine');
          phaseStartTime = currentTime;
          playSound('imagine');
        } else if (currentPhase === 'imagine') {
          setCurrentPhase('rest');
          phaseStartTime = currentTime;
        } else if (currentPhase === 'rest') {
          // 试次结束，进入下一个试次
          nextTrial();
          return;
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [status, trialType, nextTrial]);
  
  // 获取当前阶段的提示文本
  const getPhaseText = () => {
    switch (currentPhase) {
      case 'cue':
        return trialType === 'leftHand' ? '即将开始：想象移动左手' : '即将开始：想象移动右手';
      case 'prepare':
        return '准备就绪，请集中注意力';
      case 'imagine':
        return trialType === 'leftHand' ? '开始想象：移动左手' : '开始想象：移动右手';
      case 'rest':
        return '休息一下，准备下一个试次';
      default:
        return '';
    }
  };
  
  // 获取当前阶段的颜色
  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'cue':
        return 'bg-blue-900/50 text-blue-300 border-blue-800';
      case 'prepare':
        return 'bg-amber-900/50 text-amber-300 border-amber-800';
      case 'imagine':
        return 'bg-green-900/50 text-green-300 border-green-800';
      case 'rest':
        return 'bg-gray-800 text-gray-300 border-gray-700';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };
  
  return (
    <div className="space-y-4">
      {/* 阶段提示 */}
      <div className={`rounded-lg p-4 text-center border ${getPhaseColor()}`}>
        <h3 className="text-xl font-bold mb-1">{getPhaseText()}</h3>
        <div className="text-sm opacity-80">
          {Math.round((1 - phaseProgress) * phaseDurations[currentPhase] / 1000)}秒
        </div>
      </div>
      
      {/* 进度条 */}
      <div className="bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-0 ${
            currentPhase === 'cue' ? 'bg-blue-500' :
            currentPhase === 'prepare' ? 'bg-amber-500' :
            currentPhase === 'imagine' ? 'bg-green-500' :
            'bg-gray-500'
          }`}
          style={{ width: `${phaseProgress * 100}%` }}
        ></div>
      </div>
      
      {/* 反馈界面 - 小球移动 */}
      <div className="mt-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 relative overflow-hidden">
          {/* 轨道 */}
          <div className="w-full h-4 bg-gray-700 rounded-full absolute top-1/2 transform -translate-y-1/2">
            <div className="w-full h-full bg-gradient-to-r from-blue-600/20 via-gray-500/20 to-green-600/20 rounded-full"></div>
            
            {/* 中线标记 */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-10 bg-gray-500"></div>
            
            {/* 小球 */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30"
              style={{ 
                left: `${ballPosition}%`, 
                transform: `translate(-50%, -50%) ${currentPhase === 'imagine' && status === 'training-with-feedback' ? 'scale(1.1)' : ''}`,
                transition: 'left 0.1s ease-out'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fa-solid fa-brain text-white/80"></i>
              </div>
            </div>
          </div>
          
          {/* 标签 */}
          <div className="flex justify-between text-xs text-gray-400 mt-8">
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full mb-1">左手</div>
              <i className="fa-solid fa-hand-back-fist text-blue-500 text-xl"></i>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-600 text-white px-3 py-1 rounded-full mb-1">右手</div>
              <i className="fa-solid fa-hand text-green-500 text-xl"></i>
            </div>
          </div>
        </div>
      </div>
      
      {/* 阶段指示器 */}
      <div className="flex justify-between items-center mt-4">
        {Object.keys(phaseDurations).map((phase, index) => {
          const phaseKey = phase as TrialPhase;
          const isActive = phaseKey === currentPhase;
          const isCompleted = index < Object.keys(phaseDurations).indexOf(currentPhase);
          
          return (
            <React.Fragment key={phase}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs mb-1 ${
                  isActive ? 'bg-blue-600 text-white' :
                  isCompleted ? 'bg-green-600 text-white' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <div className="text-xs text-gray-400">
                  {phaseKey === 'cue' ? '提示' :
                   phaseKey === 'prepare' ? '准备' :
                   phaseKey === 'imagine' ? '想象' : '休息'}
                </div>
              </div>
              
              {index < Object.keys(phaseDurations).length - 1 && (
                <div className={`flex-1 h-1 mx-1 ${
                  index < Object.keys(phaseDurations).indexOf(currentPhase) ? 'bg-green-600' : 'bg-gray-700'
                }`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* 提示图标 */}
      <div className="mt-6 flex justify-center">
        {currentPhase === 'imagine' && (
          <div className="text-center">
            {trialType === 'leftHand' ? (
              <div className="text-blue-400 text-5xl animate-pulse">
                <i className="fa-solid fa-hand-back-fist"></i>
              </div>
            ) : (
              <div className="text-green-400 text-5xl animate-pulse">
                <i className="fa-solid fa-hand"></i>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 隐藏的音频元素 */}
      {audioRef.current && (
        <audio ref={audioRef} style={{ display: 'none' }} />
      )}
    </div>
  );
}