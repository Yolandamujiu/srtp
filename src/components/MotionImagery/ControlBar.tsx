import React from 'react';
import { SkipBack, Pause, SkipForward, Volume2 } from 'lucide-react';

const ControlBar: React.FC = () => {
  return (
    <div className="bg-gray-800 py-3 px-6 border-t border-gray-700">
      <div className="flex items-center justify-between">
        <div className="text-gray-400 text-sm">00:02:35</div>
        
        <div className="flex-grow mx-6">
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full relative" style={{ width: '35%' }}>
              <div className="absolute w-3 h-3 bg-white rounded-full -mt-0.75 left-full transform -translate-x-1/2"></div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white transition-colors">
            <SkipBack size={20} />
          </button>
          <button className="text-white bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center">
            <Pause size={20} />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <SkipForward size={20} />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Volume2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlBar;