import { createClient } from '@supabase/supabase-js';

// Environment variables - with fallback handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-project.supabase.co' || supabaseKey === 'your-anon-key') {
  console.warn('Supabase not configured. Please set up your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          country: string;
          premium_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          country?: string;
          premium_until?: string | null;
        };
        Update: {
          username?: string;
          country?: string;
          premium_until?: string | null;
        };
      };
      typing_results: {
        Row: {
          id: string;
          user_id: string;
          wpm: number;
          accuracy: number;
          consistency: number;
          test_duration: number;
          test_type: string;
          text_category: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          wpm: number;
          accuracy: number;
          consistency: number;
          test_duration: number;
          test_type: string;
          text_category: string;
        };
      };
      multiplayer_rooms: {
        Row: {
          id: string;
          name: string;
          max_players: number;
          current_players: number;
          status: 'waiting' | 'racing' | 'finished';
          text_content: string;
          created_at: string;
          owner_id: string;
        };
        Insert: {
          name: string;
          max_players?: number;
          text_content: string;
          owner_id: string;
        };
      };
      room_participants: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          progress: number;
          wpm: number;
          accuracy: number;
          finished_at: string | null;
          position: number | null;
        };
        Insert: {
          room_id: string;
          user_id: string;
        };
        Update: {
          progress?: number;
          wpm?: number;
          accuracy?: number;
          finished_at?: string | null;
          position?: number | null;
        };
      };
      room_join_requests: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
          message?: string;
        };
        Insert: {
          room_id: string;
          user_id: string;
          status?: 'pending' | 'accepted' | 'rejected';
          message?: string;
        };
        Update: {
          status?: 'pending' | 'accepted' | 'rejected';
        };
      };
      leaderboards: {
        Row: {
          id: string;
          user_id: string;
          timeframe: 'daily' | 'weekly' | 'monthly' | 'alltime';
          category: 'speed' | 'accuracy' | 'consistency';
          score: number;
          rank: number;
          updated_at: string;
        };
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string;
          status: 'active' | 'canceled' | 'past_due';
          current_period_end: string;
          created_at: string;
        };
      };
    };
  };
}

// Helper function to check if Supabase is configured
function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && 
           supabaseKey && 
           supabaseUrl !== 'https://your-project.supabase.co' && 
           supabaseKey !== 'your-anon-key' &&
           supabaseUrl !== 'https://placeholder.supabase.co' &&
           supabaseKey !== 'placeholder-key');
}

// Authentication functions
export async function signUp(email: string, password: string, username: string) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Using demo mode.');
    // Simulate successful signup for demo
    localStorage.setItem('demo_user', JSON.stringify({
      id: 'demo-' + Date.now(),
      email,
      user_metadata: {
        username,
        country: 'US'
      },
      created_at: new Date().toISOString()
    }));
    
    // Simulate auth state change
    window.dispatchEvent(new Event('demo-auth-change'));
    
    return { user: { email, username }, session: {} };
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username
      }
    }
  });
  
  if (error) throw error;
  
  // If successful, also create a user profile
  if (data.user) {
    try {
      await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email!,
        username
      });
    } catch (err) {
      console.error('Error creating user profile:', err);
      // Continue anyway since the auth account was created
    }
  }
  
  return data;
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Using demo mode.');
    // Simulate successful login for demo
    localStorage.setItem('demo_user', JSON.stringify({
      id: 'demo-' + Date.now(),
      email,
      user_metadata: {
        username: email.split('@')[0],
        country: 'US'
      },
      created_at: new Date().toISOString()
    }));
    
    // Simulate auth state change
    window.dispatchEvent(new Event('demo-auth-change'));
    
    return { user: { email }, session: {} };
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  // Check if user is a demo user
  const demoUserStr = localStorage.getItem('demo_user');
  if (demoUserStr) {
    // Clear demo user
    localStorage.removeItem('demo_user');
    
    // Simulate auth state change
    window.dispatchEvent(new Event('demo-auth-change'));
    
    return;
  }
  
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Using demo mode.');
    return;
  }
  
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Typing results functions - now using edge function for security
export async function saveTypingResult(result: {
  wpm: number;
  accuracy: number;
  consistency: number;
  test_duration: number;
  test_type: string;
  text_category: string;
}) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Using demo mode.');
    // Store results locally for demo
    const results = JSON.parse(localStorage.getItem('typing_results') || '[]');
    results.push({
      ...result,
      id: 'demo-' + Date.now(),
      user_id: 'demo-user',
      created_at: new Date().toISOString()
    });
    localStorage.setItem('typing_results', JSON.stringify(results));
    return { success: true };
  }
  
  // This now calls the secure edge function
  const { updateLeaderboard } = await import('./api');
  return updateLeaderboard({
    wpm: result.wpm,
    accuracy: result.accuracy,
    consistency: result.consistency,
    testType: result.test_type
  });
}

export async function getUserResults(userId: string, limit = 50) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Using demo mode.');
    // Return demo results
    const results = JSON.parse(localStorage.getItem('typing_results') || '[]');
    return results.slice(0, limit);
  }
  
  const { data, error } = await supabase
    .from('typing_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Leaderboard functions
export async function getGlobalLeaderboard(
  timeframe: 'daily' | 'weekly' | 'monthly' | 'alltime' = 'weekly',
  category: 'speed' | 'accuracy' | 'consistency' = 'speed',
  limit = 100
) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Using demo mode.');
    // Return demo leaderboard
    return [
      { rank: 1, username: 'TypeMaster2024', score: 142, country: 'US' },
      { rank: 2, username: 'KeyboardNinja', score: 138, country: 'KR' },
      { rank: 3, username: 'SpeedDemon', score: 135, country: 'DE' },
      { rank: 4, username: 'TypingLegend', score: 132, country: 'JP' },
      { rank: 5, username: 'FastFingers', score: 129, country: 'CA' },
      { rank: 6, username: 'QuickType', score: 127, country: 'UK' },
      { rank: 7, username: 'RapidTyper', score: 125, country: 'AU' },
      { rank: 8, username: 'KeyStroke', score: 123, country: 'FR' },
      { rank: 9, username: 'TypeRacer', score: 121, country: 'BR' },
      { rank: 10, username: 'You', score: 67, country: 'US', isCurrentUser: true }
    ];
  }
  
  const { data, error } = await supabase
    .from('leaderboards')
    .select(`
      *,
      users (
        username,
        country
      )
    `)
    .eq('timeframe', timeframe)
    .eq('category', category)
    .order('rank', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Multiplayer functions - now using edge function for security
export async function createMultiplayerRoom(name: string, textContent: string) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Using demo mode.');
    // Create demo room
    const demoRoom = {
      id: 'demo-' + Date.now(),
      name,
      text_content: textContent,
      max_players: 4,
      current_players: 1,
      status: 'waiting',
      created_at: new Date().toISOString()
    };
    
    // Store in localStorage for demo
    const rooms = JSON.parse(localStorage.getItem('multiplayer_rooms') || '[]');
    rooms.push(demoRoom);
    localStorage.setItem('multiplayer_rooms', JSON.stringify(rooms));
    
    return demoRoom;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('multiplayer_rooms')
    .insert({
      name,
      text_content: textContent,
      max_players: 4,
      owner_id: user.id
    })
    .select()
    .single();

  if (error) throw error;

  // Join the room as creator using secure edge function
  const { manageMultiplayerRoom } = await import('./api');
  await manageMultiplayerRoom('join_room', data.id);
  
  return data;
}

export async function joinMultiplayerRoom(roomId: string) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Using demo mode.');
    // Join demo room
    const rooms = JSON.parse(localStorage.getItem('multiplayer_rooms') || '[]');
    const room = rooms.find((r: any) => r.id === roomId);
    
    if (room) {
      room.current_players += 1;
      localStorage.setItem('multiplayer_rooms', JSON.stringify(rooms));
    }
    
    return { success: true };
  }
  
  const { manageMultiplayerRoom } = await import('./api');
  return manageMultiplayerRoom('join_room', roomId);
}

export async function updateRoomProgress(
  roomId: string,
  progress: number,
  wpm: number,
  accuracy: number
) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Using demo mode.');
    return { success: true };
  }
  
  const { manageMultiplayerRoom } = await import('./api');
  return manageMultiplayerRoom('update_progress', roomId, { progress, wpm, accuracy });
}

// Real-time subscriptions
export function subscribeToRoom(roomId: string, callback: (payload: any) => void) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Real-time subscriptions disabled.');
    
    // For demo, set up a timer to simulate real-time updates
    const interval = setInterval(() => {
      callback({
        new: {
          room_id: roomId,
          user_id: 'demo-user-' + Math.floor(Math.random() * 1000),
          progress: Math.floor(Math.random() * 100),
          wpm: Math.floor(Math.random() * 80) + 40,
          accuracy: Math.floor(Math.random() * 20) + 80
        }
      });
    }, 5000);
    
    return { 
      unsubscribe: () => clearInterval(interval)
    };
  }
  
  return supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'room_participants',
        filter: `room_id=eq.${roomId}`
      },
      callback
    )
    .subscribe();
}

// Premium subscription functions - already secure with edge functions
export async function createStripeCheckout(priceId: string) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Using demo mode.');
    // Simulate checkout URL for demo
    return { url: 'https://example.com/demo-checkout' };
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { priceId, userId: user.id }
  });

  if (error) throw error;
  return data;
}

export async function checkPremiumStatus() {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Premium status check disabled.');
    // For demo, check if user is logged in via localStorage
    const demoUser = localStorage.getItem('demo_user');
    return !!demoUser; // All logged-in demo users are "premium"
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('premium_until')
      .eq('id', user.id)
      .single();

    if (error) return false;
    
    if (!data.premium_until) return false;
    
    return new Date(data.premium_until) > new Date();
  } catch (error) {
    console.warn('Error checking premium status:', error);
    return false;
  }
}