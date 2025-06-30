import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BoltBadgeProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function BoltBadge({ variant = 'default', className = '' }: BoltBadgeProps) {
  const { t } = useTranslation();

  if (variant === 'compact') {
    return (
      <motion.a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-gray-300 px-3 py-2 rounded-lg ${className}`}
        title={t('header.builtOnBolt')}
      >
        <img
          src="/black_circle_360x360.png"
          alt="Built on Bolt"
          className="w-5 h-5"
        />
        <span className="text-xs font-medium">Bolt</span>
      </motion.a>
    );
  }

  return (
    <motion.a
      href="https://bolt.new"
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center space-x-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-gray-200 hover:text-white px-4 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${className}`}
      title={t('header.builtOnBolt')}
    >
      <img
        src="/black_circle_360x360.png"
        alt="Built on Bolt"
        className="w-6 h-6"
      />
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{t('header.builtOnBolt')}</span>
        <span className="text-xs text-gray-400">{t('header.hackathonEntry')}</span>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-400" />
    </motion.a>
  );
}