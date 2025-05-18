import { useEffect, useState } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Activity, Clock, HardDrive, Server } from 'lucide-react';

interface PerformanceMonitorProps {
  className?: string;
  showDetails?: boolean;
}

type MotionDivProps = HTMLMotionProps<"div">;

const containerMotion: MotionDivProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
  style: { minWidth: '200px' }
};

const expandedMotion: MotionDivProps = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 }
};

export function PerformanceMonitor({ className = '', showDetails = false }: PerformanceMonitorProps) {
  const { metrics } = usePerformanceMonitor();
  const [isExpanded, setIsExpanded] = useState(false);

  // Color thresholds for FPS
  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Format numbers
  const formatNumber = (num: number) => Math.round(num * 100) / 100;

  // Minimal view
  if (!showDetails) {
    return (
      <div className={`fixed bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-2 text-xs ${className}`}>
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4" />
          <span className={getFpsColor(metrics.fps)}>{metrics.fps} FPS</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      {...containerMotion}
      className={`fixed bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className="font-medium flex items-center">
          <Activity className="h-4 w-4 mr-2" />
          Performance Metrics
        </h3>
        <span className={`${getFpsColor(metrics.fps)} font-mono`}>{metrics.fps} FPS</span>
      </div>

      {isExpanded && (
        <motion.div
          {...expandedMotion}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-400">
              <Clock className="h-4 w-4 mr-2" />
              Frame Time
            </div>
            <span className="font-mono">{formatNumber(metrics.frameTime)}ms</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-400">
              <HardDrive className="h-4 w-4 mr-2" />
              Memory Usage
            </div>
            <span className="font-mono">{formatNumber(metrics.memoryUsage)}MB</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-gray-400">
              <Server className="h-4 w-4 mr-2" />
              API Latency
            </div>
            {Array.from(metrics.apiLatency.entries()).map(([endpoint, latency]) => (
              <div key={endpoint} className="flex items-center justify-between pl-6 text-xs">
                <span className="text-gray-500">{endpoint}</span>
                <span className="font-mono">{formatNumber(latency)}ms</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 