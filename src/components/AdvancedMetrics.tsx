import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, Clock, Brain, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdvancedMetricsProps {
  stats: {
    wpm: number;
    accuracy: number;
    consistency: number;
    burstSpeed: number;
    rhythm: number;
    errorRate: number;
  };
  isVisible: boolean;
}

export function AdvancedMetrics({ stats, isVisible }: AdvancedMetricsProps) {
  const { t } = useTranslation();

  if (!isVisible) return null;

  const metrics = [
    {
      icon: TrendingUp,
      label: t('typing.consistency'),
      value: `${stats.consistency}%`,
      description: t('advancedMetrics.consistencyDescription'),
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      icon: Zap,
      label: t('typing.burstSpeed'),
      value: `${stats.burstSpeed} ${t('typing.wpm')}`,
      description: t('advancedMetrics.burstSpeedDescription'),
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    },
    {
      icon: Activity,
      label: t('typing.rhythm'),
      value: `${stats.rhythm}%`,
      description: t('advancedMetrics.rhythmDescription'),
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      icon: Target,
      label: t('typing.errorRate'),
      value: `${stats.errorRate}%`,
      description: t('advancedMetrics.errorRateDescription'),
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="glass-card p-4 md:p-6 mt-4"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-primary-400" />
        <h3 className="text-lg font-semibold text-gray-200">{t('advancedMetrics.title')}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${metric.bgColor} rounded-xl p-4 border border-gray-700/30 group hover:scale-105 transition-transform duration-200`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <Icon className={`w-5 h-5 ${metric.color}`} />
                <span className="text-sm font-medium text-gray-300">{metric.label}</span>
              </div>
              <div className={`text-2xl font-bold ${metric.color} mb-1`}>
                {metric.value}
              </div>
              <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {metric.description}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}