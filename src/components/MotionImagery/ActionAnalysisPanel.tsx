import React from 'react';

interface Process {
  id: number;
  name: string;
  active: boolean;
}

interface ActionAnalysisPanelProps {
  processes: Process[];
}

const ActionAnalysisPanel: React.FC<ActionAnalysisPanelProps> = ({ processes }) => {
  return (
    <div className="bg-blue-900/70 p-4 rounded-lg border border-blue-700">
      <h2 className="text-xl font-semibold mb-4 text-white">动作分析流程</h2>
      <div className="grid grid-cols-3 gap-3">
        {processes.map((process) => (
          <button
            key={process.id}
            className={`p-3 rounded-md text-sm font-medium transition-all duration-300 ${
              process.active 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {process.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionAnalysisPanel;