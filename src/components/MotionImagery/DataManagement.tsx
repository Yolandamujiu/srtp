import React, { useState } from 'react';
import { Upload, Download, FolderOpen, Settings, FileText, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { EEGProcessor, EEGData } from '@/lib/eegProcessor';

interface DataManagementProps {
  onDataImported?: (data: EEGData) => void;
  isOfflineMode?: boolean;
}

const DataManagement: React.FC<DataManagementProps> = ({ 
  onDataImported, 
  isOfflineMode = false 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const eegProcessor = new EEGProcessor();

  const handleImportEEG = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.edf,.csv,.mat,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsProcessing(true);
        toast.info(`正在处理文件: ${file.name}`);
        
        try {
          let eegData: EEGData;
          
          if (file.name.endsWith('.csv')) {
            eegData = await eegProcessor.parseCSVFile(file);
          } else {
            // 对于其他格式，生成模拟数据
            toast.warning('当前仅支持CSV格式，将使用模拟数据');
            eegData = eegProcessor.generateMockEEGData(60, 1000);
          }
          
          // 存储到sessionStorage
          sessionStorage.setItem('importedEEGData', JSON.stringify(eegData));
          
          // 通知父组件
          if (onDataImported) {
            onDataImported(eegData);
          }
          
          toast.success('脑电信号导入成功！');
        } catch (error) {
          console.error('文件处理错误:', error);
          toast.error('文件处理失败，请检查文件格式');
        } finally {
          setIsProcessing(false);
        }
      }
    };
    input.click();
  };
  
  const handleLoadData = () => {
    // 模拟加载历史数据
    toast.info('正在加载历史数据...');
    setTimeout(() => {
      toast.success('历史数据加载完成');
    }, 1000);
  };
  
  const handleSaveData = () => {
    // 模拟保存当前数据
    toast.info('正在保存当前数据...');
    setTimeout(() => {
      toast.success('当前数据保存成功');
    }, 1000);
  };
  
  const handleOpenFolder = () => {
    toast.info('正在打开数据文件夹...');
  };
  
  const handleSettings = () => {
    toast.info('系统设置功能即将推出');
  };

  const handleGenerateMockData = () => {
    setIsProcessing(true);
    toast.info('正在生成模拟数据...');
    
    setTimeout(() => {
      const mockData = eegProcessor.generateMockEEGData(60, 1000);
      sessionStorage.setItem('importedEEGData', JSON.stringify(mockData));
      
      if (onDataImported) {
        onDataImported(mockData);
      }
      
      toast.success('模拟数据生成完成！');
      setIsProcessing(false);
    }, 2000);
  };
  
  return (
    <div className="space-y-3">
      {isOfflineMode && (
        <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-blue-100 text-sm">
            <Brain size={16} />
            <span className="font-medium">离线分析模式</span>
          </div>
          <p className="text-gray-300 text-xs mt-1">
            导入脑电信号进行离线分析和可视化
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={handleImportEEG}
          disabled={isProcessing}
          className="flex items-center gap-2 justify-center bg-green-700 hover:bg-green-600 disabled:bg-gray-600 text-white py-2 px-3 rounded transition-colors text-sm"
        >
          <Upload size={16} />
          {isProcessing ? '处理中...' : '导入EEG文件'}
        </button>
        
        <button 
          onClick={handleGenerateMockData}
          disabled={isProcessing}
          className="flex items-center gap-2 justify-center bg-purple-700 hover:bg-purple-600 disabled:bg-gray-600 text-white py-2 px-3 rounded transition-colors text-sm"
        >
          <Brain size={16} />
          {isProcessing ? '生成中...' : '生成模拟数据'}
        </button>
        
        <button 
          onClick={handleLoadData}
          className="flex items-center gap-2 justify-center bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded transition-colors text-sm"
        >
          <FileText size={16} />
          加载历史数据
        </button>
        
        <button 
          onClick={handleSaveData}
          className="flex items-center gap-2 justify-center bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded transition-colors text-sm"
        >
          <Download size={16} />
          保存当前数据
        </button>
        
        <button 
          onClick={handleOpenFolder}
          className="flex items-center gap-2 justify-center bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded transition-colors text-sm"
        >
          <FolderOpen size={16} />
          打开数据文件夹
        </button>
        
        <button 
          onClick={handleSettings}
          className="flex items-center gap-2 justify-center bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded transition-colors text-sm"
        >
          <Settings size={16} />
          系统设置
        </button>
      </div>
      
      <div className="text-xs text-gray-400 mt-2">
        <p>支持格式：CSV, EDF, MAT, TXT</p>
        <p>建议采样率：1000Hz，通道：C3, C4</p>
      </div>
    </div>
  );
};

export default DataManagement;