import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Trophy, Keyboard, Crown, Brain, Globe, Settings, User, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../LanguageSelector';
import { DemoUserButton } from '../DemoUserButton';

interface HeaderMobileMenuProps {
  isOpen: boolean;
  currentView: string;
  onViewChange: (view: string) => void;
  user: any;
  isPremium: boolean;
  onSignOut: () => void;
  onOpenAuthModal: (mode: 'signin' | 'signup') => void;
  showLanguageSelector: boolean;
  setShowLanguageSelector: (show: boolean) => void;
}

export function HeaderMobileMenu({
  isOpen,
  currentView,
  onViewChange,
  user,
  isPremium,
  onSignOut,
  onOpenAuthModal,
  showLanguageSelector,
  setShowLanguageSelector
}: HeaderMobileMenuProps) {
  const { t } = useTranslation();
  
  // Check if current user is a demo user
  const isDemoUser = user?.id?.startsWith('demo-');

  // Core navigation items
  const navItems = [
    { id: 'test', label: t('navigation.test'), icon: Keyboard },
    { id: 'stats', label: t('navigation.stats'), icon: BarChart3 },
    { id: 'leaderboard', label: t('navigation.leaderboard'), icon: Trophy },
  ];

  // Premium features
  const premiumItems = [
    { id: 'multiplayer', label: t('navigation.multiplayer'), icon: Globe },
    { id: 'ai-coach', label: t('navigation.aiCoach'), icon: Brain },
    { id: 'premium', label: t('navigation.premium'), icon: Crown },
  ];

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden mt-4 pt-4 border-t border-gray-700/30 overflow-hidden"
        >
          <nav className="grid grid-cols-1 gap-2">
            {/* Mobile Auth Section */}
            {user ? (
              <div className="mb-4 pb-4 border-b border-gray-700/30">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <User className="w-4 h-4" />
                    <span className="text-sm">
                      {user.user_metadata?.username || user.username || user.email?.split('@')[0] || 'User'}
                      {isDemoUser && <span className="ml-1 text-amber-400">(Demo)</span>}
                    </span>
                  </div>
                  {isPremium && (
                    <div className="bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40 inline-flex items-center">
                      <Crown className="w-4 h-4 text-amber-400 mr-1" />
                      <span className="text-amber-400 text-sm font-medium">Premium</span>
                    </div>
                  )}
                  {isDemoUser ? (
                    <DemoUserButton className="w-full" />
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onSignOut}
                      className="flex items-center space-x-2 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('navigation.signOut')}</span>
                    </motion.button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-4 pb-4 border-b border-gray-700/30">
                <div className="space-y-2">
                  <DemoUserButton className="w-full" />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onOpenAuthModal('signin')}
                    className="w-full px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-dark-800 transition-colors"
                  >
                    {t('navigation.signIn')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onOpenAuthModal('signup')}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {t('navigation.signUp')}
                  </motion.button>
                </div>
              </div>
            )}

            {/* Language Selector in Mobile Menu */}
            <div className="mb-4 pb-4 border-b border-gray-700/30">
              <LanguageSelector
                isOpen={showLanguageSelector}
                onToggle={() => setShowLanguageSelector(!showLanguageSelector)}
                onClose={() => setShowLanguageSelector(false)}
                isMobile={true}
              />
            </div>

            {/* Core Navigation */}
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-left
                    ${isActive 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
            
            {/* Settings in mobile menu */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navItems.length * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavClick('settings')}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-left
                ${currentView === 'settings'
                  ? 'bg-gray-600 text-white shadow-lg shadow-gray-600/25' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800'
                }
              `}
            >
              <Settings className="w-5 h-5" />
              <span>{t('navigation.settings')}</span>
            </motion.button>
            
            {/* Premium Section */}
            <div className="border-t border-gray-700/30 mt-2 pt-2">
              <div className="text-xs text-gray-500 px-4 py-2 font-medium">{t('navigation.premium')}</div>
              {premiumItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const isLocked = !user && item.id !== 'premium';
                
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + index) * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-left w-full
                      ${isActive 
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800'
                      }
                      ${isLocked ? 'opacity-60' : ''}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {isLocked && (
                      <Crown className="w-4 h-4 text-amber-400 ml-auto" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}