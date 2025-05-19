import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  apiLatency: Map<string, number>;
  memoryUsage: number;
  gpuMemory?: number;
}

export function usePerformanceMonitor(enabled: boolean = true) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    apiLatency: new Map(),
    memoryUsage: 0
  });

  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const animationFrameRef = useRef<number>();

  const measurePerformance = useCallback(() => {
    if (!enabled) return;

    const now = performance.now();
    frameRef.current++;

    // Calculate metrics every second
    if (now - lastTimeRef.current >= 1000) {
      const fps = frameRef.current;
      const frameTime = (now - lastTimeRef.current) / frameRef.current;
      
      // Get memory usage if available
      let memoryUsage = 0;
      if (performance.memory) {
        memoryUsage = (performance.memory as any).usedJSHeapSize / (1024 * 1024); // Convert to MB
      }

      setMetrics(prev => ({
        ...prev,
        fps,
        frameTime,
        memoryUsage
      }));

      // Reset counters
      frameRef.current = 0;
      lastTimeRef.current = now;
    }

    // Request next frame
    animationFrameRef.current = requestAnimationFrame(measurePerformance);
  }, [enabled]);

  // Track API latency
  const trackApiCall = useCallback(async (endpoint: string, apiCall: () => Promise<any>) => {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const latency = endTime - startTime;

      setMetrics(prev => {
        const newApiLatency = new Map(prev.apiLatency);
        newApiLatency.set(endpoint, latency);
        return {
          ...prev,
          apiLatency: newApiLatency
        };
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      const latency = endTime - startTime;

      setMetrics(prev => {
        const newApiLatency = new Map(prev.apiLatency);
        newApiLatency.set(endpoint, latency);
        return {
          ...prev,
          apiLatency: newApiLatency
        };
      });

      throw error;
    }
  }, []);

  // Start/stop monitoring
  useEffect(() => {
    if (enabled) {
      measurePerformance();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, measurePerformance]);

  return {
    metrics,
    trackApiCall
  };
} 