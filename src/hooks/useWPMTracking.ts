import { useState, useEffect, useRef } from 'react';

interface WPMDataPoint {
  time: number;
  wpm: number;
  accuracy: number;
}

export function useWPMTracking(isActive: boolean, wpm: number, accuracy: number) {
  const [wpmHistory, setWpmHistory] = useState<WPMDataPoint[]>([]);
  const intervalRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    if (isActive) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      intervalRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current!) / 1000;
        setWpmHistory(prev => [
          ...prev,
          { time: elapsed, wpm, accuracy }
        ]);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, wpm, accuracy]);

  const resetWPMTracking = () => {
    setWpmHistory([]);
    startTimeRef.current = undefined;
  };

  return { wpmHistory, resetWPMTracking };
}