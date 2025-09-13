import React from 'react';
import { Play, RotateCcw, Cog, HelpCircle } from 'lucide-react';

const TrainingControls: React.FC = () => {
  return (
    <div className="flex justify-between items-center">
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors duration-300 flex items-center gap-2">
        <Play size={18} />
        开始训练
      </button>
      <div className="flex gap-3">
        <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors duration-300">
          <RotateCcw size={18} />
        </button>
        <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors duration-300">
          <Cog size={18} />
        </button>
        <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors duration-300">
          <HelpCircle size={18} />
        </button>
      </div>
    </div>
  );
};

export default TrainingControls;