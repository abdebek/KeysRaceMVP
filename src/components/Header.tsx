import React, { useState } from 'react';
import { Keyboard, BarChart3, Settings, Trophy, BookOpen, Menu, X, Crown, Globe, Brain, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';
import { LanguageSelector } from './LanguageSelector';
import { signOut } from '../lib/supabase';
import { BoltLogo } from './BoltLogo';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const { user, loading, isPremium } = useAuth();

  // Simplified core navigation items
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

  const scrollToTextInput = () => {
    setTimeout(() => {
      const textDisplay = document.getElementById('text-display-area');
      if (textDisplay) {
        textDisplay.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (viewId: string) => {
    // For premium features, check if user is authenticated
    const isPremiumFeature = premiumItems.some(item => item.id === viewId);
    if (isPremiumFeature && !user) {
      setAuthMode('signup');
      setShowAuthModal(true);
      return;
    }
    
    onViewChange(viewId);
    setIsMobileMenuOpen(false);

    if (viewId === 'test') {
      scrollToTextInput();
    } else {
      scrollToTop();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      {/* Full width header container */}
      <div className="w-full bg-dark-900/50 backdrop-blur-sm border-b border-dark-700/50 relative z-40">
        <div className="w-full max-w-none px-4 py-4 md:py-6">
          <motion.header 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between w-full"
          >
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-gradient-to-br from-primary-500 to-success-500 rounded-xl cursor-pointer"
                onClick={() => handleNavClick('test')}
              >
                <Keyboard className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-xl md:text-2xl font-bold text-gradient cursor-pointer"
                  onClick={() => handleNavClick('test')}
                  whileHover={{ scale: 1.02 }}
                >
                  KeysRace
                </motion.h1>
              </div>
              
              {/* Bolt Logo in Header */}
              <div className="ml-2">
                <BoltLogo size="sm" />
              </div>
            </div>

            {/* Desktop Navigation - Centered */}
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
                        const isLocked = !user && item.id !== 'premium';
                        
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

            {/* Right Side - Language, User & Built on Bolt */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Language Selector */}
              <LanguageSelector
                isOpen={showLanguageSelector}
                onToggle={() => setShowLanguageSelector(!showLanguageSelector)}
                onClose={() => setShowLanguageSelector(false)}
              />

              {/* User Authentication */}
              {!loading && (
                <div className="flex items-center space-x-3">
                  {user ? (
                    <div className="flex items-center space-x-3">
                      {isPremium && (
                        <div className="bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40">
                          <Crown className="w-4 h-4 text-amber-400 inline mr-1" />
                          <span className="text-amber-400 text-sm font-medium">Premium</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 bg-dark-800/50 rounded-lg px-3 py-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm max-w-32 truncate">{user.username || user.email?.split('@')[0] || 'User'}</span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSignOut}
                          className="p-1 text-gray-400 hover:text-gray-200"
                          title={t('navigation.signOut')}
                        >
                          <LogOut className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openAuthModal('signin')}
                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                      >
                        {t('navigation.signIn')}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openAuthModal('signup')}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        {t('navigation.signUp')}
                      </motion.button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="lg:hidden flex items-center space-x-3">
              {/* Mobile Language Selector */}
              <LanguageSelector
                isOpen={showLanguageSelector}
                onToggle={() => setShowLanguageSelector(!showLanguageSelector)}
                onClose={() => setShowLanguageSelector(false)}
              />

              {/* Mobile Auth */}
              {!loading && !user && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openAuthModal('signin')}
                  className="p-2 text-gray-400 hover:text-gray-200"
                >
                  <User className="w-5 h-5" />
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-gray-200 hover:bg-dark-800 rounded-lg transition-all duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </motion.header>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden mt-4 pt-4 border-t border-gray-700/30 overflow-hidden"
              >
                <nav className="grid grid-cols-1 gap-2">
                  {/* Mobile Auth Section */}
                  {!loading && (
                    <div className="mb-4 pb-4 border-b border-gray-700/30">
                      {user ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-gray-300">
                            <User className="w-4 h-4" />
                            <span className="text-sm">{user.username || user.email?.split('@')[0] || 'User'}</span>
                          </div>
                          {isPremium && (
                            <div className="bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40 inline-flex items-center">
                              <Crown className="w-4 h-4 text-amber-400 mr-1" />
                              <span className="text-amber-400 text-sm font-medium">Premium</span>
                            </div>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSignOut}
                            className="flex items-center space-x-2 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>{t('navigation.signOut')}</span>
                          </motion.button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openAuthModal('signin')}
                            className="w-full px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-dark-800 transition-colors"
                          >
                            {t('navigation.signIn')}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openAuthModal('signup')}
                            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            {t('navigation.signUp')}
                          </motion.button>
                        </div>
                      )}
                    </div>
                  )}

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
        </div>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            mode={authMode}
            onModeChange={setAuthMode}
          />
        )}
      </AnimatePresence>
    </>
  );
}