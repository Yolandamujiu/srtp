import React from 'react';
import { Upload, Download, FolderOpen, Settings } from 'lucide-react';
import { toast } from 'sonner';

const DataManagement: React.FC = () => {
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
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <button 
        onClick={handleLoadData}
        className="flex items-center gap-2 justify-center bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded transition-colors text-sm"
      >
        <Upload size={16} />
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
  );
};

export default DataManagement;