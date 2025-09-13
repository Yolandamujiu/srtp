import React, { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/MotionImagery/Header';
import SubjectInfo from '@/components/MotionImagery/SubjectInfo';
import ExperimentControls from '@/components/MotionImagery/ExperimentControls';
import DataManagement from '@/components/MotionImagery/DataManagement';
import Brain3DVisualization from '@/components/MotionImagery/Brain3DVisualization';
import EEGSignalChart from '@/components/MotionImagery/EEGSignalChart';
import ClassificationResults from '@/components/MotionImagery/ClassificationResults';
import FeatureVisualization from '@/components/MotionImagery/FeatureVisualization';
import TrainingMetrics from '@/components/MotionImagery/TrainingMetrics';
import StatusBar from '@/components/MotionImagery/StatusBar';
import ParadigmSelector from '@/components/MotionImagery/ParadigmSelector';

import { motionImageryData } from '@/mocks/motionImageryData';
import { EEGData, EEGProcessor, ProcessedEEGData } from '@/lib/eegProcessor';

const MotionImageryTraining: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isOfflineMode = searchParams.get('mode') === 'offline';
  
  const [activeParadigm, setActiveParadigm] = useState('motion-imagery');
  const [systemStatus, setSystemStatus] = useState('ready');
  const [feedbackType, setFeedbackType] = useState<'with-feedback' | 'without-feedback'>('with-feedback');
  
  // 离线模式状态
  const [importedData, setImportedData] = useState<EEGData | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedEEGData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  
  const eegProcessor = new EEGProcessor();

  // 检查是否有导入的数据
  useEffect(() => {
    if (isOfflineMode) {
      const storedData = sessionStorage.getItem('importedEEGData');
      if (storedData) {
        try {
          const data = JSON.parse(storedData) as EEGData;
          setImportedData(data);
          setSystemStatus('ready');
        } catch (error) {
          console.error('解析导入数据失败:', error);
        }
      }
    }
  }, [isOfflineMode]);

  // 处理导入的数据
  const handleDataImported = async (data: EEGData) => {
    setImportedData(data);
    setIsProcessing(true);
    setSystemStatus('processing');
    
    try {
      const processed = await eegProcessor.processEEGData(data);
      setProcessedData(processed);
      setSystemStatus('ready');
    } catch (error) {
      console.error('数据处理失败:', error);
      setSystemStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 获取当前显示的数据
  const getCurrentData = () => {
    if (isOfflineMode && processedData) {
      return {
        eegData: {
          channels: processedData.channels,
          samples: processedData.filteredData.slice(0, currentTimeIndex + 100)
        },
        brainActivity: {
          leftMotorCortex: { 
            activation: processedData.features.erdIntensity.C3?.[currentTimeIndex] || 0, 
            color: "#3B82F6" 
          },
          rightMotorCortex: { 
            activation: processedData.features.erdIntensity.C4?.[currentTimeIndex] || 0, 
            color: "#10B981" 
          },
          prefrontalCortex: { activation: 0, color: "#F59E0B" },
          noiseLevel: 15,
          updateRate: 100
        },
        classificationResults: {
          currentClass: processedData.classificationResults[currentTimeIndex]?.predictedClass || null,
          confidence: processedData.classificationResults[currentTimeIndex]?.confidence || 0,
          recentClasses: processedData.classificationResults.slice(-10).map(r => r.predictedClass),
          accuracy: 0,
          confusionMatrix: {
            leftHand: { trueLeft: 0, falseRight: 0 },
            rightHand: { trueRight: 0, falseLeft: 0 }
          }
        },
        featureData: {
          leftHandFeatures: {
            erdIntensity: processedData.features.erdIntensity.C3?.[currentTimeIndex] || 0,
            eventRelatedPotential: 0,
            coherence: processedData.features.coherence.C3?.[currentTimeIndex] || 0,
            spectralPower: processedData.features.spectralPower.C3?.[currentTimeIndex] || 0
          },
          rightHandFeatures: {
            erdIntensity: processedData.features.erdIntensity.C4?.[currentTimeIndex] || 0,
            eventRelatedPotential: 0,
            coherence: processedData.features.coherence.C4?.[currentTimeIndex] || 0,
            spectralPower: processedData.features.spectralPower.C4?.[currentTimeIndex] || 0
          },
          featureNames: ["ERD/ERS强度", "事件相关电位", "相干性", "频谱功率"]
        }
      };
    }
    
    return motionImageryData;
  };

  const currentData = getCurrentData();
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* 顶部标题栏 */}
      <header className="bg-gray-800 border-b border-gray-700 py-3 px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <ParadigmSelector 
            activeParadigm={activeParadigm} 
            onParadigmChange={setActiveParadigm} 
          />
          <h1 className="text-xl font-bold text-white">基于在线脑电信号解析与实时反馈协同的脑机接口训练优化平台</h1>
        </div>
        <div className="text-right text-sm text-gray-300 max-w-xs">
          {motionImageryData.researchers.map((researcher, index) => (
            <div key={index}>{researcher.name}: {researcher.email}</div>
          ))}
        </div>
      </header>
      
      {/* 主内容区域 - 模块化仪表盘布局 */}
      <main className="flex-grow flex overflow-hidden">
        {/* 左侧面板 (导航与控制区) */}
        <PanelGroup direction="horizontal" className="flex-grow h-full">
          <Panel defaultSize={25} className="bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
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
                <h2 className="text-lg font-semibold mb-3 text-white border-b border-gray-600 pb-2">
                  {isOfflineMode ? '离线数据管理' : '数据管理'}
                </h2>
                <DataManagement 
                  onDataImported={handleDataImported}
                  isOfflineMode={isOfflineMode}
                />
              </div>
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-gray-600" />
          
          {/* 中央主视觉区 (核心反馈区) */}
          <Panel defaultSize={50} className="bg-gray-900 p-4 overflow-y-auto">
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3 text-white">
                  {isOfflineMode ? '离线3D大脑源成像可视化' : '3D大脑源成像可视化'}
                </h2>
                <Brain3DVisualization 
                  brainActivity={currentData.brainActivity}
                  status={systemStatus}
                />
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3 text-white">
                  {isOfflineMode ? '离线EEG信号分析 (C3, C4通道)' : '实时EEG信号 (C3, C4通道)'}
                </h2>
                <EEGSignalChart 
                  eegData={currentData.eegData}
                  status={systemStatus}
                />
              </div>
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-gray-600" />
          
          {/* 右侧面板 (数据分析与参数区) */}
          <Panel defaultSize={25} className="bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
            <div className="space-y-6">
              <ClassificationResults 
                results={currentData.classificationResults}
                status={systemStatus}
              />
              
              <FeatureVisualization 
                featureData={currentData.featureData}
                status={systemStatus}
              />
              
              <TrainingMetrics metrics={motionImageryData.trainingMetrics} />
              
              {/* 离线模式时间控制 */}
              {isOfflineMode && processedData && (
                <div className="bg-green-900/30 border border-green-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-100 mb-3">离线数据播放控制</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max={Math.max(0, processedData.filteredData.length - 1)}
                        value={currentTimeIndex}
                        onChange={(e) => setCurrentTimeIndex(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs text-gray-300 w-16">
                        {currentTimeIndex} / {processedData.filteredData.length - 1}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentTimeIndex(Math.max(0, currentTimeIndex - 10))}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
                      >
                        后退
                      </button>
                      <button
                        onClick={() => setCurrentTimeIndex(Math.min(processedData.filteredData.length - 1, currentTimeIndex + 10))}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
                      >
                        前进
                      </button>
                    </div>
                    <div className="text-xs text-gray-400">
                      时间: {(currentTimeIndex / processedData.samplingRate).toFixed(2)}s
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3 text-sm text-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <i className="fa-solid fa-check-circle text-blue-400"></i>
                  <span className="font-medium">
                    {isOfflineMode ? '离线分析模式已激活' : '个性化特征模型已加载'}
                  </span>
                </div>
                <p className="text-gray-300 text-xs">
                  {isOfflineMode 
                    ? '正在分析导入的脑电信号数据' 
                    : '系统已应用为当前被试优化的运动想象解码算法'
                  }
                </p>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </main>
      
      {/* 底部状态栏 (系统信息区) */}
      <StatusBar 
        status={systemStatus}
        latency={isOfflineMode ? 0 : motionImageryData.systemMetrics.latency}
        storagePath={isOfflineMode ? '离线分析模式' : motionImageryData.systemMetrics.storagePath}
      />
    </div>
  );
};

export default MotionImageryTraining;