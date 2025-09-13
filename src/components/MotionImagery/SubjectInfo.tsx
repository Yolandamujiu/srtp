import React from 'react';
import { User, CreditCard, Calendar, Clock } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  age: number;
  gender: string;
  handedness: string;
  experimentDate: string;
  sessionNumber: number;
  lastTrainingDate?: string;
}

interface SubjectInfoProps {
  subject: Subject;
}

const SubjectInfo: React.FC<SubjectInfoProps> = ({ subject }) => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
        <User size={18} />
        被试信息
      </h2>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 flex items-center gap-2">
            <CreditCard size={14} />
            被试ID
          </span>
          <span className="text-white font-medium">{subject.id}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">姓名</span>
          <span className="text-white">{subject.name}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">年龄</span>
            <span className="text-white">{subject.age}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">性别</span>
            <span className="text-white">{subject.gender}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">利手</span>
          <span className="text-white">{subject.handedness}</span>
        </div>
        
        <div className="pt-2 border-t border-gray-700 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 flex items-center gap-2">
              <Calendar size={14} />
              实验日期
            </span>
            <span className="text-white">{subject.experimentDate}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400 flex items-center gap-2">
              <Clock size={14} />
              实验次数
            </span>
            <span className="text-white">第 {subject.sessionNumber} 次</span>
          </div>
          
          {subject.lastTrainingDate && (
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>上次训练</span>
              <span>{subject.lastTrainingDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectInfo;