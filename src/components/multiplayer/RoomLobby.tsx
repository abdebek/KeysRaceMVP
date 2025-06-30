import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, X, Check, UserPlus, Shield, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CountryFlag } from '../CountryFlags';
import { JoinRequestList } from './JoinRequestList';

interface Player {
  id: string;
  username: string;
  country?: string;
}

interface RoomLobbyProps {
  room: any;
  players: Player[];
  user: any;
  joinRequests: any[];
  showJoinRequests: boolean;
  setShowJoinRequests: (show: boolean) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onStartCountdown: () => void;
  onLeaveRoom: () => void;
  onSimulateSecondPlayer: () => void;
}

export function RoomLobby({
  room,
  players,
  user,
  joinRequests,
  showJoinRequests,
  setShowJoinRequests,
  onAcceptRequest,
  onRejectRequest,
  onStartCountdown,
  onLeaveRoom,
  onSimulateSecondPlayer
}: RoomLobbyProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CountryFlag countryCode={room?.country} size="lg" />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-gray-200">Room: {room?.name}</h3>
              {room && user && room.owner_id === user.id && (
                <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">
                  <Shield className="w-3 h-3 inline mr-1" />
                  {t('multiplayer.owner')}
                </span>
              )}
            </div>
            <div className="text-gray-400 mt-1">
              {t('multiplayer.waitingForPlayers', { current: players.length, max: room?.max_players || 4 })}
            </div>
          </div>
        </div>
        
        {/* Join Requests Button - Only show for room owner */}
        {room && user && room.owner_id === user.id && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowJoinRequests(!showJoinRequests)}
            className="px-4 py-2 bg-dark-800 text-gray-300 rounded-lg hover:bg-dark-700 transition-colors flex items-center space-x-2 relative"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('multiplayer.joinRequests')}</span>
            {joinRequests.length > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-xs text-white">
                {joinRequests.length}
              </div>
            )}
          </motion.button>
        )}
      </div>
      
      {/* Join Requests Panel */}
      <AnimatePresence>
        {showJoinRequests && joinRequests.length > 0 && (
          <JoinRequestList 
            joinRequests={joinRequests} 
            onAccept={onAcceptRequest} 
            onReject={onRejectRequest} 
          />
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {players.map((player) => (
          <div key={player.id} className="flex items-center space-x-3 bg-dark-800/50 rounded-lg p-3">
            <CountryFlag countryCode={player.country} />
            <UserCheck className="w-5 h-5 text-success-400" />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-gray-300">{player.username}</span>
                {player.id === user?.id && (
                  <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full">{t('multiplayer.you')}</span>
                )}
                {room && room.owner_id === player.id && (
                  <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">
                    <Shield className="w-3 h-3 inline mr-1" />
                    {t('multiplayer.owner')}
                  </span>
                )}
              </div>
            </div>
            {room && user && room.owner_id === user.id && player.id !== user.id && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 bg-error-600/20 text-error-400 rounded-lg hover:bg-error-600/30 transition-colors"
                title={t('multiplayer.removePlayer')}
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        ))}
        
        {/* Empty slots */}
        {Array.from({ length: (room?.max_players || 4) - players.length }).map((_, index) => (
          <div key={`empty-${index}`} className="flex items-center space-x-3 bg-dark-800/30 rounded-lg p-3 border-2 border-dashed border-gray-600">
            <div className="w-5 h-5 border-2 border-dashed border-gray-600 rounded" />
            <span className="text-gray-500">{t('multiplayer.waitingForPlayer')}</span>
          </div>
        ))}
      </div>
      
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSimulateSecondPlayer}
          className="px-6 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-all duration-200"
        >
          {t('multiplayer.simulateSecondPlayer')}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartCountdown}
          disabled={players.length < 1} // Changed to 1 for demo purposes
          className="px-8 py-4 bg-gradient-to-r from-primary-600 to-success-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Play className="w-5 h-5" />
          <span>{t('multiplayer.startRace')}</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLeaveRoom}
          className="px-6 py-3 bg-error-600 text-white rounded-xl font-medium hover:bg-error-700 transition-all duration-200"
        >
          {t('multiplayer.leaveRoom')}
        </motion.button>
      </div>
      
      <div className="text-amber-400 text-sm">
        <p>{t('multiplayer.demoMode')}</p>
        <p className="mt-2">{t('multiplayer.productionNote')}</p>
      </div>
    </div>
  );
}