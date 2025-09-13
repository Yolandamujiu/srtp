import React from 'react';

interface Researcher {
  name: string;
  email: string;
}

interface HeaderProps {
  systemName: string;
  logo: string;
  researchers: Researcher[];
}

const Header: React.FC<HeaderProps> = ({ systemName, logo, researchers }) => {
  return (
    <header className="bg-gray-800 py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
          <img 
            src={logo} 
            alt="系统logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-white">{systemName}</h1>
      </div>
      
      <div className="text-right text-sm text-gray-300">
        {researchers.map((researcher, index) => (
          <div key={index}>{researcher.name}: {researcher.email}</div>
        ))}
      </div>
    </header>
  );
};

export default Header;