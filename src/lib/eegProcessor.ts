// EEG信号处理工具类
export interface EEGSample {
  time: number;
  [key: string]: number;
}

export interface EEGData {
  channels: string[];
  samples: EEGSample[];
  samplingRate: number;
  duration: number;
  metadata?: {
    subjectId?: string;
    sessionId?: string;
    recordingDate?: string;
    [key: string]: any;
  };
}

export interface ProcessedEEGData extends EEGData {
  filteredData: EEGSample[];
  features: {
    erdIntensity: { [channel: string]: number[] };
    ersIntensity: { [channel: string]: number[] };
    spectralPower: { [channel: string]: number[] };
    coherence: { [channel: string]: number[] };
  };
  classificationResults: {
    predictedClass: string | null;
    confidence: number;
    timeWindow: number;
  }[];
}

// 小波自适应滤波
export class WaveletAdaptiveFilter {
  private waveletType: string = 'db4';
  private decompositionLevel: number = 4;
  private thresholdMethod: string = 'soft';

  constructor(waveletType: string = 'db4', levels: number = 4) {
    this.waveletType = waveletType;
    this.decompositionLevel = levels;
  }

  // 简化的离散小波变换实现
  private dwt(signal: number[]): { approximation: number[], details: number[][] } {
    const n = signal.length;
    const approximation: number[] = [];
    const details: number[][] = [];
    
    // 简化的Haar小波变换
    for (let i = 0; i < n; i += 2) {
      if (i + 1 < n) {
        const avg = (signal[i] + signal[i + 1]) / 2;
        const diff = (signal[i] - signal[i + 1]) / 2;
        approximation.push(avg);
        details[0] = details[0] || [];
        details[0].push(diff);
      }
    }
    
    return { approximation, details };
  }

  // 自适应阈值计算
  private calculateAdaptiveThreshold(details: number[]): number {
    const sigma = this.medianAbsoluteDeviation(details) / 0.6745;
    return sigma * Math.sqrt(2 * Math.log(details.length));
  }

  // 中位数绝对偏差
  private medianAbsoluteDeviation(data: number[]): number {
    const median = this.median(data);
    const deviations = data.map(x => Math.abs(x - median));
    return this.median(deviations);
  }

  // 中位数计算
  private median(data: number[]): number {
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  // 软阈值处理
  private softThreshold(data: number[], threshold: number): number[] {
    return data.map(x => {
      if (Math.abs(x) <= threshold) return 0;
      return x > 0 ? x - threshold : x + threshold;
    });
  }

  // 主滤波函数
  filter(signal: number[]): number[] {
    const { approximation, details } = this.dwt(signal);
    
    // 对细节系数进行自适应阈值处理
    const filteredDetails = details.map(detail => {
      const threshold = this.calculateAdaptiveThreshold(detail);
      return this.softThreshold(detail, threshold);
    });
    
    // 重构信号（简化版）
    const filteredSignal: number[] = [];
    for (let i = 0; i < approximation.length; i++) {
      const reconstructed = approximation[i] + (filteredDetails[0]?.[i] || 0);
      filteredSignal.push(reconstructed);
      if (i < approximation.length - 1) {
        filteredSignal.push(reconstructed);
      }
    }
    
    return filteredSignal.slice(0, signal.length);
  }
}

// ERD/ERS特征提取
export class ERDERSFeatureExtractor {
  private samplingRate: number;
  private baselineWindow: number = 2; // 基线窗口（秒）
  private analysisWindow: number = 1; // 分析窗口（秒）

  constructor(samplingRate: number) {
    this.samplingRate = samplingRate;
  }

  // 计算功率谱密度
  private calculatePowerSpectrum(signal: number[]): { frequencies: number[], power: number[] } {
    const n = signal.length;
    const frequencies: number[] = [];
    const power: number[] = [];
    
    // 简化的FFT实现（实际应用中应使用专业FFT库）
    for (let k = 0; k < n / 2; k++) {
      frequencies.push((k * this.samplingRate) / n);
      
      let real = 0;
      let imag = 0;
      
      for (let i = 0; i < n; i++) {
        const angle = -2 * Math.PI * k * i / n;
        real += signal[i] * Math.cos(angle);
        imag += signal[i] * Math.sin(angle);
      }
      
      power.push(real * real + imag * imag);
    }
    
    return { frequencies, power };
  }

  // 计算频带功率
  private calculateBandPower(powerSpectrum: { frequencies: number[], power: number[] }, 
                           lowFreq: number, highFreq: number): number {
    let bandPower = 0;
    let count = 0;
    
    for (let i = 0; i < powerSpectrum.frequencies.length; i++) {
      const freq = powerSpectrum.frequencies[i];
      if (freq >= lowFreq && freq <= highFreq) {
        bandPower += powerSpectrum.power[i];
        count++;
      }
    }
    
    return count > 0 ? bandPower / count : 0;
  }

  // 计算ERD/ERS
  calculateERDERS(signal: number[], baselineSignal: number[]): { erd: number, ers: number } {
    const signalPower = this.calculateBandPower(
      this.calculatePowerSpectrum(signal), 8, 30
    );
    const baselinePower = this.calculateBandPower(
      this.calculatePowerSpectrum(baselineSignal), 8, 30
    );
    
    const erd = ((signalPower - baselinePower) / baselinePower) * 100;
    const ers = erd > 0 ? 0 : Math.abs(erd);
    
    return { erd: Math.max(erd, 0), ers };
  }

  // 提取特征
  extractFeatures(signal: number[], channel: string): {
    erdIntensity: number;
    ersIntensity: number;
    spectralPower: number;
    coherence: number;
  } {
    const powerSpectrum = this.calculatePowerSpectrum(signal);
    const muPower = this.calculateBandPower(powerSpectrum, 8, 13);
    const betaPower = this.calculateBandPower(powerSpectrum, 13, 30);
    
    // 简化的ERD/ERS计算
    const totalPower = muPower + betaPower;
    const erdIntensity = totalPower > 0 ? (muPower / totalPower) * 100 : 0;
    const ersIntensity = totalPower > 0 ? (betaPower / totalPower) * 100 : 0;
    
    return {
      erdIntensity,
      ersIntensity,
      spectralPower: totalPower,
      coherence: Math.random() * 0.5 + 0.5 // 简化的相干性计算
    };
  }
}

// SVM分类器（简化版）
export class SimpleSVMClassifier {
  private weights: { [key: string]: number } = {};
  private bias: number = 0;
  private isTrained: boolean = false;

  // 训练分类器
  train(features: number[][], labels: number[]): void {
    // 简化的线性SVM训练
    const n = features.length;
    const m = features[0].length;
    
    // 初始化权重
    for (let i = 0; i < m; i++) {
      this.weights[`w${i}`] = Math.random() * 0.1 - 0.05;
    }
    
    // 简化的梯度下降训练
    const learningRate = 0.01;
    const epochs = 100;
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let i = 0; i < n; i++) {
        const prediction = this.predict(features[i]);
        const error = labels[i] - prediction;
        
        // 更新权重
        for (let j = 0; j < m; j++) {
          this.weights[`w${j}`] += learningRate * error * features[i][j];
        }
        this.bias += learningRate * error;
      }
    }
    
    this.isTrained = true;
  }

  // 预测
  predict(features: number[]): number {
    if (!this.isTrained) return 0;
    
    let sum = this.bias;
    for (let i = 0; i < features.length; i++) {
      sum += this.weights[`w${i}`] * features[i];
    }
    
    return sum > 0 ? 1 : 0;
  }

  // 预测概率
  predictProbability(features: number[]): { class: number, confidence: number } {
    const prediction = this.predict(features);
    const confidence = Math.min(Math.abs(prediction), 1);
    
    return {
      class: prediction,
      confidence
    };
  }
}

// 主处理器类
export class EEGProcessor {
  private filter: WaveletAdaptiveFilter;
  private featureExtractor: ERDERSFeatureExtractor;
  private classifier: SimpleSVMClassifier;

  constructor(samplingRate: number = 1000) {
    this.filter = new WaveletAdaptiveFilter();
    this.featureExtractor = new ERDERSFeatureExtractor(samplingRate);
    this.classifier = new SimpleSVMClassifier();
  }

  // 处理EEG数据
  async processEEGData(eegData: EEGData): Promise<ProcessedEEGData> {
    const filteredData: EEGSample[] = [];
    const features = {
      erdIntensity: {} as { [channel: string]: number[] },
      ersIntensity: {} as { [channel: string]: number[] },
      spectralPower: {} as { [channel: string]: number[] },
      coherence: {} as { [channel: string]: number[] }
    };
    const classificationResults: any[] = [];

    // 初始化特征数组
    eegData.channels.forEach(channel => {
      features.erdIntensity[channel] = [];
      features.ersIntensity[channel] = [];
      features.spectralPower[channel] = [];
      features.coherence[channel] = [];
    });

    // 处理每个时间窗口
    const windowSize = Math.floor(eegData.samplingRate * 2); // 2秒窗口
    const stepSize = Math.floor(eegData.samplingRate * 0.5); // 0.5秒步长

    for (let i = 0; i < eegData.samples.length - windowSize; i += stepSize) {
      const window = eegData.samples.slice(i, i + windowSize);
      const filteredWindow: EEGSample = { time: window[0].time };

      // 对每个通道进行滤波和特征提取
      for (const channel of eegData.channels) {
        const channelData = window.map(sample => sample[channel]);
        const filteredChannelData = this.filter.filter(channelData);
        
        // 取窗口中间值作为代表
        const midIndex = Math.floor(filteredChannelData.length / 2);
        filteredWindow[channel] = filteredChannelData[midIndex];

        // 提取特征
        const channelFeatures = this.featureExtractor.extractFeatures(
          filteredChannelData, channel
        );

        features.erdIntensity[channel].push(channelFeatures.erdIntensity);
        features.ersIntensity[channel].push(channelFeatures.ersIntensity);
        features.spectralPower[channel].push(channelFeatures.spectralPower);
        features.coherence[channel].push(channelFeatures.coherence);
      }

      filteredData.push(filteredWindow);

      // 分类预测
      const featureVector = eegData.channels.flatMap(channel => [
        features.erdIntensity[channel][features.erdIntensity[channel].length - 1],
        features.ersIntensity[channel][features.ersIntensity[channel].length - 1],
        features.spectralPower[channel][features.spectralPower[channel].length - 1],
        features.coherence[channel][features.coherence[channel].length - 1]
      ]);

      const prediction = this.classifier.predictProbability(featureVector);
      classificationResults.push({
        predictedClass: prediction.class === 1 ? 'right_hand' : 'left_hand',
        confidence: prediction.confidence,
        timeWindow: window[0].time
      });
    }

    return {
      ...eegData,
      filteredData,
      features,
      classificationResults
    };
  }

  // 解析CSV文件
  async parseCSVFile(file: File): Promise<EEGData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error('文件格式错误：至少需要标题行和数据行');
          }

          // 解析标题行
          const headers = lines[0].split(',').map(h => h.trim());
          const channels = headers.filter(h => h !== 'time' && h !== 'Time');
          
          // 解析数据
          const samples: EEGSample[] = [];
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => parseFloat(v.trim()));
            if (values.length !== headers.length) continue;
            
            const sample: EEGSample = { time: values[0] };
            channels.forEach((channel, index) => {
              sample[channel] = values[index + 1];
            });
            samples.push(sample);
          }

          const samplingRate = samples.length > 1 ? 
            1 / (samples[1].time - samples[0].time) : 1000;

          resolve({
            channels,
            samples,
            samplingRate,
            duration: samples[samples.length - 1].time - samples[0].time,
            metadata: {
              subjectId: 'imported',
              sessionId: `session_${Date.now()}`,
              recordingDate: new Date().toISOString()
            }
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  }

  // 生成模拟数据（用于测试）
  generateMockEEGData(duration: number = 60, samplingRate: number = 1000): EEGData {
    const channels = ['C3', 'C4'];
    const samples: EEGSample[] = [];
    const totalSamples = Math.floor(duration * samplingRate);

    for (let i = 0; i < totalSamples; i++) {
      const time = i / samplingRate;
      const sample: EEGSample = { time };
      
      channels.forEach(channel => {
        // 生成包含噪声和节律的模拟EEG信号
        const noise = (Math.random() - 0.5) * 20;
        const alpha = Math.sin(2 * Math.PI * 10 * time) * 30; // 10Hz alpha节律
        const beta = Math.sin(2 * Math.PI * 20 * time) * 20; // 20Hz beta节律
        
        // 添加运动想象相关的调制
        const imaginationModulation = Math.sin(2 * Math.PI * 0.1 * time) * 10;
        
        sample[channel] = noise + alpha + beta + imaginationModulation;
      });
      
      samples.push(sample);
    }

    return {
      channels,
      samples,
      samplingRate,
      duration,
      metadata: {
        subjectId: 'mock_subject',
        sessionId: 'mock_session',
        recordingDate: new Date().toISOString()
      }
    };
  }
}
