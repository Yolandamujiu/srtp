import React, { useEffect, useState } from 'react';
import { Server, Database, Clock, HardDrive, Wifi } from 'lucide-react';

interface StatusBarProps {
  status: string;
  latency: number;
  storagePath: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ 
  status, 
  latency, 
  storagePath 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online');
  
  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // 模拟连接状态检查
  useEffect(() => {
    const interval = setInterval(() => {
      // 随机模拟连接状态变化（实际应用中应该基于真实连接状态）
      const isOnline = Math.random() > 0.05; // 95%概率在线
      setConnectionStatus(isOnline ? 'online' : 'offline');
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 格式化当前时间
  const formattedTime = currentTime.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  // 格式化日期
  const formattedDate = currentTime.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  // 系统状态文本
  const getStatusText = () => {
    if (status === 'ready') return '就绪模式 - 等待开始';
    if (status === 'acquiring') return '在线模式 - 数据采集中';
    if (status === 'training-with-feedback') return '训练模式 - 有反馈训练中';
    if (status === 'training-without-feedback') return '训练模式 - 无反馈训练中';
    if (status === 'paused') return '已暂停 - 点击继续';
    if (status === 'completed') return '实验已结束 - 数据已保存';
    return '未知状态';
  };
  
  // 存储路径简短显示
  const getShortStoragePath = () => {
    if (storagePath.length <= 30) return storagePath;
    return '...' + storagePath.slice(-27);
  };
  
  return (
    <div className="bg-gray-800 border-t border-gray-700 py-2 px-4 text-xs text-gray-300 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
          } ${connectionStatus === 'online' ? 'animate-pulse' : ''}`}></div>
          <span>{connectionStatus === 'online' ? '在线' : '离线'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Server size={14} className="text-gray-500" />
          <span>{getStatusText()}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-500" />
          <span>{formattedDate} {formattedTime}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Wifi size={14} className="text-gray-500" />
          <span>延迟: {latency} ms</span>
        </div>
        
        <div className="flex items-center gap-2 group relative">
          <HardDrive size={14} className="text-gray-500" />
          <span className="truncate max-w-[180px]">{getShortStoragePath()}</span>
          <div className="absolute bottom-full right-0 mb-1 bg-gray-900 px-3 py-1 rounded text-left whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {storagePath}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;