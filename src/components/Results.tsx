import React from 'react';
import { TypingStats, TestConfig, PersonalBest } from '../types';
import { Trophy, Target, Zap, Clock, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ResultsProps {
  stats: TypingStats;
  config: TestConfig;
  onRestart: () => void;
}

export function Results({ stats, config, onRestart }: ResultsProps) {
  const { t } = useTranslation();

  // Get personal best for comparison
  const personalBests: PersonalBest[] = JSON.parse(localStorage.getItem('personalBests') || '[]');
  const relevantBest = personalBests.find(pb => 
    pb.testConfig.mode === config.mode &&
    pb.testConfig.timeLimit === config.timeLimit &&
    pb.testConfig.wordLimit === config.wordLimit
  );

  const isNewPersonalBest = !relevantBest || stats.wpm > relevantBest.wpm;
  const wpmImprovement = relevantBest ? stats.wpm - relevantBest.wpm : 0;

  const resultItems = [
    {
      icon: Zap,
      label: t('results.wordsPerMinute'),
      value: stats.wpm,
      color: 'text-primary-400',
      bgColor: 'bg-primary-400/10',
      improvement: wpmImprovement > 0 ? `+${wpmImprovement}` : null
    },
    {
      icon: Target,
      label: t('typing.accuracy'),
      value: `${stats.accuracy}%`,
      color: 'text-success-400',
      bgColor: 'bg-success-400/10'
    },
    {
      icon: Clock,
      label: t('results.timeTaken'),
      value: `${Math.floor(stats.elapsedTime / 60)}:${(stats.elapsedTime % 60).toFixed(1).padStart(4, '0')}`,
      color: 'text-gray-300',
      bgColor: 'bg-gray-600/10'
    },
    {
      icon: TrendingUp,
      label: t('results.charactersTyped'),
      value: stats.totalChars,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        {isNewPersonalBest && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full mb-4"
          >
            <Trophy className="w-5 h-5" />
            <span className="font-bold">{t('typing.newPersonalBest')}</span>
          </motion.div>
        )}
        
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-gradient mb-2"
        >
          {t('typing.testComplete')}
        </motion.h2>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400"
        >
          {t('results.hereIsHow')}
        </motion.p>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {resultItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`${item.bgColor} rounded-xl p-6 border border-gray-700/30 relative overflow-hidden`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-gray-400 font-medium">{item.label}</span>
                  </div>
                  <div className={`text-3xl font-bold ${item.color} flex items-baseline space-x-2`}>
                    <span>{item.value}</span>
                    {item.improvement && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-lg text-success-400"
                      >
                        {item.improvement}
                      </motion.span>
                    )}
                  </div>
                </div>
                {isNewPersonalBest && item.label === t('results.wordsPerMinute') && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.6, type: "spring" }}
                  >
                    <Award className="w-8 h-8 text-amber-400" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Previous Best Comparison */}
      {relevantBest && !isNewPersonalBest && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-dark-800/50 rounded-xl p-4 mb-6 border border-gray-700/30"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{t('results.personalBest')}</span>
            <div className="flex items-center space-x-4">
              <span className="text-primary-400 font-bold">{relevantBest.wpm} {t('typing.wpm')}</span>
              <span className="text-success-400">{relevantBest.accuracy}%</span>
              <span className="text-gray-500">
                {new Date(relevantBest.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="px-8 py-4 bg-gradient-to-r from-primary-600 to-success-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {t('typing.takeAnotherTest')}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}