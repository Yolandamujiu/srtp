export const motionImageryData = {
  // 系统信息
  systemName: "基于在线脑电信号解析与实时反馈协同的脑机接口训练优化平台",
  researchers: [
    { name: "史晓", email: "3230100394@zju.edu.cn" }
  ],
  
  // 被试信息
  subject: {
    id: "BCI-2025-001",
    name: "史晓",
    age: 20,
    gender: "女",
    handedness: "右利手",
    experimentDate: "2025-09-06",
    sessionNumber: 8,
    lastTrainingDate: "2025-09-05"
  },
  
  // 系统指标
  systemMetrics: {
    latency: 125, // 毫秒
    storagePath: "D:/BCI-Data/Subject_BCI-2025-001/Session_8",
    samplingRate: 1000, // Hz
    activeChannels: 16
  },
  
  // 大脑活动数据 - 用于3D可视化
  brainActivity: {
    leftMotorCortex: { activation: 0, color: "#3B82F6" }, // 左手想象 - 蓝色系
    rightMotorCortex: { activation: 0, color: "#10B981" }, // 右手想象 - 绿色系
    prefrontalCortex: { activation: 0, color: "#F59E0B" }, // 专注/有效信号 - 金色
    noiseLevel: 15, // 噪声水平百分比
    updateRate: 100 // 刷新率(ms)
  },
  
  // EEG信号数据
  eegData: {
    channels: ["C3", "C4"],
    samples: Array.from({ length: 100 }, (_, i) => ({
      time: i / 100,
      C3: Math.sin(i * 0.1) * 50 + Math.random() * 10,
      C4: Math.cos(i * 0.1) * 40 + Math.random() * 10
    }))
  },
  
  // 分类结果
  classificationResults: {
    currentClass: null,
    confidence: 0,
    recentClasses: [],
    accuracy: 0,
    confusionMatrix: {
      leftHand: { trueLeft: 0, falseRight: 0 },
      rightHand: { trueRight: 0, falseLeft: 0 }
    }
  },
  
  // 特征数据
  featureData: {
    leftHandFeatures: {
      erdIntensity: 0,
      eventRelatedPotential: 0,
      coherence: 0,
      spectralPower: 0
    },
    rightHandFeatures: {
      erdIntensity: 0,
      eventRelatedPotential: 0,
      coherence: 0,
      spectralPower: 0
    },
    featureNames: ["ERD/ERS强度", "事件相关电位", "相干性", "频谱功率"]
  },
  
  // 训练指标
  trainingMetrics: {
    focusLevel: 0,
    accuracy: 0,
    sessionProgress: 0,
    currentTask: "准备就绪",
    difficulty: "中等",
    trainingTime: "00:00:00",
    trialCount: 0,
    successfulTrials: 0,
    averageFeedbackDelay: 125 // 毫秒
  }
};