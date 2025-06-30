import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CountryFlag } from '../CountryFlags';

interface Player {
  id: string;
  username: string;
  wpm: number;
  accuracy: number;
  position?: number;
  country?: string;
}

interface RaceResultsProps {
  players: Player[];
  roomOwnerId?: string;
  onRaceAgain: () => void;
  onLeaveRoom: () => void;
}

export function RaceResults({ players, roomOwnerId, onRaceAgain, onLeaveRoom }: RaceResultsProps) {
  const { t } = useTranslation();

  // Get top 3 players
  const topPlayers = players
    .filter(p => p.position && p.position <= 3)
    .sort((a, b) => (a.position || 999) - (b.position || 999));

  return (
    <div className="text-center space-y-6">
      <h3 className="text-2xl font-bold text-gray-200">{t('multiplayer.raceComplete')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topPlayers.map((player, index) => (
          <div key={player.id} className={`p-4 rounded-xl ${
            index === 0 ? 'bg-amber-500/20 border border-amber-500/40' :
            index === 1 ? 'bg-gray-500/20 border border-gray-500/40' :
            'bg-amber-600/20 border border-amber-600/40'
          }`}>
            <div className="text-center">
              <Trophy className={`w-8 h-8 mx-auto mb-2 ${
                index === 0 ? 'text-amber-400' :
                index === 1 ? 'text-gray-400' :
                'text-amber-600'
              }`} />
              <div className="flex items-center justify-center space-x-2 mb-1">
                <CountryFlag countryCode={player.country} />
                <div className="font-bold text-gray-200">{player.username}</div>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="text-sm text-gray-400">{player.wpm} {t('typing.wpm')}</div>
                <div className="text-xs text-gray-500">{player.accuracy}% {t('typing.accuracy')}</div>
              </div>
              {player.id === roomOwnerId && (
                <div className="mt-2">
                  <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">
                    <Shield className="w-3 h-3 inline mr-1" />
                    {t('multiplayer.roomOwner')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex space-x-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRaceAgain}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200"
        >
          {t('multiplayer.raceAgain')}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLeaveRoom}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-200"
        >
          {t('multiplayer.leaveRoom')}
        </motion.button>
      </div>
    </div>
  );
}