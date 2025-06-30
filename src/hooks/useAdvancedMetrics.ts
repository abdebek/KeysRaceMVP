import { useState, useEffect, useRef } from 'react';

interface KeystrokeData {
  timestamp: number;
  key: string;
  isCorrect: boolean;
  timeSinceLastKey: number;
}

interface AdvancedMetrics {
  consistency: number;
  burstSpeed: number;
  rhythm: number;
  errorRate: number;
}

export function useAdvancedMetrics() {
  const [keystrokeHistory, setKeystrokeHistory] = useState<KeystrokeData[]>([]);
  const [metrics, setMetrics] = useState<AdvancedMetrics>({
    consistency: 100,
    burstSpeed: 0,
    rhythm: 100,
    errorRate: 0
  });
  
  const lastKeystrokeTime = useRef<number>(0);

  const addKeystroke = (key: string, isCorrect: boolean) => {
    const now = Date.now();
    const timeSinceLastKey = lastKeystrokeTime.current ? now - lastKeystrokeTime.current : 0;
    
    const keystroke: KeystrokeData = {
      timestamp: now,
      key,
      isCorrect,
      timeSinceLastKey
    };

    setKeystrokeHistory(prev => [...prev.slice(-100), keystroke]); // Keep last 100 keystrokes
    lastKeystrokeTime.current = now;
  };

  const calculateMetrics = () => {
    if (keystrokeHistory.length < 10) return;

    const recentKeystrokes = keystrokeHistory.slice(-50);
    
    // Calculate consistency (coefficient of variation of keystroke intervals)
    const intervals = recentKeystrokes
      .filter(k => k.timeSinceLastKey > 0)
      .map(k => k.timeSinceLastKey);
    
    if (intervals.length > 5) {
      const mean = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length;
      const standardDeviation = Math.sqrt(variance);
      const coefficientOfVariation = standardDeviation / mean;
      const consistency = Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));
      
      setMetrics(prev => ({ ...prev, consistency: Math.round(consistency) }));
    }

    // Calculate burst speed (highest WPM in any 5-second window)
    const fiveSecondsAgo = Date.now() - 5000;
    const recentKeys = keystrokeHistory.filter(k => k.timestamp > fiveSecondsAgo);
    const burstWPM = (recentKeys.length / 5) * 60 / 5; // chars per minute / 5 (avg chars per word)
    
    setMetrics(prev => ({ ...prev, burstSpeed: Math.round(burstWPM) }));

    // Calculate rhythm score (smoothness of timing)
    if (intervals.length > 10) {
      const rhythmScore = intervals.slice(1).reduce((score, interval, index) => {
        const prevInterval = intervals[index];
        const difference = Math.abs(interval - prevInterval);
        const maxExpectedDiff = Math.max(prevInterval, interval) * 0.5;
        const normalizedDiff = Math.min(difference / maxExpectedDiff, 1);
        return score + (1 - normalizedDiff);
      }, 0) / (intervals.length - 1) * 100;
      
      setMetrics(prev => ({ ...prev, rhythm: Math.round(rhythmScore) }));
    }

    // Calculate error rate
    const totalKeystrokes = recentKeystrokes.length;
    const errors = recentKeystrokes.filter(k => !k.isCorrect).length;
    const errorRate = totalKeystrokes > 0 ? (errors / totalKeystrokes) * 100 : 0;
    
    setMetrics(prev => ({ ...prev, errorRate: Math.round(errorRate * 10) / 10 }));
  };

  useEffect(() => {
    calculateMetrics();
  }, [keystrokeHistory]);

  const reset = () => {
    setKeystrokeHistory([]);
    setMetrics({
      consistency: 100,
      burstSpeed: 0,
      rhythm: 100,
      errorRate: 0
    });
    lastKeystrokeTime.current = 0;
  };

  return {
    metrics,
    addKeystroke,
    reset
  };
}