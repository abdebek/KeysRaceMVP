import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { signUp, signIn } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useTyping } from '../contexts/TypingContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

export function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const { t } = useTranslation();
  const { setIsModalOpen } = useTyping();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update global modal state when this modal opens/closes
  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen, setIsModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        await signUp(email, password, username);
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-modal="auth"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-200">
            {mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.username')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t('auth.chooseUsername')}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={t('auth.enterEmail')}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-dark-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={t('auth.enterPassword')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-error-600/20 border border-error-500/40 rounded-lg p-3">
              <p className="text-error-300 text-sm">{error}</p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.processing') : mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {mode === 'signin' ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
            <button
              onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
              className="ml-2 text-primary-400 hover:text-primary-300 font-medium"
            >
              {mode === 'signin' ? t('auth.signUpLink') : t('auth.signInLink')}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}