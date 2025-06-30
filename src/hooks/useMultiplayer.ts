import { useState, useEffect } from 'react';

interface Player {
  id: string;
  name: string;
  progress: number;
  wpm: number;
  accuracy: number;
  isFinished: boolean;
}

export function useMultiplayer() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<'lobby' | 'racing' | 'finished'>('lobby');
  const [roomId, setRoomId] = useState<string | null>(null);

  const createRoom = async () => {
    // In real implementation:
    // 1. Create room in Supabase
    // 2. Set up real-time subscriptions
    // 3. Handle player connections/disconnections
    
    const mockRoomId = `room_${Date.now()}`;
    setRoomId(mockRoomId);
    console.log('Created room:', mockRoomId);
  };

  const joinRoom = async (roomId: string) => {
    // Join existing room and sync state
    console.log('Joining room:', roomId);
  };

  const updateProgress = (progress: number, wpm: number, accuracy: number) => {
    // Broadcast progress to other players via Supabase realtime
    console.log('Broadcasting progress:', { progress, wpm, accuracy });
  };

  return {
    players,
    gameState,
    roomId,
    createRoom,
    joinRoom,
    updateProgress,
    setGameState
  };
}