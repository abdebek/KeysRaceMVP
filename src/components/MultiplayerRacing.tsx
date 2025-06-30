import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown } from 'lucide-react';
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

// Import multiplayer components
import { RoomList } from './multiplayer/RoomList';
import { RoomLobby } from './multiplayer/RoomLobby';
import { RaceProgress } from './multiplayer/RaceProgress';
import { RaceResults } from './multiplayer/RaceResults';
import { CreateRoomModal } from './multiplayer/CreateRoomModal';
import { CountdownOverlay } from './multiplayer/CountdownOverlay';
import { AuthRequiredMessage } from './multiplayer/AuthRequiredMessage';
import { LoadingState } from './multiplayer/LoadingState';

interface MultiplayerRacingProps {
  onStartRace: () => void;
}

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
        { id: 'demo-1', name: 'Speed Demons', current_players: 2, max_players: 4, status: 'waiting', country: 'US', owner_id: 'demo-owner-1' },
        { id: 'demo-2', name: 'Keyboard Warriors', current_players: 3, max_players: 4, status: 'waiting', country: 'UK', owner_id: 'demo-owner-2' },
        { id: 'demo-3', name: 'Typing Titans', current_players: 1, max_players: 4, status: 'waiting', country: 'DE', owner_id: user?.id },
        { id: 'demo-4', name: 'Code Racers', current_players: 4, max_players: 4, status: 'racing', country: 'JP', owner_id: 'demo-owner-4' },
        { id: 'demo-5', name: 'Syntax Speedsters', current_players: 2, max_players: 4, status: 'waiting', country: 'CA', owner_id: 'demo-owner-5' },
        { id: 'demo-6', name: 'Function Racers', current_players: 1, max_players: 4, status: 'waiting', country: 'FR', owner_id: user?.id },
        { id: 'demo-7', name: 'Algorithm Aces', current_players: 3, max_players: 4, status: 'waiting', country: 'IN', owner_id: 'demo-owner-7' },
        { id: 'demo-8', name: 'Byte Blazers', current_players: 2, max_players: 4, status: 'waiting', country: 'BR', owner_id: 'demo-owner-8' }
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

  const handleCreateRoom = async (name: string) => {
    if (!name.trim()) return;
    
    setIsCreatingRoom(true);
    setError(null);
    
    try {
      // Generate a random text for the race
      const randomText = getRandomText('quotes');
      await createRoom(name.trim(), randomText);
      setShowCreateRoom(false);
      setRoomName('');
    } catch (error: any) {
      console.error('Failed to create room:', error);
      setError(error.message || t('multiplayer.failedToCreateRoom'));
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
      setError(error.message || t('multiplayer.failedToJoinRoom'));
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

  // Show loading state
  if (loading) {
    return <LoadingState />;
  }

  // Show authentication required message for non-authenticated users
  if (!isAuthenticated || !user) {
    return <AuthRequiredMessage onSignIn={() => {}} />;
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
      <CountdownOverlay countdown={countdown} />

      {/* Create Room Modal */}
      <CreateRoomModal 
        isOpen={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
        onCreateRoom={handleCreateRoom}
        isCreating={isCreatingRoom}
        error={error}
      />

      {/* Main Content */}
      {!isConnected ? (
        /* Lobby - Room Selection */
        <RoomList 
          activeRooms={activeRooms}
          isLoadingRooms={isLoadingRooms}
          roomFilter={roomFilter}
          selectedRoomId={selectedRoomId}
          userId={user?.id}
          onRefresh={loadActiveRooms}
          onCreateRoom={() => setShowCreateRoom(true)}
          onJoinRoom={handleJoinRequest}
          setRoomFilter={setRoomFilter}
        />
      ) : (
        /* In Room */
        <div className="glass-card p-6">
          {gameState === 'lobby' && (
            <RoomLobby 
              room={room}
              players={players}
              user={user}
              joinRequests={joinRequests}
              showJoinRequests={showJoinRequests}
              setShowJoinRequests={setShowJoinRequests}
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
              onStartCountdown={handleStartCountdown}
              onLeaveRoom={handleLeaveRoom}
              onSimulateSecondPlayer={simulateSecondPlayer}
            />
          )}

          {(gameState === 'racing' || gameState === 'finished') && (
            <div className="space-y-6">
              {/* Race Progress */}
              <RaceProgress 
                players={players}
                userId={user?.id}
                roomOwnerId={room?.owner_id}
              />

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
                <RaceResults 
                  players={players}
                  roomOwnerId={room?.owner_id}
                  onRaceAgain={handleResetRace}
                  onLeaveRoom={handleLeaveRoom}
                />
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}