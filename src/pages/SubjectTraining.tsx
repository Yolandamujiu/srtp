import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import StatusBar from '@/components/MotionImagery/StatusBar';
import { motionImageryData } from '@/mocks/motionImageryData';
import ExperimentParadigm from '@/components/MotionImagery/ExperimentParadigm';

export default function SubjectTraining() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [systemStatus, setSystemStatus] = useState('ready');
  const [currentTrial, setCurrentTrial] = useState(0);
  const [totalTrials, setTotalTrials] = useState(20);
  const [trialProgress, setTrialProgress] = useState(0);
  const [trialType, setTrialType] = useState<'leftHand' | 'rightHand'>('leftHand');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    // 模拟从服务器获取实验配置
    setTotalTrials(20);
  }, []);

  const startTraining = () => {
    setSystemStatus('training-with-feedback');
    setCurrentTrial(1);
    setTrialProgress(0);
  };

  const stopTraining = () => {
    setSystemStatus('completed');
  };

  const pauseTraining = () => {
    setSystemStatus('paused');
  };

  const resumeTraining = () => {
    setSystemStatus('training-with-feedback');
  };

  const nextTrial = () => {
    if (currentTrial < totalTrials) {
      setCurrentTrial(prev => prev + 1);
      setTrialProgress(0);
      // 随机选择下一次试次类型
      setTrialType(Math.random() > 0.5 ? 'leftHand' : 'rightHand');
    } else {
      stopTraining();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* 顶部标题栏 */}
      <header className="bg-gray-800 border-b border-gray-700 py-3 px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            被试界面
          </div>
          <h1 className="text-xl font-bold text-white">脑机接口训练系统</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-300">
            被试: {motionImageryData.subject.name}
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded transition-colors text-sm"
          >
            退出
          </button>
        </div>
      </header>
      
      {/* 主内容区域 - 实验范式和反馈 */}
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        {systemStatus === 'ready' && (
          <div className="text-center max-w-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">准备开始训练</h2>
            <p className="text-gray-300 mb-8">
              请坐在舒适的位置，保持放松但专注的状态。训练过程中，请按照屏幕上的提示进行运动想象。
              系统会通过脑电信号解析您的运动意图，并控制小球移动。
            </p>
            <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl border border-gray-700 mb-6">
              <h3 className="text-lg font-semibold mb-3 text-white">训练说明</h3>
              <ul className="text-left text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <i className="fa-solid fa-check-circle text-green-500 mt-1"></i>
                  <span>当屏幕显示"左手"时，请想象自己正在移动左手</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fa-solid fa-check-circle text-green-500 mt-1"></i>
                  <span>当屏幕显示"右手"时，请想象自己正在移动右手</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fa-solid fa-check-circle text-green-500 mt-1"></i>
                  <span>每个试次持续8秒，请保持专注直到试次结束</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={startTraining}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 inline-block text-lg"
            >
              开始训练
            </button>
          </div>
        )}

        {['training-with-feedback', 'paused'].includes(systemStatus) && (
          <div className="w-full max-w-3xl">
            <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">运动想象训练</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-300">
                    试次 {currentTrial} / {totalTrials}
                  </span>
                  {systemStatus === 'training-with-feedback' ? (
                    <button 
                      onClick={pauseTraining}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                    >
                      暂停
                    </button>
                  ) : (
                    <button 
                      onClick={resumeTraining}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      继续
                    </button>
                  )}
                  <button 
                    onClick={stopTraining}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    结束
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <ExperimentParadigm 
                  status={systemStatus}
                  trialType={trialType}
                  nextTrial={nextTrial}
                />
              </div>
            </div>
            
            {/* 进度条 */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">训练进度</span>
                <span className="text-sm font-medium text-white">{Math.round((currentTrial - 1 + trialProgress) / totalTrials * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300" 
                  style={{ width: `${Math.round((currentTrial - 1 + trialProgress) / totalTrials * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {systemStatus === 'completed' && (
          <div className="text-center max-w-2xl">
            <div className="bg-green-900/30 border border-green-800 rounded-lg p-4 mb-6">
              <i className="fa-solid fa-trophy text-green-500 text-5xl mb-4"></i>
              <h2 className="text-2xl font-bold mb-2 text-white">训练完成！</h2>
              <p className="text-gray-300">
                您已成功完成所有训练试次，感谢您的参与！
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-800/70 backdrop-blur-sm p-4 rounded-lg border border-gray-700">
                <div className="text-3xl font-bold text-blue-400">{currentTrial - 1}</div>
                <div className="text-sm text-gray-400">完成试次</div>
              </div>
              <div className="bg-gray-800/70 backdrop-blur-sm p-4 rounded-lg border border-gray-700">
                <div className="text-3xl font-bold text-green-400">100%</div>
                <div className="text-sm text-gray-400">完成进度</div>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 inline-block"
            >
              返回主页面
            </button>
          </div>
        )}
      </main>
      
      {/* 底部状态栏 (系统信息区) */}
      <StatusBar 
        status={systemStatus}
        latency={motionImageryData.systemMetrics.latency}
        storagePath={motionImageryData.systemMetrics.storagePath}
      />
    </div>
  );
}