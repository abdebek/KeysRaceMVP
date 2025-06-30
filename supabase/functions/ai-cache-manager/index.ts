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
    const { action, userId } = await req.json()
    
    // Verify user authentication
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      throw new Error('Unauthorized')
    }

    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (action) {
      case 'stats':
        // Get cache analytics for user
        const { data: analytics } = await serviceSupabase
          .from('ai_cache_analytics')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

        const { data: quotas } = await serviceSupabase
          .from('ai_usage_quotas')
          .select('*')
          .eq('user_id', userId)

        const stats = {
          totalRequests: analytics?.length || 0,
          cacheHits: analytics?.filter(a => a.cache_hit).length || 0,
          cacheHitRate: analytics?.length ? (analytics.filter(a => a.cache_hit).length / analytics.length * 100).toFixed(1) : 0,
          quotas: quotas || []
        }

        return new Response(
          JSON.stringify(stats),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      case 'clear':
        // Clear user's cache analytics (for privacy)
        await serviceSupabase
          .from('ai_cache_analytics')
          .delete()
          .eq('user_id', userId)

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      default:
        throw new Error('Invalid action')
    }
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