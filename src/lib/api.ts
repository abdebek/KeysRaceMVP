import { supabase } from './supabase';

// Secure API calls to edge functions
export async function analyzeTypingWithAI(typingHistory: any[]) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await supabase.functions.invoke('ai-analysis', {
    body: { 
      typingHistory, 
      userId: session.user.id 
    }
  });

  if (response.error) throw response.error;
  return response.data;
}

export async function updateLeaderboard(metrics: {
  wpm: number;
  accuracy: number;
  consistency: number;
  testType: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await supabase.functions.invoke('leaderboard-update', {
    body: { 
      ...metrics,
      userId: session.user.id 
    }
  });

  if (response.error) throw response.error;
  return response.data;
}

export async function manageMultiplayerRoom(action: string, roomId: string, data?: any) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await supabase.functions.invoke('multiplayer-manager', {
    body: { 
      action,
      roomId,
      userId: session.user.id,
      ...data
    }
  });

  if (response.error) throw response.error;
  return response.data;
}