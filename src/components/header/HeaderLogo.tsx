import React from 'react';
import { motion } from 'framer-motion';
import { Keyboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HeaderLogoProps {
  onClick: () => void;
}

export function HeaderLogo({ onClick }: HeaderLogoProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-3">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2 bg-gradient-to-br from-primary-500 to-success-500 rounded-xl cursor-pointer"
        onClick={onClick}
      >
        <Keyboard className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </motion.div>
      <div>
        <motion.h1 
          className="text-xl md:text-2xl font-bold text-gradient cursor-pointer"
          onClick={onClick}
          whileHover={{ scale: 1.02 }}
        >
          KeysRace
        </motion.h1>
      </div>
    </div>
  );
}