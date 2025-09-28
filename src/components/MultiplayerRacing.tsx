import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTypingTest } from '../hooks/useTypingTest';
import { useKeyboardTracking } from '../hooks/useKeyboardTracking';
import { useRealTimeMultiplayer } from '../hooks/useRealTimeMultiplayer';
import { TestConfig } from '../types';
import { getRandomText } from '../data/texts';

// Import multiplayer components
import { MultiplayerHeader } from './multiplayer/MultiplayerHeader';
import { RoomList } from './multiplayer/RoomList';
import { RoomLobby } from './multiplayer/RoomLobby';
import { RaceProgress } from './multiplayer/RaceProgress';
import { RaceResults } from './multiplayer/RaceResults';
import { CreateRoomModal } from './multiplayer/CreateRoomModal';
import { CountdownOverlay } from './multiplayer/CountdownOverlay';
import { AuthRequiredMessage } from './multiplayer/AuthRequiredMessage';
import { LoadingState } from './multiplayer/LoadingState';
import { RaceInterface } from './multiplayer/RaceInterface';

interface MultiplayerRacingProps {
  onStartRace: () => void;
}

export function MultiplayerRacing({ onStartRace }: MultiplayerRacingProps) {
  const { t } = useTranslation();
  const { user, isPremium, loading, isAuthenticated } = useAuth();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [raceStartTime, setRaceStartTime] = useState<number>(0);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [pendingJoinRequests, setPendingJoinRequests] = useState<Record<string, boolean>>({});

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
    getJoinRequests,
    sendJoinRequest
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

  // Handle keyboard input during race - memoized to prevent unnecessary re-renders
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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
  }, [gameState, handleKeyPress, trackKeyPress]);

  // Update progress in real-time - optimized to reduce updates
  useEffect(() => {
    if (gameState === 'racing' && testIsActive && room) {
      const progress = Math.min(100, (currentIndex / raceText.length) * 100);
      
      // Throttle updates to reduce network traffic
      const updateThrottled = () => {
        updateProgress(progress, stats.wpm, stats.accuracy);
      };
      
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(updateThrottled);
    }
  }, [currentIndex, raceText.length, stats, gameState, testIsActive, room, updateProgress]);

  // Set up keyboard event listener
  useEffect(() => {
    if (gameState === 'racing') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [gameState, handleKeyDown]);

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
            country: 'US',
            message: 'Hi, I would like to join your race! I average around 80 WPM.'
          },
          { 
            id: 'req-2', 
            user_id: 'demo-user-2', 
            username: 'TypeMaster', 
            created_at: new Date(Date.now() - 60000).toISOString(),
            country: 'JP',
            message: 'Looking for a challenge! Can I join?'
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
      // For rooms owned by the current user, join directly
      const room = activeRooms.find(r => r.id === roomId);
      if (room && room.owner_id === user?.id) {
        await joinRoom(roomId);
        return;
      }
      
      // For other rooms, send a join request
      if (sendJoinRequest) {
        // Mark this room as having a pending request
        setPendingJoinRequests(prev => ({ ...prev, [roomId]: true }));
        
        // In a real app, we'd wait for the owner to accept
        // For demo, we'll just join directly after a delay
        setTimeout(async () => {
          await joinRoom(roomId);
          setPendingJoinRequests(prev => ({ ...prev, [roomId]: false }));
        }, 1500);
      } else {
        // Fallback to direct join
        await joinRoom(roomId);
      }
    } catch (error: any) {
      console.error('Failed to join room:', error);
      setError(error.message || t('multiplayer.failedToJoinRoom'));
      setPendingJoinRequests(prev => ({ ...prev, [roomId]: false }));
    } finally {
      setSelectedRoomId(null);
    }
  };

  // Handle sending a join request with a message
  const handleSendJoinRequest = async (roomId: string, message: string) => {
    try {
      // In a real app, this would send the request to the database
      console.log(`Sending join request for room ${roomId} with message: ${message}`);
      
      // For demo purposes, simulate sending and auto-accept
      setPendingJoinRequests(prev => ({ ...prev, [roomId]: true }));
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Auto-join for demo
      await joinRoom(roomId);
      
      // Clear pending state
      setPendingJoinRequests(prev => ({ ...prev, [roomId]: false }));
    } catch (error) {
      console.error('Failed to send join request:', error);
      setPendingJoinRequests(prev => ({ ...prev, [roomId]: false }));
      throw error;
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
      console.log('Simulating second player joining for demo purposes');
    }
  };

  // Show loading state
  if (loading) {
    return <LoadingState />;
  }

  // Show authentication required message for non-authenticated users
  if (!isAuthenticated || !user) {
    return <AuthRequiredMessage />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <MultiplayerHeader isPremium={isPremium} />

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
          onSendJoinRequest={handleSendJoinRequest}
          setRoomFilter={setRoomFilter}
          pendingJoinRequests={pendingJoinRequests}
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
                <RaceInterface
                  stats={stats}
                  characterStates={characterStates}
                  currentIndex={currentIndex}
                  elapsedTime={elapsedTime}
                  isActive={testIsActive}
                  isCompleted={isCompleted}
                  pressedKeys={pressedKeys}
                  lastPressedKey={lastPressedKey}
                  keyAccuracy={keyAccuracy}
                  focusInput={focusInput}
                  inputRef={inputRef}
                  config={multiplayerConfig}
                />
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