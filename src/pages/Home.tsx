import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl max-w-md w-full mx-4 border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-6">脑机接口训练平台</h1>
        <p className="text-blue-100 mb-8">
          基于实时脑电信号解析的运动想象训练系统
        </p>
        <Link 
          to="/role-selection"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 inline-block"
        >
          进入系统
        </Link>
      </div>
    </div>
  );
}