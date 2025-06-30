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
    const { wpm, accuracy, consistency, testType, userId } = await req.json()
    
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

    // Save typing result
    await supabase
      .from('typing_results')
      .insert({
        user_id: userId,
        wpm,
        accuracy,
        consistency,
        test_duration: testType === 'time' ? 60 : 0,
        test_type: testType,
        text_category: 'quotes'
      })

    // Update leaderboards for different timeframes
    const timeframes = ['daily', 'weekly', 'monthly', 'alltime']
    const categories = [
      { name: 'speed', score: wpm },
      { name: 'accuracy', score: accuracy },
      { name: 'consistency', score: consistency }
    ]

    for (const timeframe of timeframes) {
      for (const category of categories) {
        // Upsert leaderboard entry
        await supabase
          .from('leaderboards')
          .upsert({
            user_id: userId,
            timeframe,
            category: category.name,
            score: category.score,
            rank: 1, // Will be recalculated
            updated_at: new Date().toISOString()
          })

        // Recalculate ranks
        const { data: entries } = await supabase
          .from('leaderboards')
          .select('id, score')
          .eq('timeframe', timeframe)
          .eq('category', category.name)
          .order('score', { ascending: false })

        if (entries) {
          for (let i = 0; i < entries.length; i++) {
            await supabase
              .from('leaderboards')
              .update({ rank: i + 1 })
              .eq('id', entries[i].id)
          }
        }
      }
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