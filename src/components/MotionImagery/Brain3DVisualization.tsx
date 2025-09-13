import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface BrainRegionActivity {
  activation: number;
  color: string;
}

interface BrainActivityData {
  leftMotorCortex: BrainRegionActivity;
  rightMotorCortex: BrainRegionActivity;
  prefrontalCortex: BrainRegionActivity;
  noiseLevel: number;
  updateRate: number;
}

interface Brain3DVisualizationProps {
  brainActivity: BrainActivityData;
  status: string;
}

const Brain3DVisualization: React.FC<Brain3DVisualizationProps> = ({ 
  brainActivity, 
  status 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitiated, setIsInitiated] = useState(false);
  const animationRef = useRef<number | null>(null);
  const [brainModel, setBrainModel] = useState<THREE.Group | null>(null);
  const [leftMotorHotspot, setLeftMotorHotspot] = useState<THREE.Mesh | null>(null);
  const [rightMotorHotspot, setRightMotorHotspot] = useState<THREE.Mesh | null>(null);
  const [guidanceText, setGuidanceText] = useState<string | null>("请点击开始按钮开始训练");
  
  // 初始化3D场景
  useEffect(() => {
    if (!containerRef.current) return;
    
    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e1e2e);
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 150;
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 100);
    scene.add(directionalLight);
    
    // 添加控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 100;
    controls.maxDistance = 200;
    controls.enablePan = false;
    
    // 创建大脑模型
    const brainGroup = new THREE.Group();
    
    // 创建半透明头部模型
    const headGeometry = new THREE.SphereGeometry(50, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0x2d3748,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      shininess: 10
    });
    const headMesh = new THREE.Mesh(headGeometry, headMaterial);
    brainGroup.add(headMesh);
    
    // 创建大脑表面
    const brainGeometry = new THREE.SphereGeometry(45, 32, 32);
    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a5568,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      shininess: 20
    });
    const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
    brainGroup.add(brainMesh);
    
    // 创建左侧运动皮层热点
    const leftMotorGeometry = new THREE.SphereGeometry(8, 16, 16);
    const leftMotorMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(brainActivity.leftMotorCortex.color),
      transparent: true,
      opacity: 0
    });
    const leftMotorMesh = new THREE.Mesh(leftMotorGeometry, leftMotorMaterial);
    leftMotorMesh.position.set(-25, -10, 30); // 左侧运动皮层位置
    brainGroup.add(leftMotorMesh);
    setLeftMotorHotspot(leftMotorMesh);
    
    // 创建右侧运动皮层热点
    const rightMotorGeometry = new THREE.SphereGeometry(8, 16, 16);
    const rightMotorMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(brainActivity.rightMotorCortex.color),
      transparent: true,
      opacity: 0
    });
    const rightMotorMesh = new THREE.Mesh(rightMotorGeometry, rightMotorMaterial);
    rightMotorMesh.position.set(25, -10, 30); // 右侧运动皮层位置
    brainGroup.add(rightMotorMesh);
    setRightMotorHotspot(rightMotorMesh);
    
    // 创建光晕效果
    const createGlow = (position: THREE.Vector3, color: THREE.Color) => {
      const glowGeometry = new THREE.SphereGeometry(12, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.copy(position);
      brainGroup.add(glowMesh);
      return glowMesh;
    };
    
    const leftGlow = createGlow(leftMotorMesh.position, new THREE.Color(brainActivity.leftMotorCortex.color));
    const rightGlow = createGlow(rightMotorMesh.position, new THREE.Color(brainActivity.rightMotorCortex.color));
    
    scene.add(brainGroup);
    setBrainModel(brainGroup);
    
    // 添加到DOM
    containerRef.current.appendChild(renderer.domElement);
    
    // 处理窗口大小调整
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // 初始调整
    
    // 动画循环
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      // 更新控制器
      controls.update();
      
      // 轻微旋转效果
      if (brainGroup && status !== 'paused') {
        brainGroup.rotation.y += 0.001;
      }
      
      // 更新热点透明度基于激活水平
      if (leftMotorMesh && rightMotorMesh && leftGlow && rightGlow) {
        const leftActivation = brainActivity.leftMotorCortex.activation / 100;
        const rightActivation = brainActivity.rightMotorCortex.activation / 100;
        
        leftMotorMesh.material.opacity = Math.max(0.3, leftActivation);
        rightMotorMesh.material.opacity = Math.max(0.3, rightActivation);
        
        leftGlow.material.opacity = leftActivation * 0.8;
        rightGlow.material.opacity = rightActivation * 0.8;
        
        // 脉动效果增强视觉反馈
        if (status.includes('training')) {
          const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
          leftGlow.scale.setScalar(1 + leftActivation * pulse * 0.5);
          rightGlow.scale.setScalar(1 + rightActivation * pulse * 0.5);
        } else {
          leftGlow.scale.setScalar(1);
          rightGlow.scale.setScalar(1);
        }
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    setIsInitiated(true);
    
    // 清理函数
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && renderer.domElement.parentNode) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, []);
  
  // 更新大脑活动数据
  useEffect(() => {
    if (!isInitiated || !leftMotorHotspot || !rightMotorHotspot || !brainModel) return;
    
    // 根据系统状态更新引导文本
    if (status === 'ready' || status === 'completed') {
      setGuidanceText("请点击开始按钮开始训练");
    } else if (status === 'paused') {
      setGuidanceText("训练已暂停，点击继续按钮恢复");
    } else if (status.includes('training')) {
      // 模拟训练指导
      const leftActivation = brainActivity.leftMotorCortex.activation;
      const rightActivation = brainActivity.rightMotorCortex.activation;
      
      if (leftActivation > 60) {
        setGuidanceText("检测到左手想象 - 很好！保持专注");
      } else if (rightActivation > 60) {
        setGuidanceText("检测到右手想象 - 很好！保持专注");
      } else if (brainActivity.noiseLevel > 40) {
        setGuidanceText("信号质量差，请保持静止并专注");
      } else {
        setGuidanceText("请想象移动您的左手或右手");
      }
    }
    
    // 仅在训练状态下更新活动
    if (status.includes('training') && !status.includes('paused')) {
      // 这里可以添加更复杂的活动模式生成逻辑
    }
  }, [brainActivity, status, isInitiated]);
  
  // 清理动画循环
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div className="relative w-full aspect-square min-h-[300px]">
      <div ref={containerRef} className="w-full h-full"></div>
      
      {/* 状态覆盖层 */}
      {(status === 'ready' || status === 'completed' || status === 'paused') && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center p-4 rounded-lg bg-gray-800/70 max-w-xs">
            <p className="text-white text-lg font-medium">{guidanceText}</p>
          </div>
        </div>
      )}
      
      {/* 信号质量指示器 */}
      <div className="absolute bottom-4 left-4 bg-gray-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          brainActivity.noiseLevel < 20 ? 'bg-green-500' :
          brainActivity.noiseLevel < 40 ? 'bg-yellow-500' : 'bg-red-500'
        }`}></div>
        <span className="text-gray-300">信号质量: {
          brainActivity.noiseLevel < 20 ? '优秀' :
          brainActivity.noiseLevel < 40 ? '良好' :
          brainActivity.noiseLevel < 60 ? '一般' : '较差'
        }</span>
      </div>
      
      {/* 大脑区域标签 */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brainActivity.leftMotorCortex.color }}></div>
          <span className="text-gray-300">左手运动皮层</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brainActivity.rightMotorCortex.color }}></div>
          <span className="text-gray-300">右手运动皮层</span>
        </div>
      </div>
    </div>
  );
};

export default Brain3DVisualization;