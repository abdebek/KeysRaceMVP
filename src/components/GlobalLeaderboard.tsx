import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Globe, TrendingUp, Users, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LeaderboardEntry {
  rank: number;
  username: string;
  wpm: number;
  accuracy: number;
  country: string;
  streak: number;
  isCurrentUser?: boolean;
}

export function GlobalLeaderboard() {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'alltime'>('weekly');
  const [category, setCategory] = useState<'speed' | 'accuracy' | 'consistency'>('speed');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Simulate fetching leaderboard data
    const mockData: LeaderboardEntry[] = [
      { rank: 1, username: 'TypeMaster2024', wpm: 142, accuracy: 99, country: 'US', streak: 28 },
      { rank: 2, username: 'KeyboardNinja', wpm: 138, accuracy: 98, country: 'KR', streak: 15 },
      { rank: 3, username: 'SpeedDemon', wpm: 135, accuracy: 97, country: 'DE', streak: 22 },
      { rank: 4, username: 'TypingLegend', wpm: 132, accuracy: 99, country: 'JP', streak: 31 },
      { rank: 5, username: 'FastFingers', wpm: 129, accuracy: 96, country: 'CA', streak: 12 },
      { rank: 6, username: 'QuickType', wpm: 127, accuracy: 98, country: 'UK', streak: 8 },
      { rank: 7, username: 'RapidTyper', wpm: 125, accuracy: 95, country: 'AU', streak: 19 },
      { rank: 8, username: 'KeyStroke', wpm: 123, accuracy: 97, country: 'FR', streak: 6 },
      { rank: 9, username: 'TypeRacer', wpm: 121, accuracy: 94, country: 'BR', streak: 14 },
      { rank: 10, username: 'You', wpm: 67, accuracy: 92, country: 'US', streak: 3, isCurrentUser: true },
    ];
    
    setLeaderboard(mockData);
  }, [timeframe, category]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-amber-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'US': '🇺🇸', 'KR': '🇰🇷', 'DE': '🇩🇪', 'JP': '🇯🇵',
      'CA': '🇨🇦', 'UK': '🇬🇧', 'AU': '🇦🇺', 'FR': '🇫🇷', 'BR': '🇧🇷'
    };
    return flags[country] || '🌍';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="w-6 h-6 text-primary-400" />
          <h2 className="text-2xl font-bold text-gray-200">{t('leaderboard.title')}</h2>
        </div>
        <p className="text-gray-400">
          {t('leaderboard.description')}
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timeframe */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">{t('leaderboard.timeframe')}</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'daily', label: t('leaderboard.today') },
                { id: 'weekly', label: t('leaderboard.thisWeek') },
                { id: 'monthly', label: t('leaderboard.thisMonth') },
                { id: 'alltime', label: t('leaderboard.allTime') }
              ].map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimeframe(option.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    timeframe === option.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">{t('leaderboard.category')}</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'speed', label: t('leaderboard.speed') },
                { id: 'accuracy', label: t('leaderboard.accuracy') },
                { id: 'consistency', label: t('leaderboard.consistency') }
              ].map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategory(option.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    category === option.id
                      ? 'bg-success-600 text-white'
                      : 'bg-dark-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass-card p-6">
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.username}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                entry.isCurrentUser
                  ? 'bg-primary-600/20 border border-primary-500/40'
                  : entry.rank <= 3
                  ? 'bg-amber-500/10 border border-amber-500/20'
                  : 'bg-dark-800/50 hover:bg-dark-700/50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCountryFlag(entry.country)}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${
                        entry.isCurrentUser ? 'text-primary-300' : 'text-gray-200'
                      }`}>
                        {entry.username}
                      </span>
                      {entry.isCurrentUser && (
                        <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full">
                          {t('multiplayer.you')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                      <span>{entry.streak} {t('leaderboard.dayStreak')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-right">
                <div>
                  <div className="text-lg font-bold text-primary-400">
                    {entry.wpm} {t('typing.wpm')}
                  </div>
                  <div className="text-sm text-gray-400">
                    {entry.accuracy}% {t('typing.accuracy')}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Your Rank */}
        <div className="mt-6 pt-6 border-t border-gray-700/30">
          <div className="bg-primary-600/10 border border-primary-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-primary-400" />
                <span className="text-gray-200 font-medium">{t('leaderboard.yourRank')}</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary-400">#847</div>
                <div className="text-sm text-gray-400">{t('leaderboard.outOf', { count: '12,847' })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}