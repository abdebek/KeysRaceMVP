import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Trophy, Keyboard, Crown, Brain, Globe, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HeaderNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isPremium: boolean;
  isAuthenticated: boolean;
}

export function HeaderNavigation({ currentView, onViewChange, isPremium, isAuthenticated }: HeaderNavigationProps) {
  const { t } = useTranslation();

  // Core navigation items
  const navItems = [
    { id: 'test', label: t('navigation.test'), icon: Keyboard },
    { id: 'stats', label: t('navigation.stats'), icon: BarChart3 },
    { id: 'leaderboard', label: t('navigation.leaderboard'), icon: Trophy },
  ];

  // Premium features in dropdown
  const premiumItems = [
    { id: 'multiplayer', label: t('navigation.multiplayer'), icon: Globe },
    { id: 'ai-coach', label: t('navigation.aiCoach'), icon: Brain },
    { id: 'premium', label: t('navigation.premium'), icon: Crown },
  ];

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
  };

  return (
    <nav className="hidden lg:flex items-center justify-center flex-1 space-x-2">
      {/* Core Navigation Items */}
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        
        return (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavClick(item.id)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${isActive 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{item.label}</span>
          </motion.button>
        );
      })}

      {/* Premium Dropdown */}
      <div className="relative group">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${premiumItems.some(item => currentView === item.id)
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800'
            }
          `}
        >
          <Crown className="w-4 h-4" />
          <span className="text-sm">{t('navigation.premium')}</span>
          {isPremium && (
            <div className="w-2 h-2 bg-amber-400 rounded-full" />
          )}
        </motion.button>

        {/* Dropdown Menu */}
        <div className="absolute top-full left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
          <div className="relative bg-dark-900/90 backdrop-blur-xl border border-gray-600/50 rounded-xl p-2 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-xl pointer-events-none" />
            
            <div className="relative z-10">
              {premiumItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const isLocked = !isAuthenticated && item.id !== 'premium';
                
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-3 rounded-lg font-medium transition-all duration-200 text-left
                      ${isActive 
                        ? 'bg-primary-600/90 text-white shadow-lg' 
                        : 'text-gray-300 hover:text-white hover:bg-dark-800/80'
                      }
                      ${isLocked ? 'opacity-70' : ''}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                    {isLocked && <Crown className="w-3 h-3 text-amber-400 ml-auto" />}
                  </motion.button>
                );
              })}
              
              {/* Settings in dropdown */}
              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavClick('settings')}
                className={`
                  w-full flex items-center space-x-3 px-3 py-3 rounded-lg font-medium transition-all duration-200 text-left
                  ${currentView === 'settings'
                    ? 'bg-gray-600/90 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-dark-800/80'
                  }
                `}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">{t('navigation.settings')}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}