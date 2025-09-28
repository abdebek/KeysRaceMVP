import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader, UserPlus, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface JoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
  roomName: string;
  isSubmitting: boolean;
}

export function JoinRequestModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  roomName, 
  isSubmitting 
}: JoinRequestModalProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      await onSubmit(message);
      // Modal will be closed by parent component on success
    } catch (error) {
      console.error('Failed to submit join request:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-200">
            {t('multiplayer.requestToJoin')} "{roomName}"
          </h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('multiplayer.joinMessage')}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('multiplayer.joinMessagePlaceholder')}
              className="w-full px-4 py-3 bg-dark-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-24"
            />
            <p className="text-xs text-gray-400 mt-1">
              {t('multiplayer.joinMessageDescription')}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  {t('multiplayer.sending')}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('multiplayer.sendRequest')}
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-200"
            >
              {t('common.cancel')}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}