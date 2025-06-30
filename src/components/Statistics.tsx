import React, { useMemo } from 'react';
import { TestResult, PersonalBest } from '../types';
import { BarChart3, TrendingUp, Calendar, Award, Target, Zap, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function Statistics() {
  const { t } = useTranslation();
  const results: TestResult[] = JSON.parse(localStorage.getItem('typingResults') || '[]');
  const personalBests: PersonalBest[] = JSON.parse(localStorage.getItem('personalBests') || '[]');

  const stats = useMemo(() => {
    if (results.length === 0) return null;

    const totalTests = results.length;
    const avgWpm = Math.round(results.reduce((sum, result) => sum + result.stats.wpm, 0) / totalTests);
    const avgAccuracy = Math.round(results.reduce((sum, result) => sum + result.stats.accuracy, 0) / totalTests);
    const bestWpm = Math.max(...results.map(r => r.stats.wpm));
    const bestAccuracy = Math.max(...results.map(r => r.stats.accuracy));
    
    const recentResults = results.slice(-10);
    const recentAvgWpm = Math.round(recentResults.reduce((sum, result) => sum + result.stats.wpm, 0) / recentResults.length);
    
    return {
      totalTests,
      avgWpm,
      avgAccuracy,
      bestWpm,
      bestAccuracy,
      recentAvgWpm,
      improvement: recentAvgWpm - avgWpm
    };
  }, [results]);

  if (!stats) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 text-center"
      >
        <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-300 mb-2">{t('statistics.noData')}</h3>
        <p className="text-gray-400">{t('statistics.noDataDescription')}</p>
      </motion.div>
    );
  }

  const statCards = [
    {
      icon: BarChart3,
      label: t('statistics.testsCompleted'),
      value: stats.totalTests,
      color: 'text-primary-400',
      bgColor: 'bg-primary-400/10'
    },
    {
      icon: Zap,
      label: t('statistics.averageWpm'),
      value: stats.avgWpm,
      color: 'text-success-400',
      bgColor: 'bg-success-400/10'
    },
    {
      icon: Target,
      label: t('statistics.averageAccuracy'),
      value: `${stats.avgAccuracy}%`,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10'
    },
    {
      icon: Award,
      label: t('statistics.bestWpm'),
      value: stats.bestWpm,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-6 ${card.bgColor} border border-gray-700/30`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <Icon className={`w-6 h-6 ${card.color}`} />
                <span className="text-gray-300 font-medium">{card.label}</span>
              </div>
              <div className={`text-3xl font-bold ${card.color}`}>
                {card.value}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="w-6 h-6 text-success-400" />
          <h3 className="text-xl font-bold text-gray-200">{t('statistics.recentProgress')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-800/50 rounded-xl p-4 border border-gray-700/30">
            <div className="text-sm text-gray-400 mb-1">{t('statistics.recentAverage')}</div>
            <div className="text-2xl font-bold text-success-400">{stats.recentAvgWpm} {t('typing.wpm')}</div>
          </div>
          
          <div className="bg-dark-800/50 rounded-xl p-4 border border-gray-700/30">
            <div className="text-sm text-gray-400 mb-1">{t('statistics.overallAverage')}</div>
            <div className="text-2xl font-bold text-primary-400">{stats.avgWpm} {t('typing.wpm')}</div>
          </div>
          
          <div className="bg-dark-800/50 rounded-xl p-4 border border-gray-700/30">
            <div className="text-sm text-gray-400 mb-1">{t('statistics.improvement')}</div>
            <div className={`text-2xl font-bold ${stats.improvement >= 0 ? 'text-success-400' : 'text-error-400'}`}>
              {stats.improvement >= 0 ? '+' : ''}{stats.improvement} {t('typing.wpm')}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personal Bests */}
      {personalBests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Award className="w-6 h-6 text-amber-400" />
            <h3 className="text-xl font-bold text-gray-200">{t('statistics.personalRecords')}</h3>
          </div>
          
          <div className="space-y-4">
            {personalBests.map((best, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-dark-800/50 rounded-xl p-4 border border-gray-700/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-amber-400/20 p-2 rounded-lg">
                      <Trophy className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-200">
                        {best.testConfig.mode === 'time' 
                          ? `${best.testConfig.timeLimit}s Timed Test`
                          : `${best.testConfig.wordLimit} Word Test`
                        }
                      </div>
                      <div className="text-sm text-gray-400 capitalize">
                        {best.testConfig.textCategory}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-400">{best.wpm} {t('typing.wpm')}</div>
                    <div className="text-sm text-gray-400">{best.accuracy}% {t('typing.accuracy')}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(best.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Tests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Calendar className="w-6 h-6 text-primary-400" />
          <h3 className="text-xl font-bold text-gray-200">{t('statistics.recentTests')}</h3>
        </div>
        
        <div className="space-y-3">
          {results.slice(-5).reverse().map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex items-center justify-between bg-dark-800/30 rounded-lg p-3 border border-gray-700/20"
            >
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-400">
                  {new Date(result.timestamp).toLocaleDateString()}
                </div>
                <div className="text-xs bg-gray-700 px-2 py-1 rounded capitalize">
                  {result.config.textCategory}
                </div>
                <div className="text-xs bg-gray-700 px-2 py-1 rounded">
                  {result.config.mode === 'time' 
                    ? `${result.config.timeLimit}s`
                    : `${result.config.wordLimit}w`
                  }
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-success-400 font-bold">{result.stats.wpm} {t('typing.wpm')}</span>
                <span className="text-gray-400">{result.stats.accuracy}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}