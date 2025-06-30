import React from 'react';
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

  if (data.length < 2) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-4 h-full flex items-center justify-center"
      >
        <div className="text-center text-gray-400">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-sm">{t('wpmGraph.graphWillAppear')}</div>
        </div>
      </motion.div>
    );
  }

  const maxWPM = Math.max(...data.map(d => d.wpm), currentWPM) || 100;
  const width = 300;
  const height = 120;
  const padding = 20;

  const getX = (index: number) => (index / (data.length - 1)) * (width - 2 * padding) + padding;
  const getY = (wpm: number) => height - padding - ((wpm / maxWPM) * (height - 2 * padding));

  const pathData = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.wpm);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

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
          {[0, 25, 50, 75, 100].map(wpm => (
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
          
          {/* Data points */}
          {data.map((point, index) => (
            <motion.circle
              key={index}
              cx={getX(index)}
              cy={getY(point.wpm)}
              r="3"
              fill="rgb(59, 130, 246)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
          
          {/* Accuracy overlay */}
          <motion.path
            d={data.map((point, index) => {
              const x = getX(index);
              const y = getY(point.accuracy);
              return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="rgb(16, 185, 129)"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </svg>
        
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{t('wpmGraph.start')}</span>
          <span>{t('wpmGraph.time')}</span>
        </div>
      </div>
    </motion.div>
  );
}