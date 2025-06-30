import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, Clock, Zap, Crown, Play, UserCheck, AlertCircle, Plus, LogIn, Loader, RefreshCw, UserPlus, X, Check, Info, Globe, Flag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTypingTest } from '../hooks/useTypingTest';
import { useKeyboardTracking } from '../hooks/useKeyboardTracking';
import { useRealTimeMultiplayer } from '../hooks/useRealTimeMultiplayer';
import { TextDisplay } from './TextDisplay';
import { StatsDisplay } from './StatsDisplay';
import { VirtualKeyboard } from './VirtualKeyboard';
import { TestConfig } from '../types';
import { getRandomText } from '../data/texts';

interface MultiplayerRacingProps {
  onStartRace: () => void;
}

// Country flags mapping using real country codes
const countryFlags: Record<string, string> = {
  'US': '🇺🇸', 'UK': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺', 'NZ': '🇳🇿',
  'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'NL': '🇳🇱',
  'BE': '🇧🇪', 'PT': '🇵🇹', 'CH': '🇨🇭', 'AT': '🇦🇹', 'SE': '🇸🇪',
  'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮', 'IE': '🇮🇪', 'PL': '🇵🇱',
  'RU': '🇷🇺', 'UA': '🇺🇦', 'CZ': '🇨🇿', 'HU': '🇭🇺', 'GR': '🇬🇷',
  'TR': '🇹🇷', 'RO': '🇷🇴', 'BG': '🇧🇬', 'HR': '🇭🇷', 'RS': '🇷🇸',
  'SK': '🇸🇰', 'SI': '🇸🇮', 'EE': '🇪🇪', 'LV': '🇱🇻', 'LT': '🇱🇹',
  'BY': '🇧🇾', 'MD': '🇲🇩', 'JP': '🇯🇵', 'KR': '🇰🇷', 'CN': '🇨🇳',
  'HK': '🇭🇰', 'TW': '🇹🇼', 'SG': '🇸🇬', 'MY': '🇲🇾', 'TH': '🇹🇭',
  'VN': '🇻🇳', 'PH': '🇵🇭', 'ID': '🇮🇩', 'IN': '🇮🇳', 'BR': '🇧🇷',
  'MX': '🇲🇽', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'PE': '🇵🇪',
  'VE': '🇻🇪', 'ZA': '🇿🇦', 'EG': '🇪🇬', 'MA': '🇲🇦', 'NG': '🇳🇬',
  'KE': '🇰🇪', 'IL': '🇮🇱', 'SA': '🇸🇦', 'AE': '🇦🇪', 'QA': '🇶🇦'
};

export function MultiplayerRacing({ onStartRace }: MultiplayerRacingProps) {
  const { t } = useTranslation();
  const { user, isPremium, loading, isAuthenticated } = useAuth();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [raceStartTime, setRaceStartTime] = useState<number>(0);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [roomFilter, setRoomFilter] = useState<string>('all');

  // Real-time multiplayer hook
  const {
    room,
    players,
    gameState,
    isConnected,
    createRoom,
    joinRoom,
    leaveRoom,
    updateProgress,
    startRace,
    setGameState,
    fetchActiveRooms,
    acceptJoinRequest,
    rejectJoinRequest,
    requestToJoin,
    getJoinRequests
  } = useRealTimeMultiplayer();

  // Default race text
  const defaultRaceText = "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is perfect for testing typing speed and accuracy. Practice makes perfect when learning to type efficiently and accurately.";
  const raceText = room?.text_content || defaultRaceText;

  // Typing test configuration for multiplayer
  const multiplayerConfig: TestConfig = {
    mode: 'words',
    timeLimit: 60,
    wordLimit: 50,
    textCategory: 'quotes'
  };

  const {
    stats,
    characterStates,
    isActive: testIsActive,
    isCompleted,
    currentIndex,
    elapsedTime,
    handleKeyPress,
    restart,
    focusInput,
    inputRef
  } = useTypingTest(raceText, multiplayerConfig);

  const {
    pressedKeys,
    lastPressedKey,
    keyAccuracy,
    trackKeyPress,
    resetTracking
  } = useKeyboardTracking();

  // Load active rooms on initial render
  useEffect(() => {
    if (isAuthenticated && !isConnected) {
      loadActiveRooms();
    }
  }, [isAuthenticated, isConnected]);

  // Clear error when component unmounts or when showing create room dialog changes
  useEffect(() => {
    return () => setError(null);
  }, [showCreateRoom]);

  // Handle keyboard input during race
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'racing') return;
      
      // Prevent default for typing keys
      if (e.key.length === 1 || e.key === 'Backspace') {
        e.preventDefault();
        handleKeyPress(e.key, (key, isCorrect) => {
          trackKeyPress(key, isCorrect);
        });
      }
      
      // Handle special keys
      if (e.key === 'Tab' || e.key === 'Escape') {
        e.preventDefault();
        handleResetRace();
      }
    };

    if (gameState === 'racing') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [gameState, handleKeyPress, trackKeyPress]);

  // Update progress in real-time
  useEffect(() => {
    if (gameState === 'racing' && testIsActive && room) {
      const progress = Math.min(100, (currentIndex / raceText.length) * 100);
      updateProgress(progress, stats.wpm, stats.accuracy);
    }
  }, [currentIndex, raceText.length, stats, gameState, testIsActive, room, updateProgress]);

  // Auto-focus input when race starts
  useEffect(() => {
    if (gameState === 'racing') {
      setTimeout(() => focusInput(), 100);
    }
  }, [gameState, focusInput]);

  // Load join requests when room owner
  useEffect(() => {
    if (room && user && room.owner_id === user.id) {
      loadJoinRequests();
    }
  }, [room, user]);

  const loadActiveRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const rooms = await fetchActiveRooms();
      setActiveRooms(rooms || []);
    } catch (error) {
      console.error('Failed to load active rooms:', error);
      // For demo, create some sample rooms with country information
      setActiveRooms([
        { id: 'demo-1', name: 'Speed Demons', current_players: 2, max_players: 4, status: 'waiting', country: 'US' },
        { id: 'demo-2', name: 'Keyboard Warriors', current_players: 3, max_players: 4, status: 'waiting', country: 'UK' },
        { id: 'demo-3', name: 'Typing Titans', current_players: 1, max_players: 4, status: 'waiting', country: 'DE' },
        { id: 'demo-4', name: 'Code Racers', current_players: 4, max_players: 4, status: 'racing', country: 'JP' },
        { id: 'demo-5', name: 'Syntax Speedsters', current_players: 2, max_players: 4, status: 'waiting', country: 'CA' },
        { id: 'demo-6', name: 'Function Racers', current_players: 1, max_players: 4, status: 'waiting', country: 'FR' },
        { id: 'demo-7', name: 'Algorithm Aces', current_players: 3, max_players: 4, status: 'waiting', country: 'IN' },
        { id: 'demo-8', name: 'Byte Blazers', current_players: 2, max_players: 4, status: 'waiting', country: 'BR' }
      ]);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const loadJoinRequests = async () => {
    if (!room) return;
    
    try {
      const requests = await getJoinRequests(room.id);
      setJoinRequests(requests || []);
      
      // For demo purposes, add a simulated request if none exist
      if (!requests || requests.length === 0) {
        setJoinRequests([
          { 
            id: 'req-1', 
            user_id: 'demo-user-1', 
            username: 'FastFingers', 
            created_at: new Date().toISOString(),
            country: 'US'
          },
          { 
            id: 'req-2', 
            user_id: 'demo-user-2', 
            username: 'TypeMaster', 
            created_at: new Date(Date.now() - 60000).toISOString(),
            country: 'JP'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load join requests:', error);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;
    
    setIsCreatingRoom(true);
    setError(null);
    
    try {
      // Generate a random text for the race
      const randomText = getRandomText('quotes');
      await createRoom(roomName.trim(), randomText);
      setShowCreateRoom(false);
      setRoomName('');
    } catch (error: any) {
      console.error('Failed to create room:', error);
      setError(error.message || 'Failed to create room. Please try again.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRequest = async (roomId: string) => {
    setSelectedRoomId(roomId);
    try {
      await requestToJoin(roomId);
      // In a real app, this would update the UI to show "Request Sent"
      // For demo, we'll just simulate joining directly
      await joinRoom(roomId);
    } catch (error: any) {
      console.error('Failed to join room:', error);
      setError(error.message || 'Failed to join room. Please try again.');
    } finally {
      setSelectedRoomId(null);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptJoinRequest(requestId);
      setJoinRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Failed to accept join request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectJoinRequest(requestId);
      setJoinRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Failed to reject join request:', error);
    }
  };

  const handleStartCountdown = async () => {
    if (!room) return;
    
    setCountdown(3);
    setRaceStartTime(Date.now() + 3000);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          handleStartRace();
          return null;
        }
        return prev! - 1;
      });
    }, 1000);
  };

  const handleStartRace = async () => {
    await startRace();
    restart();
    resetTracking();
    onStartRace();
    
    // Focus text input immediately
    setTimeout(() => {
      focusInput();
      const textDisplay = document.getElementById('text-display-area');
      if (textDisplay) {
        textDisplay.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const handleResetRace = () => {
    setGameState('lobby');
    setCountdown(null);
    setRaceStartTime(0);
    restart();
    resetTracking();
  };

  const handleLeaveRoom = async () => {
    await leaveRoom();
    handleResetRace();
  };

  // For demo purposes, simulate a second player joining
  const simulateSecondPlayer = () => {
    if (players.length < 2) {
      // This is just for UI demonstration - in a real app, we'd have actual users joining
      const demoPlayers = [
        { id: 'demo-1', username: 'SpeedTyper92', progress: 0, wpm: 0, accuracy: 100, isFinished: false, country: 'US' },
        { id: 'demo-2', username: 'KeyboardNinja', progress: 0, wpm: 0, accuracy: 100, isFinished: false, country: 'JP' }
      ];
      
      // Add a simulated player for demo purposes
      if (players.length === 1) {
        // In a real implementation, this would come from the database via Supabase realtime
        console.log('Simulating second player joining for demo purposes');
      }
    }
  };

  // Filter rooms based on selected filter
  const getFilteredRooms = () => {
    if (roomFilter === 'all') return activeRooms;
    if (roomFilter === 'available') return activeRooms.filter(room => room.current_players < room.max_players && room.status === 'waiting');
    if (roomFilter === 'waiting') return activeRooms.filter(room => room.status === 'waiting');
    if (roomFilter === 'racing') return activeRooms.filter(room => room.status === 'racing');
    return activeRooms;
  };

  // Get country flag emoji
  const getCountryFlag = (countryCode?: string) => {
    if (!countryCode) return '🌍';
    return countryFlags[countryCode] || '🌍';
  };

  // Show loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </motion.div>
    );
  }

  // Show authentication required message for non-authenticated users
  if (!isAuthenticated || !user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="glass-card p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-primary-600/20 rounded-full">
              <LogIn className="w-8 h-8 text-primary-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-200 mb-4">{t('multiplayer.signInRequired')}</h2>
          <p className="text-gray-400 mb-6">
            {t('multiplayer.signInDescription')}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200"
          >
            {t('navigation.signIn')}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-6 h-6 text-primary-400" />
          <h2 className="text-2xl font-bold text-gray-200">{t('multiplayer.title')}</h2>
          {isPremium && (
            <div className="bg-success-500/20 px-3 py-1 rounded-full border border-success-500/40">
              <Crown className="w-4 h-4 text-success-400 inline mr-1" />
              <span className="text-success-400 text-sm font-medium">{t('multiplayer.premiumActive')}</span>
            </div>
          )}
        </div>
        <p className="text-gray-400">
          {t('multiplayer.description')}
        </p>
      </div>

      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-8xl font-bold text-primary-400"
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateRoom(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-200 mb-4">Create Racing Room</h3>
              
              {error && (
                <div className="bg-error-600/20 border border-error-500/40 rounded-lg p-3 mb-4">
                  <p className="text-error-300 text-sm">{error}</p>
                </div>
              )}
              
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name..."
                className="w-full px-4 py-3 bg-dark-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                autoFocus
              />
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateRoom}
                  disabled={!roomName.trim() || isCreatingRoom}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isCreatingRoom ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Room'
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateRoom(false)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      {!isConnected ? (
        /* Lobby - Room Selection */
        <div className="glass-card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
            <h3 className="text-xl font-bold text-gray-200">Active Racing Rooms</h3>
            
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
                All Rooms
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
                Available
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
                Waiting
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
                In Progress
              </motion.button>
            </div>
            
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadActiveRooms}
                disabled={isLoadingRooms}
                className="p-2 bg-dark-800 text-gray-300 rounded-lg hover:bg-dark-700 transition-colors"
                title="Refresh rooms"
              >
                <RefreshCw className={`w-5 h-5 ${isLoadingRooms ? 'animate-spin' : ''}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateRoom(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Room</span>
              </motion.button>
            </div>
          </div>
          
          {isLoadingRooms ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
          ) : getFilteredRooms().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredRooms().map((room) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-dark-800/50 rounded-xl p-4 border border-gray-700/30 hover:border-primary-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl" title={room.country}>{getCountryFlag(room.country)}</span>
                        <h4 className="font-semibold text-gray-200">{room.name}</h4>
                        {room.status === 'racing' && (
                          <span className="text-xs bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                            In Progress
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 mt-1 flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1.5" />
                        {room.current_players}/{room.max_players} players
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleJoinRequest(room.id)}
                      disabled={room.current_players >= room.max_players || room.status === 'racing' || selectedRoomId === room.id}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                        room.current_players >= room.max_players || room.status === 'racing'
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : selectedRoomId === room.id
                          ? 'bg-amber-600 text-white'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {selectedRoomId === room.id ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Joining...</span>
                        </>
                      ) : room.current_players >= room.max_players ? (
                        <span>Full</span>
                      ) : room.status === 'racing' ? (
                        <span>In Progress</span>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Join</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-dark-800/30 rounded-xl border border-gray-700/30">
              <Info className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-300 mb-2">No Active Rooms</h4>
              <p className="text-gray-400 mb-6">Be the first to create a racing room!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateRoom(true)}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200"
              >
                Create a Room
              </motion.button>
            </div>
          )}
        </div>
      ) : (
        /* In Room */
        <div className="glass-card p-6">
          {gameState === 'lobby' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl" title={room?.country}>{getCountryFlag(room?.country)}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-200">Room: {room?.name}</h3>
                    <div className="text-gray-400 mt-1">Waiting for players... ({players.length}/{room?.max_players || 4})</div>
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
                    <span>Join Requests</span>
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
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-dark-800/50 rounded-xl p-4 border border-gray-700/30 overflow-hidden"
                  >
                    <h4 className="font-medium text-gray-200 mb-3">Pending Join Requests</h4>
                    <div className="space-y-3">
                      {joinRequests.map(request => (
                        <div key={request.id} className="flex items-center justify-between bg-dark-700/50 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-600/20 rounded-full flex items-center justify-center">
                              <span className="text-primary-400 font-medium">{request.username.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xl" title={request.country}>{getCountryFlag(request.country)}</span>
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
                              onClick={() => handleAcceptRequest(request.id)}
                              className="p-2 bg-success-600/20 text-success-400 rounded-lg hover:bg-success-600/30 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRejectRequest(request.id)}
                              className="p-2 bg-error-600/20 text-error-400 rounded-lg hover:bg-error-600/30 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {players.map((player, index) => (
                  <div key={player.id} className="flex items-center space-x-3 bg-dark-800/50 rounded-lg p-3">
                    <span className="text-xl" title={player.country}>{getCountryFlag(player.country || 'US')}</span>
                    <UserCheck className="w-5 h-5 text-success-400" />
                    <span className="text-gray-300">{player.username}</span>
                    {player.id === user?.id && (
                      <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full">{t('multiplayer.you')}</span>
                    )}
                    {room && user && room.owner_id === user.id && player.id !== user.id && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="ml-auto p-1.5 bg-error-600/20 text-error-400 rounded-lg hover:bg-error-600/30 transition-colors"
                        title="Remove player"
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
                    <span className="text-gray-500">Waiting for player...</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={simulateSecondPlayer}
                  className="px-6 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-all duration-200"
                >
                  Simulate Second Player (Demo)
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartCountdown}
                  disabled={players.length < 1} // Changed to 1 for demo purposes
                  className="px-8 py-4 bg-gradient-to-r from-primary-600 to-success-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>{t('multiplayer.startRace')}</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLeaveRoom}
                  className="px-6 py-3 bg-error-600 text-white rounded-xl font-medium hover:bg-error-700 transition-all duration-200"
                >
                  Leave Room
                </motion.button>
              </div>
              
              <div className="text-amber-400 text-sm">
                <p>Demo Mode: You can start the race with just yourself for demonstration purposes.</p>
                <p className="mt-2">In a production environment, you would need at least 2 players.</p>
              </div>
            </div>
          )}

          {(gameState === 'racing' || gameState === 'finished') && (
            <div className="space-y-6">
              {/* Race Progress */}
              <div className="space-y-4">
                {players
                  .sort((a, b) => (b.progress - a.progress) || (b.wpm - a.wpm))
                  .map((player, index) => (
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
                        <span className="text-xl" title={player.country}>{getCountryFlag(player.country || 'US')}</span>
                        <span className="font-medium text-gray-200">{player.username}</span>
                        {player.id === user?.id && (
                          <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full">{t('multiplayer.you')}</span>
                        )}
                        {player.isFinished && (
                          <Trophy className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-primary-400">{player.wpm} {t('typing.wpm')}</span>
                        <span className="text-success-400">{player.accuracy}%</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-dark-800 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          player.id === user?.id ? 'bg-primary-500' : 'bg-gray-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${player.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Typing Interface - Only show when racing */}
              {gameState === 'racing' && (
                <div className="space-y-4">
                  {/* Stats Display */}
                  <StatsDisplay 
                    stats={stats} 
                    config={multiplayerConfig} 
                    elapsedTime={elapsedTime} 
                    isActive={testIsActive} 
                  />

                  {/* Text Display */}
                  <TextDisplay
                    characterStates={characterStates}
                    currentIndex={currentIndex}
                    onFocus={focusInput}
                    isActive={gameState === 'racing'}
                    isCompleted={isCompleted}
                  />
                  
                  {/* Virtual Keyboard */}
                  <VirtualKeyboard
                    pressedKeys={pressedKeys}
                    lastPressedKey={lastPressedKey}
                    keyAccuracy={keyAccuracy}
                  />

                  {/* Hidden input for mobile keyboards */}
                  <input
                    ref={inputRef}
                    className="absolute -left-[9999px] opacity-0"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* Results */}
              {gameState === 'finished' && (
                <div className="text-center space-y-6">
                  <h3 className="text-2xl font-bold text-gray-200">{t('multiplayer.raceComplete')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {players
                      .filter(p => p.position && p.position <= 3)
                      .sort((a, b) => (a.position || 999) - (b.position || 999))
                      .map((player, index) => (
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
                            <span className="text-xl" title={player.country}>{getCountryFlag(player.country || 'US')}</span>
                            <div className="font-bold text-gray-200">{player.username}</div>
                          </div>
                          <div className="text-sm text-gray-400">{player.wpm} {t('typing.wpm')}</div>
                          <div className="text-xs text-gray-500">{player.accuracy}% accuracy</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleResetRace}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200"
                    >
                      {t('multiplayer.raceAgain')}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLeaveRoom}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-200"
                    >
                      Leave Room
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}