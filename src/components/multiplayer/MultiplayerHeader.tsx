import React from 'react';
import { motion } from 'framer-motion';
import { Users, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MultiplayerHeaderProps {
  isPremium: boolean;
}

export function MultiplayerHeader({ isPremium }: MultiplayerHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="glass-card p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Users className="w-6 h-6 text-primary-400" />
        <h2 className="text-2xl font-bold text-gray-200">{t('multiplayer.title')}</h2>
        {isPremium && (
          <div className="bg-success-500/20 px-3 py-1 rounded-full border border-success-500/40">
            <Crown className="w-4 h-4 text-success-400 inline mr-1" />
            <span className="text-success-400 text-sm font-medium">{t('multiplayer.premiumActive')}</span>
          </div>
        )}
      </div>
      <p className="text-gray-400">
        {t('multiplayer.description')}
      </p>
    </div>
  );
}