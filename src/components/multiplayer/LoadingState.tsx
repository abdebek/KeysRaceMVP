import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function LoadingState() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass-card p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400 mx-auto mb-4"></div>
        <p className="text-gray-400">{t('common.loading')}</p>
      </div>
    </motion.div>
  );
}