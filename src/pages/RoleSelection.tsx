import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';

export default function RoleSelection() {
  const navigate = useNavigate();
  const { setUserRole } = useContext(AuthContext);

  const handleRoleSelect = (role: string) => {
    setUserRole(role);
    if (role === 'researcher') {
      navigate('/researcher-dashboard');
    } else {
      navigate('/subject-training');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-white/20">
        <h1 className="text-2xl font-bold text-white text-center mb-8">选择您的角色</h1>
        
        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect('researcher')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center gap-3 border border-blue-500/30"
          >
            <i className="fa-solid fa-user-gear text-xl"></i>
            <span>主试/研究人员</span>
          </button>
          
          <button
            onClick={() => handleRoleSelect('subject')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center gap-3 border border-indigo-500/30"
          >
            <i className="fa-solid fa-user text-xl"></i>
            <span>被试/训练者</span>
          </button>
        </div>
        
        <p className="text-blue-200 text-sm text-center mt-8">
          请选择您在本次实验中的角色，系统将为您提供相应的界面和功能
        </p>
      </div>
    </div>
  );
}