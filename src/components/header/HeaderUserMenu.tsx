import React from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HeaderUserMenuProps {
  user: any;
  isPremium: boolean;
  onSignOut: () => void;
  onOpenAuthModal: (mode: 'signin' | 'signup') => void;
}

export function HeaderUserMenu({ user, isPremium, onSignOut, onOpenAuthModal }: HeaderUserMenuProps) {
  const { t } = useTranslation();

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onOpenAuthModal('signin')}
          className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
        >
          {t('navigation.signIn')}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onOpenAuthModal('signup')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {t('navigation.signUp')}
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {isPremium && (
        <div className="bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40">
          <Crown className="w-4 h-4 text-amber-400 inline mr-1" />
          <span className="text-amber-400 text-sm font-medium">Premium</span>
        </div>
      )}
      <div className="flex items-center space-x-2 bg-dark-800/50 rounded-lg px-3 py-2">
        <User className="w-4 h-4 text-gray-400" />
        <span className="text-gray-300 text-sm max-w-32 truncate">
          {user.username || user.email?.split('@')[0] || 'User'}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSignOut}
          className="p-1 text-gray-400 hover:text-gray-200"
          title={t('navigation.signOut')}
        >
          <LogOut className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}