import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, roomId, userId, progress, wpm, accuracy } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify user authentication
    const authSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await authSupabase.auth.getUser()
    if (!user || user.id !== userId) {
      throw new Error('Unauthorized')
    }

    switch (action) {
      case 'join_room':
        // Add user to room
        await supabase
          .from('room_participants')
          .insert({
            room_id: roomId,
            user_id: userId
          })

        // Update room player count
        await supabase.rpc('increment_room_players', { room_id: roomId })
        break

      case 'update_progress':
        // Update user's progress in room
        await supabase
          .from('room_participants')
          .update({
            progress,
            wpm,
            accuracy,
            finished_at: progress >= 100 ? new Date().toISOString() : null
          })
          .eq('room_id', roomId)
          .eq('user_id', userId)

        // Check if race is complete and assign positions
        if (progress >= 100) {
          const { data: participants } = await supabase
            .from('room_participants')
            .select('*')
            .eq('room_id', roomId)
            .order('finished_at', { ascending: true })

          if (participants) {
            for (let i = 0; i < participants.length; i++) {
              if (participants[i].finished_at) {
                await supabase
                  .from('room_participants')
                  .update({ position: i + 1 })
                  .eq('id', participants[i].id)
              }
            }
          }
        }
        break

      case 'leave_room':
        // Remove user from room
        await supabase
          .from('room_participants')
          .delete()
          .eq('room_id', roomId)
          .eq('user_id', userId)

        // Update room player count
        await supabase.rpc('decrement_room_players', { room_id: roomId })
        break
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})