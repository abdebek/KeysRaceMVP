import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Loader, RefreshCw, Plus, UserPlus, Shield, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CountryFlag } from '../CountryFlags';
import { JoinRequestModal } from './JoinRequestModal';

interface Room {
  id: string;
  name: string;
  current_players: number;
  max_players: number;
  status: string;
  country?: string;
  owner_id: string;
}

interface RoomListProps {
  activeRooms: Room[];
  isLoadingRooms: boolean;
  roomFilter: string;
  selectedRoomId: string | null;
  userId?: string;
  onRefresh: () => void;
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  onSendJoinRequest?: (roomId: string, message: string) => Promise<void>;
  setRoomFilter: (filter: string) => void;
  pendingJoinRequests?: Record<string, boolean>;
}

export function RoomList({
  activeRooms,
  isLoadingRooms,
  roomFilter,
  selectedRoomId,
  userId,
  onRefresh,
  onCreateRoom,
  onJoinRoom,
  onSendJoinRequest,
  setRoomFilter,
  pendingJoinRequests = {}
}: RoomListProps) {
  const { t } = useTranslation();
  const [joinRequestRoom, setJoinRequestRoom] = useState<Room | null>(null);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Filter rooms based on selected filter
  const getFilteredRooms = () => {
    if (roomFilter === 'all') return activeRooms;
    if (roomFilter === 'available') return activeRooms.filter(room => room.current_players < room.max_players && room.status === 'waiting');
    if (roomFilter === 'waiting') return activeRooms.filter(room => room.status === 'waiting');
    if (roomFilter === 'racing') return activeRooms.filter(room => room.status === 'racing');
    if (roomFilter === 'my-rooms') return activeRooms.filter(room => room.owner_id === userId);
    return activeRooms;
  };

  // Check if user is the owner of a room
  const isRoomOwner = (roomOwnerId: string) => {
    return userId === roomOwnerId;
  };

  // Check if room has a pending join request
  const hasPendingRequest = (roomId: string) => {
    return pendingJoinRequests[roomId] === true;
  };

  // Handle join request
  const handleJoinRequest = (room: Room) => {
    if (onSendJoinRequest) {
      setJoinRequestRoom(room);
    } else {
      // Fallback to direct join if join request feature is not available
      onJoinRoom(room.id);
    }
  };

  // Submit join request
  const handleSubmitJoinRequest = async (message: string) => {
    if (!joinRequestRoom || !onSendJoinRequest) return;
    
    setIsSubmittingRequest(true);
    try {
      await onSendJoinRequest(joinRequestRoom.id, message);
      setJoinRequestRoom(null);
    } catch (error) {
      console.error('Failed to send join request:', error);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <>
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <h3 className="text-xl font-bold text-gray-200">{t('multiplayer.activeRooms')}</h3>
          
          {/* Room Filters */}
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRoomFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                roomFilter === 'all' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-dark-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {t('multiplayer.allRooms')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRoomFilter('available')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                roomFilter === 'available' 
                  ? 'bg-success-600 text-white' 
                  : 'bg-dark-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {t('multiplayer.available')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRoomFilter('waiting')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                roomFilter === 'waiting' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-dark-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {t('multiplayer.waiting')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRoomFilter('racing')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                roomFilter === 'racing' 
                  ? 'bg-error-600 text-white' 
                  : 'bg-dark-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {t('multiplayer.inProgress')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRoomFilter('my-rooms')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                roomFilter === 'my-rooms' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-dark-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {t('multiplayer.myRooms')}
            </motion.button>
          </div>
          
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              disabled={isLoadingRooms}
              className="p-2 bg-dark-800 text-gray-300 rounded-lg hover:bg-dark-700 transition-colors"
              title={t('multiplayer.refreshRooms')}
            >
              <RefreshCw className={`w-5 h-5 ${isLoadingRooms ? 'animate-spin' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateRoom}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('multiplayer.createRoom')}</span>
            </motion.button>
          </div>
        </div>
        
        {isLoadingRooms ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        ) : getFilteredRooms().length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredRooms().map((room) => {
              const isOwner = isRoomOwner(room.owner_id);
              const isPending = hasPendingRequest(room.id);
              
              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-dark-800/50 rounded-xl p-4 border ${
                    isOwner 
                      ? 'border-purple-500/40' 
                      : isPending
                      ? 'border-amber-500/40'
                      : 'border-gray-700/30 hover:border-primary-500/30'
                  } transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <CountryFlag countryCode={room.country} size="lg" />
                        <h4 className="font-semibold text-gray-200">{room.name}</h4>
                        {isOwner && (
                          <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">
                            <Shield className="w-3 h-3 inline mr-1" />
                            {t('multiplayer.owner')}
                          </span>
                        )}
                        {room.status === 'racing' && (
                          <span className="text-xs bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                            {t('multiplayer.inProgress')}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 mt-1 flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1.5" />
                        {room.current_players}/{room.max_players} {t('multiplayer.players')}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => isOwner ? onJoinRoom(room.id) : handleJoinRequest(room)}
                      disabled={room.current_players >= room.max_players || room.status === 'racing' || selectedRoomId === room.id || isPending}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                        room.current_players >= room.max_players || room.status === 'racing'
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : selectedRoomId === room.id
                          ? 'bg-amber-600 text-white'
                          : isPending
                          ? 'bg-amber-600/70 text-white cursor-not-allowed'
                          : isOwner
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {selectedRoomId === room.id ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>{t('multiplayer.joining')}</span>
                        </>
                      ) : isPending ? (
                        <span>{t('multiplayer.requestPending')}</span>
                      ) : room.current_players >= room.max_players ? (
                        <span>{t('multiplayer.full')}</span>
                      ) : room.status === 'racing' ? (
                        <span>{t('multiplayer.inProgress')}</span>
                      ) : isOwner ? (
                        <>
                          <Shield className="w-4 h-4" />
                          <span>{t('multiplayer.resume')}</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>{t('multiplayer.join')}</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-dark-800/30 rounded-xl border border-gray-700/30">
            <Info className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-300 mb-2">{t('multiplayer.noActiveRooms')}</h4>
            <p className="text-gray-400 mb-6">{t('multiplayer.beFirstToCreate')}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateRoom}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200"
            >
              {t('multiplayer.createRoom')}
            </motion.button>
          </div>
        )}
      </div>

      {/* Join Request Modal */}
      {joinRequestRoom && (
        <JoinRequestModal
          isOpen={!!joinRequestRoom}
          onClose={() => setJoinRequestRoom(null)}
          onSubmit={handleSubmitJoinRequest}
          roomName={joinRequestRoom.name}
          isSubmitting={isSubmittingRequest}
        />
      )}
    </>
  );
}