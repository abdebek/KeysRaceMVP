import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CountryFlag } from '../CountryFlags';

interface JoinRequestListProps {
  joinRequests: any[];
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export function JoinRequestList({ joinRequests, onAccept, onReject }: JoinRequestListProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-dark-800/50 rounded-xl p-4 border border-gray-700/30 overflow-hidden"
    >
      <h4 className="font-medium text-gray-200 mb-3">{t('multiplayer.pendingJoinRequests')}</h4>
      <div className="space-y-3">
        {joinRequests.map(request => (
          <div key={request.id} className="flex items-center justify-between bg-dark-700/50 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600/20 rounded-full flex items-center justify-center">
                <span className="text-primary-400 font-medium">{request.username.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CountryFlag countryCode={request.country} />
                <div>
                  <div className="font-medium text-gray-200">{request.username}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(request.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAccept(request.id)}
                className="p-2 bg-success-600/20 text-success-400 rounded-lg hover:bg-success-600/30 transition-colors"
                title={t('multiplayer.accept')}
              >
                <Check className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onReject(request.id)}
                className="p-2 bg-error-600/20 text-error-400 rounded-lg hover:bg-error-600/30 transition-colors"
                title={t('multiplayer.reject')}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}