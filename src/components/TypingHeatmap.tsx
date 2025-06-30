import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TypingSession {
  date: string;
  wpm: number;
  accuracy: number;
  duration: number;
}

interface TypingHeatmapProps {
  sessions: TypingSession[];
}

export function TypingHeatmap({ sessions }: TypingHeatmapProps) {
  const { t } = useTranslation();

  // Generate last 365 days
  const generateDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const days = generateDays();
  const sessionMap = new Map(sessions.map(s => [s.date, s]));

  const getIntensity = (date: string) => {
    const session = sessionMap.get(date);
    if (!session) return 0;
    
    // Calculate intensity based on WPM and duration
    const wpmScore = Math.min(session.wpm / 100, 1);
    const durationScore = Math.min(session.duration / 300, 1); // 5 minutes max
    return Math.round((wpmScore + durationScore) / 2 * 4) + 1; // 1-5 scale
  };

  const getColor = (intensity: number) => {
    const colors = [
      'bg-dark-800', // 0 - no activity
      'bg-primary-900/30', // 1 - low
      'bg-primary-700/50', // 2 - medium-low
      'bg-primary-500/70', // 3 - medium
      'bg-primary-400/85', // 4 - high
      'bg-primary-300' // 5 - very high
    ];
    return colors[intensity] || colors[0];
  };

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="w-6 h-6 text-primary-400" />
        <h3 className="text-xl font-bold text-gray-200">{t('statistics.typingActivity')}</h3>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex mb-2">
            <div className="w-8"></div>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="flex-1 text-xs text-gray-400 text-center min-w-[60px]">
                {monthLabels[i]}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col space-y-1 mr-2">
              {dayLabels.map((day, i) => (
                <div key={day} className="h-3 text-xs text-gray-400 flex items-center">
                  {i % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex space-x-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col space-y-1">
                  {week.map((date, dayIndex) => {
                    const intensity = getIntensity(date);
                    const session = sessionMap.get(date);
                    return (
                      <motion.div
                        key={date}
                        className={`w-3 h-3 rounded-sm ${getColor(intensity)} border border-gray-700/30 cursor-pointer group relative`}
                        whileHover={{ scale: 1.2 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: weekIndex * 0.01 + dayIndex * 0.002 }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-dark-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                          {session ? (
                            <>
                              <div>{new Date(date).toLocaleDateString()}</div>
                              <div>{session.wpm} {t('typing.wpm')} • {session.accuracy}% {t('typing.accuracy')}</div>
                              <div>{Math.round(session.duration / 60)} {t('statistics.minutes')}</div>
                            </>
                          ) : (
                            <div>{new Date(date).toLocaleDateString()}</div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-400">{t('statistics.less')}</span>
            <div className="flex space-x-1">
              {[0, 1, 2, 3, 4, 5].map(intensity => (
                <div
                  key={intensity}
                  className={`w-3 h-3 rounded-sm ${getColor(intensity)} border border-gray-700/30`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">{t('statistics.more')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}