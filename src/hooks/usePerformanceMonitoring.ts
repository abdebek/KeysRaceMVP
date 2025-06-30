import { useEffect } from 'react';

interface PerformanceMetrics {
  wpm: number;
  accuracy: number;
  testDuration: number;
  errorCount: number;
}

export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }

    // Monitor memory usage
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576),
          total: Math.round(memory.totalJSHeapSize / 1048576),
          limit: Math.round(memory.jsHeapSizeLimit / 1048576)
        });
      }
    };

    const interval = setInterval(monitorMemory, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const trackTypingPerformance = (metrics: PerformanceMetrics) => {
    // Track typing-specific metrics
    console.log('Typing performance:', metrics);
    
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // gtag('event', 'typing_test_completed', metrics);
    }
  };

  const trackError = (error: Error, context?: string) => {
    console.error('Application error:', error, context);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: { context } });
    }
  };

  return {
    trackTypingPerformance,
    trackError
  };
}