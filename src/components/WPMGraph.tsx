import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface WPMDataPoint {
  time: number;
  wpm: number;
  accuracy: number;
}

interface WPMGraphProps {
  data: WPMDataPoint[];
  currentWPM: number;
}

export function WPMGraph({ data, currentWPM }: WPMGraphProps) {
  const { t } = useTranslation();
  
  // Filter out zero WPM points and limit to last 30 points for performance
  const filteredData = useMemo(() => {
    return data
      .filter(point => point.time > 0) // Remove initial zero point
      .slice(-30); // Only show last 30 data points for better visibility
  }, [data]);

  // Show empty state if we don't have meaningful data yet
  const isEmpty = filteredData.length < 2;

  if (isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-4 h-full flex items-center justify-center"
      >
        <div className="text-center text-gray-400">
          <div className="text-sm">{t('wpmGraph.graphWillAppear')}</div>
        </div>
      </motion.div>
    );
  }

  // Calculate meaningful min/max values for better graph scaling
  const maxWPM = useMemo(() => {
    const dataMax = Math.max(...filteredData.map(d => d.wpm), currentWPM);
    // Round up to nearest 10 and add 10 for padding
    return Math.ceil(dataMax / 10) * 10 + 10;
  }, [filteredData, currentWPM]);

  // Calculate time range for x-axis
  const timeRange = useMemo(() => {
    if (filteredData.length < 2) return 60;
    return Math.max(60, filteredData[filteredData.length - 1].time);
  }, [filteredData]);

  const width = 300;
  const height = 120;
  const padding = 20;

  // Improved coordinate calculation for smoother graph
  const getX = (point: WPMDataPoint) => {
    return ((point.time / timeRange) * (width - 2 * padding)) + padding;
  };
  
  const getY = (wpm: number) => {
    return height - padding - ((wpm / maxWPM) * (height - 2 * padding));
  };

  // Generate path data for the WPM line
  const pathData = useMemo(() => {
    if (filteredData.length < 2) return '';
    
    return filteredData.map((point, index) => {
      const x = getX(point);
      const y = getY(point.wpm);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  }, [filteredData, maxWPM, timeRange]);

  // Generate path data for the accuracy line
  const accuracyPathData = useMemo(() => {
    if (filteredData.length < 2) return '';
    
    return filteredData.map((point, index) => {
      const x = getX(point);
      // Scale accuracy to fit in the same graph (0-100% -> 0-maxWPM)
      const scaledAccuracy = (point.accuracy / 100) * maxWPM;
      const y = getY(scaledAccuracy);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  }, [filteredData, maxWPM, timeRange]);

  // Generate grid lines based on maxWPM
  const gridLines = useMemo(() => {
    const lines = [];
    const step = Math.ceil(maxWPM / 4); // 4 grid lines
    
    for (let wpm = 0; wpm <= maxWPM; wpm += step) {
      lines.push(wpm);
    }
    
    return lines;
  }, [maxWPM]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-4 h-full"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-300">{t('wpmGraph.title')}</h4>
        <div className="text-lg font-bold text-primary-400">{currentWPM} {t('typing.wpm')}</div>
      </div>
      
      <div className="relative overflow-hidden">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Grid lines */}
          {gridLines.map(wpm => (
            <g key={wpm}>
              <line
                x1={padding}
                y1={getY(wpm)}
                x2={width - padding}
                y2={getY(wpm)}
                stroke="rgb(75, 85, 99)"
                strokeWidth="1"
                opacity="0.3"
              />
              <text
                x={padding - 5}
                y={getY(wpm) + 4}
                fill="rgb(156, 163, 175)"
                fontSize="10"
                textAnchor="end"
              >
                {wpm}
              </text>
            </g>
          ))}
          
          {/* Time markers */}
          {[0, timeRange/2, timeRange].map(time => (
            <g key={time}>
              <line
                x1={((time / timeRange) * (width - 2 * padding)) + padding}
                y1={height - padding}
                x2={((time / timeRange) * (width - 2 * padding)) + padding}
                y2={height - padding + 5}
                stroke="rgb(75, 85, 99)"
                strokeWidth="1"
              />
              <text
                x={((time / timeRange) * (width - 2 * padding)) + padding}
                y={height - 5}
                fill="rgb(156, 163, 175)"
                fontSize="8"
                textAnchor="middle"
              >
                {Math.round(time)}s
              </text>
            </g>
          ))}
          
          {/* WPM Line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Accuracy Line */}
          <motion.path
            d={accuracyPathData}
            fill="none"
            stroke="rgb(16, 185, 129)"
            strokeWidth="1.5"
            strokeDasharray="3,3"
            opacity="0.7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          
          {/* Current WPM Indicator */}
          {filteredData.length > 0 && (
            <motion.circle
              cx={getX(filteredData[filteredData.length - 1])}
              cy={getY(currentWPM)}
              r="4"
              fill="rgb(59, 130, 246)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            />
          )}
        </svg>
        
        {/* Legend */}
        <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
          <div className="flex items-center">
            <div className="w-3 h-1 bg-blue-400 rounded mr-1"></div>
            <span>{t('typing.wpm')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-1 bg-green-400 rounded mr-1 border-dashed"></div>
            <span>{t('typing.accuracy')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}