import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface EEGSample {
  time: number;
  [key: string]: number;
}

interface EEGSignalChartProps {
  eegData: {
    channels: string[];
    samples: EEGSample[];
  };
  status: string;
}

const EEGSignalChart: React.FC<EEGSignalChartProps> = ({ eegData, status }) => {
  const [displayData, setDisplayData] = useState<EEGSample[]>(eegData.samples);
  const [isReceiving, setIsReceiving] = useState(false);
  
  // 通道颜色配置 - 左手(C3)为蓝色系，右手(C4)为绿色系
  const channelColors = {
    'C3': '#3B82F6', // 左手想象 - 蓝色系
    'C4': '#10B981', // 右手想象 - 绿色系
    'Fz': '#F59E0B', // 前额叶 - 金色
    'Pz': '#8B5CF6'  // 顶叶 - 紫色系
  };
  
  // 模拟实时数据更新
  useEffect(() => {
    let interval: number;
    
    // 检查是否为离线模式（通过数据长度判断）
    const isOfflineMode = eegData.samples.length > 1000;
    
    if (isOfflineMode) {
      // 离线模式：直接显示导入的数据
      setDisplayData(eegData.samples);
      setIsReceiving(false);
    } else if (status.includes('training') && !status.includes('paused')) {
      // 实时模式：模拟数据流
      setIsReceiving(true);
      interval = setInterval(() => {
        setDisplayData(prevData => {
          // 移除最旧的数据点
          const newData = [...prevData.slice(1)];
          
          // 添加新的数据点
          const lastTime = newData[newData.length - 1]?.time || 0;
          const newSample: EEGSample = { time: lastTime + 0.01 };
          
          // 为每个通道生成新的模拟数据
          eegData.channels.forEach(channel => {
            // 基础波形 + 噪声
            const baseAmplitude = channel === 'C3' ? 50 : 40;
            const baseFrequency = 2; // Hz
            const noise = (Math.random() - 0.5) * 10;
            
            // 添加一些变化以模拟大脑活动
            const brainActivity = status.includes('training') ? 
              (Math.random() * 20 * Math.sin(lastTime * 0.5)) : 0;
              
            newSample[channel] = Math.sin(lastTime * baseFrequency) * baseAmplitude + noise + brainActivity;
          });
          
          newData.push(newSample);
          return newData;
        });
      }, 10);
    } else {
      setIsReceiving(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, eegData.channels, eegData.samples.length]);
  
  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-300">
          小波自适应滤波后的EEG信号 ({eegData.channels.join(', ')})
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            isReceiving ? 'bg-green-900/50 text-green-400' : 
            eegData.samples.length > 1000 ? 'bg-blue-900/50 text-blue-400' : 'bg-gray-700 text-gray-400'
          }`}>
            {isReceiving ? '实时接收中' : 
             eegData.samples.length > 1000 ? '离线数据' : '已暂停'}
          </span>
          <span className="text-xs text-gray-400">
            采样率: {eegData.samples.length > 1000 ? '1000 Hz' : '1000 Hz'}
          </span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="calc(100% - 2rem)">
        <LineChart 
          data={displayData} 
          margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
        >
          <defs>
            {/* 添加渐变效果 */}
            {eegData.channels.map(channel => (
              <linearGradient key={`gradient-${channel}`} id={`gradient-${channel}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={channelColors[channel as keyof typeof channelColors]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={channelColors[channel as keyof typeof channelColors]} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#6B7280" 
            tickFormatter={(time) => `${time.toFixed(1)}s`}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="#6B7280" 
            domain={[-100, 100]} 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}μV`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              borderColor: '#374151',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            itemStyle={{ color: '#F9FAFB' }}
            labelStyle={{ color: '#D1D5DB', fontWeight: 'bold' }}
            formatter={(value) => [`${value.toFixed(2)}μV`, '信号强度']}
          />
          
          {eegData.channels.map(channel => (
            <Line
              key={channel}
              type="monotone"
              dataKey={channel}
              stroke={channelColors[channel as keyof typeof channelColors]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              name={channel}
              animationDuration={0} // 实时数据不需要动画
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      
      {/* 信号状态指示器 */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          {eegData.channels.map(channel => (
            <div key={channel} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channelColors[channel as keyof typeof channelColors] }}></div>
              <span>{channel}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${
            isReceiving ? 'bg-green-500 animate-pulse' : 
            eegData.samples.length > 1000 ? 'bg-blue-500' : 'bg-gray-600'
          }`}></div>
          <span>
            {isReceiving ? '实时更新中' : 
             eegData.samples.length > 1000 ? '离线数据' : '已暂停'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EEGSignalChart;