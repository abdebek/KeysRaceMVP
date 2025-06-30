import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Github, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function FooterHackathonBanner() {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-green-600/20 rounded-xl p-6 mb-8 border border-purple-500/30">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="bg-amber-500/20 p-3 rounded-full">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-200">{t('footer.hackathonBanner')}</h3>
            <p className="text-sm text-gray-400">{t('footer.competingIn')}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <img
              src="/black_circle_360x360.png"
              alt={t('footer.builtOnBolt')}
              className="w-5 h-5"
            />
            <span>{t('footer.builtOnBolt')}</span>
            <ExternalLink className="w-4 h-4" />
          </motion.a>
          
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://github.com/abdebek/KeysRace"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-dark-800 text-gray-300 px-4 py-2 rounded-lg hover:bg-dark-700 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>{t('footer.viewSource')}</span>
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        </div>
      </div>
    </div>
  );
}