import React from 'react';

interface BrainRegion {
  id: number;
  name: string;
  activation: number;
  imageUrl: string;
}

interface BrainImagingProps {
  brainRegions: BrainRegion[];
}

const BrainImaging: React.FC<BrainImagingProps> = ({ brainRegions }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white">大脑源成像</h2>
      <div className="grid grid-cols-2 gap-6">
        {brainRegions.map((region) => (
          <div key={region.id} className="flex flex-col items-center">
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-blue-500 mb-2">
              <div className="w-full h-full bg-blue-900 flex items-center justify-center">
                <img 
                  src={region.imageUrl} 
                  alt={region.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center pb-2">
                <span className="text-white font-bold">{region.activation}%</span>
              </div>
            </div>
            <h3 className="text-white font-medium">{region.name}</h3>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${region.activation}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrainImaging;