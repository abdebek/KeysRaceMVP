import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface BoltLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient';
}

export function BoltLogo({ size = 'md', variant = 'default' }: BoltLogoProps) {
  const { t } = useTranslation();
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  const containerClasses = {
    default: 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30',
    gradient: 'bg-gradient-to-r from-purple-600 to-blue-600'
  };

  return (
    <motion.div 
      className={`${containerClasses[variant]} rounded-xl p-2 flex items-center justify-center`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <img
        src="/black_circle_360x360.png"
        alt={t('header.builtOnBolt')}
        className={`${sizeClasses[size]}`}
      />
    </motion.div>
  );
}