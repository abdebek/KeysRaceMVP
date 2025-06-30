import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Users, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function FooterFeatures() {
  const { t } = useTranslation();

  const hackathonAchievements = [
    { icon: Brain, label: t('footer.aiPowered'), description: t('footer.smartCoaching') },
    { icon: Zap, label: t('footer.lightningFast'), description: t('footer.optimizedPerformance') },
    { icon: Users, label: t('footer.multiplayer'), description: t('footer.realTimeRacing') },
    { icon: Target, label: t('footer.precision'), description: t('footer.advancedAnalyticsFeature') }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {hackathonAchievements.map((achievement, index) => {
        const Icon = achievement.icon;
        return (
          <motion.div
            key={achievement.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center p-4 bg-dark-800/30 rounded-lg border border-gray-700/30 hover:border-primary-500/30 transition-colors"
          >
            <Icon className="w-8 h-8 text-primary-400 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-200 text-sm">{achievement.label}</h4>
            <p className="text-xs text-gray-400 mt-1">{achievement.description}</p>
          </motion.div>
        );
      })}
    </div>
  );
}