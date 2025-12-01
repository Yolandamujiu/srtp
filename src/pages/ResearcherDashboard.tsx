import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { AuthContext } from '@/contexts/authContext';
import SubjectInfo from '@/components/MotionImagery/SubjectInfo';
import ExperimentControls from '@/components/MotionImagery/ExperimentControls';
import DataManagement from '@/components/MotionImagery/DataManagement';
import ClassificationResults from '@/components/MotionImagery/ClassificationResults';
import TrainingMetrics from '@/components/MotionImagery/TrainingMetrics';
import StatusBar from '@/components/MotionImagery/StatusBar';
import { motionImageryData } from '@/mocks/motionImageryData';

export default function ResearcherDashboard() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [systemStatus, setSystemStatus] = useState('ready');
  const [feedbackType, setFeedbackType] = useState<'with-feedback' | 'without-feedback'>('with-feedback');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* 顶部标题栏 */}
      <header className="bg-gray-800 border-b border-gray-700 py-3 px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            主试界面
          </div>
          <h1 className="text-xl font-bold text-white">脑机接口训练平台 - 主试控制台</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-300">
            研究人员: {motionImageryData.researchers[0]?.name}
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded transition-colors text-sm"
          >
            退出
          </button>
        </div>
      </header>
      
      {/* 主内容区域 - 模块化仪表盘布局 */}
      <main className="flex-grow flex overflow-hidden">
        {/* 左侧面板 (导航与控制区) */}
        <PanelGroup direction="horizontal" className="flex-grow h-full">
          <Panel defaultSize={30} className="bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
            <div className="space-y-6">
              <SubjectInfo subject={motionImageryData.subject} />
              
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3 text-white border-b border-gray-600 pb-2">实验控制</h2>
                <ExperimentControls 
                  status={systemStatus}
                  onStatusChange={setSystemStatus}
                  feedbackType={feedbackType}
                  onFeedbackTypeChange={setFeedbackType}
                />
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3 text-white border-b border-gray-600 pb-2">数据管理</h2>
                <DataManagement />
              </div>
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-gray-600" />
          
          {/* 右侧面板 (数据分析与参数区) */}
          <Panel defaultSize={70} className="bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
            <div className="space-y-6">
              <ClassificationResults 
                results={motionImageryData.classificationResults}
                status={systemStatus}
              />
              
              <TrainingMetrics metrics={motionImageryData.trainingMetrics} />
              
              <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3 text-sm text-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <i className="fa-solid fa-check-circle text-blue-400"></i>
                  <span className="font-medium">个性化特征模型已加载</span>
                </div>
                <p className="text-gray-300 text-xs">系统已应用为当前被试优化的运动想象解码算法</p>
              </div>
            </div>
          </Panel>
        </PanelGroup>
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