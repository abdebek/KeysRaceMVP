import React from 'react';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DemoUserButton } from '../DemoUserButton';

interface AuthRequiredMessageProps {
  onSignIn?: () => void;
}

export function AuthRequiredMessage({ onSignIn }: AuthRequiredMessageProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass-card p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-4 bg-primary-600/20 rounded-full">
            <LogIn className="w-8 h-8 text-primary-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-200 mb-4">{t('multiplayer.signInRequired')}</h2>
        <p className="text-gray-400 mb-6">
          {t('multiplayer.signInDescription')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <DemoUserButton />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSignIn}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200"
          >
            {t('navigation.signIn')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}