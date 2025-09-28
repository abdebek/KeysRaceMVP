import { useState, useEffect, useRef } from 'react';

interface WPMDataPoint {
  time: number;
  wpm: number;
  accuracy: number;
}

export function useWPMTracking(isActive: boolean, wpm: number, accuracy: number) {
  const [wpmHistory, setWpmHistory] = useState<WPMDataPoint[]>([
    // Initialize with a starting point
    { time: 0, wpm: 0, accuracy: 0 }
  ]);
  const intervalRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const pendingUpdateRef = useRef<WPMDataPoint | null>(null);
  const lastWpmRef = useRef<number>(0);
  const lastAccuracyRef = useRef<number>(0);

  useEffect(() => {
    // Only update when values actually change to reduce unnecessary renders
    if (wpm !== lastWpmRef.current || accuracy !== lastAccuracyRef.current) {
      lastWpmRef.current = wpm;
      lastAccuracyRef.current = accuracy;
      
      // Throttle updates to reduce render frequency
      const now = Date.now();
      if (now - lastUpdateRef.current > 500) {
        const elapsed = startTimeRef.current ? (now - startTimeRef.current) / 1000 : 0;
        
        // Store the update in a ref instead of triggering a state update immediately
        pendingUpdateRef.current = { time: elapsed, wpm, accuracy };
        lastUpdateRef.current = now;
      }
    }

    if (isActive) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        // Add initial point if we're just starting
        setWpmHistory([{ time: 0, wpm, accuracy }]);
      }

      // Set up interval for batched updates
      if (!intervalRef.current) {
        intervalRef.current = window.setInterval(() => {
          if (pendingUpdateRef.current) {
            setWpmHistory(prev => {
              // Only add the point if it's different from the last one
              const lastPoint = prev[prev.length - 1];
              const newPoint = pendingUpdateRef.current!;
              
              // Skip if the values are very close to the previous ones
              if (
                Math.abs(lastPoint.wpm - newPoint.wpm) < 0.5 && 
                Math.abs(lastPoint.accuracy - newPoint.accuracy) < 0.5
              ) {
                return prev;
              }
              
              return [...prev, newPoint];
            });
            pendingUpdateRef.current = null;
          }
        }, 1000);
      }
    } else {
      // Clear interval when not active
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, wpm, accuracy]);

  const resetWPMTracking = () => {
    setWpmHistory([{ time: 0, wpm: 0, accuracy: 0 }]);
    startTimeRef.current = undefined;
    lastUpdateRef.current = 0;
    pendingUpdateRef.current = null;
    lastWpmRef.current = 0;
    lastAccuracyRef.current = 0;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  };

  return { wpmHistory, resetWPMTracking };
}