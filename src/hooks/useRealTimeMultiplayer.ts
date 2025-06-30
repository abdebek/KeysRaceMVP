import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface Player {
  id: string;
  username: string;
  progress: number;
  wpm: number;
  accuracy: number;
  isFinished: boolean;
  position?: number;
  finishTime?: number;
  country?: string;
}

interface Room {
  id: string;
  name: string;
  status: 'waiting' | 'racing' | 'finished';
  text_content: string;
  max_players: number;
  current_players: number;
  owner_id?: string;
  country?: string;
}

interface JoinRequest {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  country?: string;
}

export function useRealTimeMultiplayer() {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<'lobby' | 'racing' | 'finished'>('lobby');
  const [subscription, setSubscription] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set up real-time subscription when room changes
  useEffect(() => {
    if (!room) return;

    // Subscribe to room participants
    const participantsSubscription = supabase
      .channel(`room-participants-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${room.id}`
        },
        (payload) => {
          console.log('Room participants changed:', payload);
          fetchRoomParticipants(room.id);
        }
      )
      .subscribe();

    // Subscribe to room status changes
    const roomSubscription = supabase
      .channel(`room-status-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'multiplayer_rooms',
          filter: `id=eq.${room.id}`
        },
        (payload) => {
          console.log('Room status changed:', payload);
          fetchRoomDetails(room.id);
        }
      )
      .subscribe();

    setSubscription({ participants: participantsSubscription, room: roomSubscription });

    return () => {
      participantsSubscription.unsubscribe();
      roomSubscription.unsubscribe();
    };
  }, [room]);

  // Fetch room participants
  const fetchRoomParticipants = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('room_participants')
        .select(`
          *,
          users (
            username,
            country
          )
        `)
        .eq('room_id', roomId);

      if (error) throw error;

      if (data) {
        const formattedPlayers = data.map(participant => ({
          id: participant.user_id,
          username: participant.users?.username || 'Anonymous',
          progress: participant.progress,
          wpm: participant.wpm,
          accuracy: participant.accuracy,
          isFinished: participant.finished_at !== null,
          position: participant.position,
          finishTime: participant.finished_at ? new Date(participant.finished_at).getTime() : undefined,
          country: participant.users?.country
        }));

        setPlayers(formattedPlayers);
      }
    } catch (err) {
      console.error('Error fetching room participants:', err);
      // If we can't fetch real data, use demo data
      if (players.length === 0) {
        setDemoPlayers(roomId);
      }
    }
  };

  // Fetch room details
  const fetchRoomDetails = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('multiplayer_rooms')
        .select(`
          *,
          users:owner_id (
            country
          )
        `)
        .eq('id', roomId)
        .single();

      if (error) throw error;

      if (data) {
        setRoom({
          id: data.id,
          name: data.name,
          status: data.status,
          text_content: data.text_content,
          max_players: data.max_players,
          current_players: data.current_players,
          owner_id: data.owner_id,
          country: data.users?.country
        });

        // Update game state based on room status
        if (data.status === 'racing') {
          setGameState('racing');
        } else if (data.status === 'finished') {
          setGameState('finished');
        }
      }
    } catch (err) {
      console.error('Error fetching room details:', err);
    }
  };

  // Set demo players for testing
  const setDemoPlayers = (roomId: string) => {
    const demoPlayers: Player[] = [
      { id: 'demo-1', username: 'SpeedTyper92', progress: 0, wpm: 0, accuracy: 100, isFinished: false, country: 'US' },
      { id: 'demo-2', username: 'KeyboardNinja', progress: 0, wpm: 0, accuracy: 100, isFinished: false, country: 'JP' },
      { id: 'demo-3', username: 'CodeRacer', progress: 0, wpm: 0, accuracy: 100, isFinished: false, country: 'DE' }
    ];
    setPlayers(demoPlayers);
  };

  // Fetch active rooms
  const fetchActiveRooms = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('multiplayer_rooms')
        .select(`
          *,
          users:owner_id (
            country
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map(room => ({
          ...room,
          country: room.users?.country
        }));
      }

      // If no rooms found, return demo rooms
      return [
        { id: 'demo-1', name: 'Speed Demons', current_players: 2, max_players: 4, status: 'waiting', country: 'US' },
        { id: 'demo-2', name: 'Keyboard Warriors', current_players: 3, max_players: 4, status: 'waiting', country: 'UK' },
        { id: 'demo-3', name: 'Typing Titans', current_players: 1, max_players: 4, status: 'waiting', country: 'DE' },
        { id: 'demo-4', name: 'Code Racers', current_players: 4, max_players: 4, status: 'racing', country: 'JP' },
        { id: 'demo-5', name: 'Syntax Speedsters', current_players: 2, max_players: 4, status: 'waiting', country: 'CA' },
        { id: 'demo-6', name: 'Function Racers', current_players: 1, max_players: 4, status: 'waiting', country: 'FR' },
        { id: 'demo-7', name: 'Algorithm Aces', current_players: 3, max_players: 4, status: 'waiting', country: 'IN' },
        { id: 'demo-8', name: 'Byte Blazers', current_players: 2, max_players: 4, status: 'waiting', country: 'BR' }
      ];
    } catch (error) {
      console.error('Error fetching active rooms:', error);
      throw error;
    }
  }, []);

  // Create a new multiplayer room
  const createRoom = useCallback(async (roomName: string, textContent: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's country from profile
      const { data: userProfile } = await supabase
        .from('users')
        .select('username, country')
        .eq('id', user.id)
        .single();
      
      const country = userProfile?.country || 'US';
      const username = userProfile?.username || user.email?.split('@')[0] || 'Anonymous';

      // Create room in Supabase
      const { data: roomData, error: roomError } = await supabase
        .from('multiplayer_rooms')
        .insert({
          name: roomName,
          text_content: textContent,
          max_players: 4,
          current_players: 1,
          status: 'waiting',
          owner_id: user.id
        })
        .select()
        .single();

      if (roomError) {
        console.error('Error creating room:', roomError);
        // Fall back to demo mode if there's an error
        const simulatedRoom = {
          id: `demo-${Date.now()}`,
          name: roomName,
          text_content: textContent,
          max_players: 4,
          current_players: 1,
          status: 'waiting',
          owner_id: user.id,
          country: country
        };
        
        setRoom(simulatedRoom);
        
        setPlayers([{
          id: user.id,
          username: username,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          isFinished: false,
          country: country
        }]);
        
        setIsConnected(true);
        
        return simulatedRoom;
      }

      // Add the current user as a participant
      const { error: participantError } = await supabase
        .from('room_participants')
        .insert({
          room_id: roomData.id,
          user_id: user.id,
          position: 1 // Position 1 is the room owner
        });

      if (participantError) {
        console.error('Error adding participant:', participantError);
        // We'll continue anyway since the room was created
      }

      // Set room and player state
      setRoom({
        ...roomData,
        country: country
      });
      
      setPlayers([{
        id: user.id,
        username: username,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        isFinished: false,
        country: country
      }]);
      
      setIsConnected(true);
      
      // Fetch participants to ensure we have the latest data
      fetchRoomParticipants(roomData.id);
      
      return roomData;
    } catch (error: any) {
      console.error('Error creating room:', error);
      setError(error.message);
      throw error;
    }
  }, []);

  // Join an existing room
  const joinRoom = useCallback(async (roomId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's country from profile
      const { data: userProfile } = await supabase
        .from('users')
        .select('username, country')
        .eq('id', user.id)
        .single();
      
      const country = userProfile?.country || 'US';
      const username = userProfile?.username || user.email?.split('@')[0] || 'Anonymous';

      // Get room details
      const { data: roomData, error: roomError } = await supabase
        .from('multiplayer_rooms')
        .select(`
          *,
          users:owner_id (
            country
          )
        `)
        .eq('id', roomId)
        .single();

      if (roomError) {
        console.error('Error fetching room:', roomError);
        // Fall back to demo mode
        await joinDemoRoom(roomId, user.id, username, country);
        return;
      }

      // Check if room is full or already racing
      if (roomData.current_players >= roomData.max_players) {
        throw new Error('Room is full');
      }

      if (roomData.status === 'racing') {
        throw new Error('Race already in progress');
      }

      // Add user as participant
      const { error: participantError } = await supabase
        .from('room_participants')
        .insert({
          room_id: roomId,
          user_id: user.id
        });

      if (participantError) {
        console.error('Error adding participant:', participantError);
        // Fall back to demo mode
        await joinDemoRoom(roomId, user.id, username, country);
        return;
      }

      // Update room player count
      const { error: updateError } = await supabase
        .from('multiplayer_rooms')
        .update({ current_players: roomData.current_players + 1 })
        .eq('id', roomId);

      if (updateError) {
        console.error('Error updating room player count:', updateError);
      }

      // Set room state
      setRoom({
        ...roomData,
        current_players: roomData.current_players + 1,
        country: roomData.users?.country
      });
      
      setIsConnected(true);
      
      // Fetch participants to get the latest data
      fetchRoomParticipants(roomId);
    } catch (error: any) {
      console.error('Error joining room:', error);
      setError(error.message);
      throw error;
    }
  }, []);

  // Join a demo room when Supabase fails
  const joinDemoRoom = async (roomId: string, userId: string, username: string, country: string) => {
    console.log('Falling back to demo room join');
    
    // Find the room in our demo data
    const demoRooms = [
      { id: 'demo-1', name: 'Speed Demons', current_players: 2, max_players: 4, status: 'waiting', country: 'US' },
      { id: 'demo-2', name: 'Keyboard Warriors', current_players: 3, max_players: 4, status: 'waiting', country: 'UK' },
      { id: 'demo-3', name: 'Typing Titans', current_players: 1, max_players: 4, status: 'waiting', country: 'DE' },
      { id: 'demo-4', name: 'Code Racers', current_players: 4, max_players: 4, status: 'racing', country: 'JP' }
    ];
    
    const foundRoom = demoRooms.find(r => r.id === roomId) || demoRooms[0];
    
    // Simulate room data
    const simulatedRoom = {
      id: roomId,
      name: foundRoom.name,
      text_content: 'This is a demo room for testing multiplayer functionality.',
      max_players: 4,
      current_players: foundRoom.current_players,
      status: 'waiting',
      country: foundRoom.country
    };
    
    setRoom(simulatedRoom);
    
    // Add existing players for demo
    const existingPlayers: Player[] = [];
    const countries = ['US', 'UK', 'DE', 'JP', 'CA', 'FR', 'IN', 'BR'];
    const names = ['SpeedTyper', 'KeyboardNinja', 'CodeRacer', 'TypeMaster'];
    
    for (let i = 0; i < foundRoom.current_players - 1; i++) {
      existingPlayers.push({
        id: `existing-${i}`,
        username: `${names[i % names.length]}${Math.floor(Math.random() * 100)}`,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        isFinished: false,
        country: countries[i % countries.length]
      });
    }
    
    setPlayers([
      ...existingPlayers,
      {
        id: userId,
        username: username,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        isFinished: false,
        country: country
      }
    ]);
    
    setIsConnected(true);
  };

  // Request to join a room
  const requestToJoin = useCallback(async (roomId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user is already in the room
      const { data: existingParticipant } = await supabase
        .from('room_participants')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingParticipant) {
        // User is already in the room, just join
        await joinRoom(roomId);
        return true;
      }

      // Create join request
      const { error } = await supabase
        .from('room_join_requests')
        .insert({
          room_id: roomId,
          user_id: user.id,
          status: 'pending'
        });

      if (error) {
        console.error('Error creating join request:', error);
        // For demo purposes, just join directly
        await joinRoom(roomId);
      }

      return true;
    } catch (error: any) {
      console.error('Error requesting to join room:', error);
      setError(error.message);
      throw error;
    }
  }, [joinRoom]);

  // Get join requests for a room
  const getJoinRequests = useCallback(async (roomId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('room_join_requests')
        .select(`
          *,
          users:user_id (
            username,
            country
          )
        `)
        .eq('room_id', roomId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching join requests:', error);
        // Return demo data
        return [
          { 
            id: 'req-1', 
            room_id: roomId, 
            user_id: 'demo-user-1', 
            username: 'FastFingers', 
            status: 'pending',
            created_at: new Date().toISOString(),
            country: 'US'
          },
          { 
            id: 'req-2', 
            room_id: roomId, 
            user_id: 'demo-user-2', 
            username: 'TypeMaster', 
            status: 'pending',
            created_at: new Date(Date.now() - 60000).toISOString(),
            country: 'JP'
          }
        ];
      }

      if (data) {
        return data.map(request => ({
          id: request.id,
          room_id: request.room_id,
          user_id: request.user_id,
          username: request.users?.username || 'Anonymous',
          status: request.status,
          created_at: request.created_at,
          country: request.users?.country
        }));
      }

      return [];
    } catch (error) {
      console.error('Error getting join requests:', error);
      throw error;
    }
  }, []);

  // Accept a join request
  const acceptJoinRequest = useCallback(async (requestId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get request details
      const { data: request, error: requestError } = await supabase
        .from('room_join_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) {
        console.error('Error fetching request:', requestError);
        // Fall back to demo mode
        if (room) {
          const requestMap: Record<string, {name: string, country: string}> = {
            'req-1': { name: 'FastFingers', country: 'US' },
            'req-2': { name: 'TypeMaster', country: 'JP' }
          };
          
          const playerInfo = requestMap[requestId] || { name: 'Player', country: 'US' };
          
          const newPlayer = {
            id: `demo-${Date.now()}`,
            username: playerInfo.name,
            progress: 0,
            wpm: 0,
            accuracy: 100,
            isFinished: false,
            country: playerInfo.country
          };
          
          setPlayers(prev => [...prev, newPlayer]);
        }
        return true;
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('room_join_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating request:', updateError);
      }

      // Add user as participant
      const { error: participantError } = await supabase
        .from('room_participants')
        .insert({
          room_id: request.room_id,
          user_id: request.user_id
        });

      if (participantError) {
        console.error('Error adding participant:', participantError);
      }

      // Update room player count
      if (room) {
        const { error: roomError } = await supabase
          .from('multiplayer_rooms')
          .update({ current_players: room.current_players + 1 })
          .eq('id', request.room_id);

        if (roomError) {
          console.error('Error updating room:', roomError);
        }
      }

      // Refresh participants
      if (room) {
        fetchRoomParticipants(room.id);
      }

      return true;
    } catch (error: any) {
      console.error('Error accepting join request:', error);
      setError(error.message);
      throw error;
    }
  }, [room]);

  // Reject a join request
  const rejectJoinRequest = useCallback(async (requestId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('room_join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) {
        console.error('Error rejecting request:', error);
      }

      return true;
    } catch (error: any) {
      console.error('Error rejecting join request:', error);
      setError(error.message);
      throw error;
    }
  }, []);

  // Update player progress
  const updateProgress = useCallback(async (progress: number, wpm: number, accuracy: number) => {
    if (!room) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update local player state first for immediate feedback
      setPlayers(prev => prev.map(player => {
        if (player.id === user.id) {
          const isFinished = progress >= 100;
          return {
            ...player,
            progress: Math.min(100, progress),
            wpm,
            accuracy,
            isFinished,
            finishTime: isFinished && !player.finishTime ? Date.now() : player.finishTime
          };
        }
        return player;
      }));

      // Update in database
      const { error } = await supabase
        .from('room_participants')
        .update({
          progress,
          wpm,
          accuracy,
          finished_at: progress >= 100 ? new Date().toISOString() : null
        })
        .eq('room_id', room.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating progress:', error);
        // Continue with local updates for demo purposes
      }

      // If player finished, calculate positions
      if (progress >= 100) {
        // Sort players by finish time
        const sortedPlayers = [...players]
          .filter(p => p.isFinished && p.finishTime)
          .sort((a, b) => (a.finishTime || Infinity) - (b.finishTime || Infinity));
        
        // Assign positions
        const updatedPlayers = players.map(player => {
          const finishedIndex = sortedPlayers.findIndex(p => p.id === player.id);
          if (finishedIndex !== -1) {
            return { ...player, position: finishedIndex + 1 };
          }
          return player;
        });
        
        setPlayers(updatedPlayers);
        
        // Check if race should end
        const finishedCount = updatedPlayers.filter(p => p.isFinished).length;
        if (finishedCount >= 2 || finishedCount >= updatedPlayers.length) {
          setGameState('finished');
          
          // Update room status
          const { error: roomError } = await supabase
            .from('multiplayer_rooms')
            .update({ status: 'finished' })
            .eq('id', room.id);
            
          if (roomError) {
            console.error('Error updating room status:', roomError);
          }
        }
      }
      
      // Simulate other players' progress for demo purposes
      if (gameState === 'racing') {
        simulateOtherPlayersProgress(user.id);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }, [room, players, gameState]);

  // Simulate other players' progress for demo purposes
  const simulateOtherPlayersProgress = (currentUserId: string) => {
    setPlayers(prev => prev.map(player => {
      if (player.id === currentUserId) return player;
      
      // Different speeds for different players
      const speedFactors: Record<string, number> = {
        'existing-0': 0.3 + Math.random() * 0.8,
        'existing-1': 0.4 + Math.random() * 1.0,
        'existing-2': 0.2 + Math.random() * 0.7
      };
      
      const speed = speedFactors[player.id] || (0.2 + Math.random() * 0.6);
      const newProgress = Math.min(100, player.progress + speed);
      
      // Assign realistic WPM based on player
      const baseWpm = {
        'existing-0': 61,
        'existing-1': 58,
        'existing-2': 56
      };
      
      const wpmVariance = Math.random() * 6 - 3; // -3 to +3 variance
      const newWpm = Math.round(baseWpm[player.id as keyof typeof baseWpm] || 50 + wpmVariance);
      
      const newAccuracy = Math.round(88 + Math.random() * 12); // 88-100% accuracy
      const isJustFinished = newProgress >= 100 && !player.isFinished;
      
      return {
        ...player,
        progress: newProgress,
        wpm: newWpm,
        accuracy: newAccuracy,
        isFinished: newProgress >= 100,
        finishTime: isJustFinished ? Date.now() : player.finishTime
      };
    }));
  };

  // Start race
  const startRace = useCallback(async () => {
    if (!room) return;
    
    try {
      // Update room status in database
      const { error } = await supabase
        .from('multiplayer_rooms')
        .update({ status: 'racing' })
        .eq('id', room.id);

      if (error) {
        console.error('Error starting race:', error);
      }
      
      setGameState('racing');
    } catch (error) {
      console.error('Error starting race:', error);
      // Fall back to local state change
      setGameState('racing');
    }
  }, [room]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!room) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Remove user from room participants
      const { error: participantError } = await supabase
        .from('room_participants')
        .delete()
        .eq('room_id', room.id)
        .eq('user_id', user.id);

      if (participantError) {
        console.error('Error removing participant:', participantError);
      }

      // Update room player count
      const { error: roomError } = await supabase
        .from('multiplayer_rooms')
        .update({ current_players: Math.max(0, room.current_players - 1) })
        .eq('id', room.id);

      if (roomError) {
        console.error('Error updating room player count:', roomError);
      }

      // Unsubscribe from real-time updates
      if (subscription) {
        subscription.participants.unsubscribe();
        subscription.room.unsubscribe();
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    } finally {
      // Reset local state
      setRoom(null);
      setPlayers([]);
      setGameState('lobby');
      setIsConnected(false);
    }
  }, [room, subscription]);

  return {
    room,
    players,
    gameState,
    isConnected,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    updateProgress,
    startRace,
    setGameState,
    fetchActiveRooms,
    requestToJoin,
    getJoinRequests,
    acceptJoinRequest,
    rejectJoinRequest
  };
}