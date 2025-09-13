import { Link } from "react-router-dom";
import { useState } from "react";
import { Upload, Brain, Zap } from "lucide-react";

export default function Home() {
  const [isImporting, setIsImporting] = useState(false);

  const handleImportEEG = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.edf,.csv,.mat,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsImporting(true);
        // 将文件信息存储到sessionStorage，供训练页面使用
        sessionStorage.setItem('importedEEGFile', JSON.stringify({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }));
        // 模拟文件处理
        setTimeout(() => {
          setIsImporting(false);
          // 跳转到训练页面，并传递离线模式标识
          window.location.href = '/motion-imagery-training?mode=offline';
        }, 2000);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Brain className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">运动想象训练平台</h1>
          <p className="text-gray-600 text-lg">
            实时动作分析与大脑源成像反馈系统，提升运动想象训练效果
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            to="/motion-imagery-training"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-300 inline-flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            实时训练模式
          </Link>
          
          <button
            onClick={handleImportEEG}
            disabled={isImporting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-300 inline-flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {isImporting ? '正在处理文件...' : '导入离线脑电信号'}
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>支持格式：EDF, CSV, MAT, TXT</p>
          <p>支持通道：C3, C4 及多通道数据</p>
        </div>
      </div>
    </div>
  );
}