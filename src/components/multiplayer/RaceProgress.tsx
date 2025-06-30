import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CountryFlag } from '../CountryFlags';

interface Player {
  id: string;
  username: string;
  progress: number;
  wpm: number;
  accuracy: number;
  isFinished: boolean;
  position?: number;
  country?: string;
}

interface RaceProgressProps {
  players: Player[];
  userId?: string;
  roomOwnerId?: string;
}

export function RaceProgress({ players, userId, roomOwnerId }: RaceProgressProps) {
  const { t } = useTranslation();

  // Sort players by progress and WPM
  const sortedPlayers = [...players].sort((a, b) => (b.progress - a.progress) || (b.wpm - a.wpm));

  return (
    <div className="space-y-4">
      {sortedPlayers.map((player, index) => (
        <motion.div
          key={player.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                player.position === 1 ? 'bg-amber-500 text-white' :
                player.position === 2 ? 'bg-gray-400 text-white' :
                player.position === 3 ? 'bg-amber-600 text-white' :
                'bg-dark-700 text-gray-300'
              }`}>
                {player.position || (index + 1)}
              </div>
              <CountryFlag countryCode={player.country} />
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-200">{player.username}</span>
                {player.id === userId && (
                  <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full">{t('multiplayer.you')}</span>
                )}
                {player.id === roomOwnerId && (
                  <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">
                    <Shield className="w-3 h-3 inline mr-1" />
                    {t('multiplayer.owner')}
                  </span>
                )}
                {player.isFinished && (
                  <Trophy className="w-4 h-4 text-amber-400" />
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-primary-400">{player.wpm} {t('typing.wpm')}</span>
              <span className="text-success-400">{player.accuracy}%</span>
            </div>
          </div>
          
          <div className="w-full bg-dark-800 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                player.id === userId ? 'bg-primary-500' : 'bg-gray-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${player.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}