import React from 'react';

interface ParadigmSelectorProps {
  activeParadigm: string;
  onParadigmChange: (paradigm: string) => void;
}

const ParadigmSelector: React.FC<ParadigmSelectorProps> = ({ 
  activeParadigm, 
  onParadigmChange 
}) => {
  const paradigms = [
    { id: 'motion-imagery', name: '运动想象' },
    { id: 'emotion', name: '情绪（前额叶）', disabled: true },
    { id: 'fatigue', name: '疲劳监测', disabled: true },
    { id: 'motor-execution', name: '运动执行', disabled: true },
  ];
  
  return (
    <div className="bg-gray-700 rounded-lg p-1 inline-flex">
      {paradigms.map((paradigm) => (
        <button
          key={paradigm.id}
          onClick={() => !paradigm.disabled && onParadigmChange(paradigm.id)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            paradigm.disabled 
              ? 'text-gray-500 cursor-not-allowed' 
              : activeParadigm === paradigm.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-600'
          }`}
          disabled={paradigm.disabled}
        >
          {paradigm.name}
        </button>
      ))}
    </div>
  );
};

export default ParadigmSelector;