import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';
import { LanguageSelector } from './LanguageSelector';
import { signOut } from '../lib/supabase';
import { BoltLogo } from './BoltLogo';
import { HeaderLogo } from './header/HeaderLogo';
import { HeaderNavigation } from './header/HeaderNavigation';
import { HeaderUserMenu } from './header/HeaderUserMenu';
import { HeaderMobileMenu } from './header/HeaderMobileMenu';

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
  const { user, loading, isPremium, isAuthenticated } = useAuth();

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
    const isPremiumFeature = ['multiplayer', 'ai-coach', 'premium'].includes(viewId);
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
            <HeaderLogo onClick={() => handleNavClick('test')} />

            {/* Desktop Navigation - Centered */}
            <HeaderNavigation 
              currentView={currentView} 
              onViewChange={handleNavClick}
              isPremium={isPremium}
              isAuthenticated={isAuthenticated}
            />

            {/* Right Side - Language, User & Bolt Logo */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="hidden lg:block">
                <LanguageSelector
                  isOpen={showLanguageSelector}
                  onToggle={() => setShowLanguageSelector(!showLanguageSelector)}
                  onClose={() => setShowLanguageSelector(false)}
                />
              </div>

              {/* User Authentication */}
              {!loading && (
                <div className="hidden lg:block">
                  <HeaderUserMenu 
                    user={user}
                    isPremium={isPremium}
                    onSignOut={handleSignOut}
                    onOpenAuthModal={openAuthModal}
                  />
                </div>
              )}

              {/* Bolt Logo - Top Right */}
              <a 
                href="https://bolt.new" 
                target="_blank" 
                rel="noopener noreferrer"
                title={t('header.builtOnBolt')}
              >
                <BoltLogo size="sm" variant="transparent" />
              </a>

              {/* Mobile Navigation Toggle */}
              <div className="lg:hidden">
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
            </div>
          </motion.header>

          {/* Mobile Navigation Menu */}
          <HeaderMobileMenu 
            isOpen={isMobileMenuOpen}
            currentView={currentView}
            onViewChange={handleNavClick}
            user={user}
            isPremium={isPremium}
            onSignOut={handleSignOut}
            onOpenAuthModal={openAuthModal}
            showLanguageSelector={showLanguageSelector}
            setShowLanguageSelector={setShowLanguageSelector}
          />
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