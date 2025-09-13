import React, { useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface FeatureData {
  erdIntensity: number;
  eventRelatedPotential: number;
  coherence: number;
  spectralPower: number;
}

interface FeatureVisualizationProps {
  featureData: {
    leftHandFeatures: FeatureData;
    rightHandFeatures: FeatureData;
    featureNames: string[];
  };
  status: string;
}

const FeatureVisualization: React.FC<FeatureVisualizationProps> = ({ 
  featureData, 
  status 
}) => {
  // 转换数据格式以适应雷达图
  const [radarData, setRadarData] = useState([
    {
      name: '特征',
      左手: 0,
      右手: 0,
    }
  ]);
  
  // 模拟特征值更新
  useEffect(() => {
    let interval: number;
    
    if (status.includes('training') && !status.includes('paused')) {
      interval = setInterval(() => {
        // 转换数据格式
        const formattedData = featureData.featureNames.map((name, index) => {
          const featureKey = index === 0 ? 'erdIntensity' : 
                            index === 1 ? 'eventRelatedPotential' :
                            index === 2 ? 'coherence' : 'spectralPower';
                            
          return {
            name,
            左手: featureData.leftHandFeatures[featureKey as keyof FeatureData],右手: featureData.rightHandFeatures[featureKey as keyof FeatureData]
          };
        });
        
        setRadarData(formattedData);
      }, 1000);
    } else {
      // 初始数据
      const formattedData = featureData.featureNames.map((name, index) => {
        const featureKey = index === 0 ? 'erdIntensity' : 
                          index === 1 ? 'eventRelatedPotential' :
                          index === 2 ? 'coherence' : 'spectralPower';
                          
        return {
          name,
          左手: featureData.leftHandFeatures[featureKey as keyof FeatureData],
          右手: featureData.rightHandFeatures[featureKey as keyof FeatureData]
        };
      });
      
      setRadarData(formattedData);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, featureData]);
  
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-white">特征值可视化</h2>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#4B5563" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
            <Radar
              name="左手"
              dataKey="左手"
              stroke="#3B82F6" // 左手想象 - 蓝色系
              fill="#3B82F6"
              fillOpacity={0.3}
              animationDuration={500}
            />
            <Radar
              name="右手"
              dataKey="右手"
              stroke="#10B981" // 右手想象 - 绿色系
              fill="#10B981"
              fillOpacity={0.3}
              animationDuration={500}
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
              formatter={(value) => [`${value.toFixed(1)}`, '特征值']}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="circle"
              iconSize={8}
              textStyle={{ fill: '#D1D5DB', fontSize: 12 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* 特征值表格 */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 text-gray-400">特征名称</th>
              <th className="text-right py-2 text-blue-400">左手</th>
              <th className="text-right py-2 text-green-400">右手</th>
              <th className="text-right py-2 text-gray-400">差异</th>
            </tr>
          </thead>
          <tbody>
            {radarData.map((feature, index) => (
              <tr key={index} className="border-b border-gray-800 hover:bg-gray-700/30 transition-colors">
                <td className="py-2 text-gray-300">{feature.name}</td>
                <td className="py-2 text-right font-medium text-blue-400">{feature.左手.toFixed(1)}</td>
                <td className="py-2 text-right font-medium text-green-400">{feature.右手.toFixed(1)}</td>
                <td className="py-2 text-right">
                  {Math.abs(feature.左手 - feature.右手).toFixed(1)}
                  <span className={`text-xs ml-1 ${
                    feature.左手 > feature.右手 ? 'text-blue-400' : 
                    feature.右手 > feature.左手 ? 'text-green-400' : 'text-gray-500'
                  }`}>
                    {feature.左手 > feature.右手 ? '↑' : feature.右手 > feature.左手 ? '↓' : '='}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 italic text-center">
        特征值范围: 0-100，值越高表示该特征越明显
      </div>
    </div>
  );
};

export default FeatureVisualization;