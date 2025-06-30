import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomName: string) => void;
  isCreating: boolean;
  error: string | null;
}

export function CreateRoomModal({ isOpen, onClose, onCreateRoom, isCreating, error }: CreateRoomModalProps) {
  const { t } = useTranslation();
  const [roomName, setRoomName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim() && !isCreating) {
      onCreateRoom(roomName);
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
        <h3 className="text-xl font-bold text-gray-200 mb-4">{t('multiplayer.createRacingRoom')}</h3>
        
        {error && (
          <div className="bg-error-600/20 border border-error-500/40 rounded-lg p-3 mb-4">
            <p className="text-error-300 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder={t('multiplayer.enterRoomName')}
            className="w-full px-4 py-3 bg-dark-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            autoFocus
          />
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!roomName.trim() || isCreating}
              className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isCreating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  {t('multiplayer.creating')}
                </>
              ) : (
                t('multiplayer.createRoom')
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