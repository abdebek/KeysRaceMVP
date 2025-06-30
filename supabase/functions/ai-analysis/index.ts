import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// In-memory cache for AI responses (in production, use Redis)
const aiCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Cache TTL in milliseconds
const CACHE_TTL = {
  typing_analysis: 24 * 60 * 60 * 1000, // 24 hours
  personalized_lesson: 7 * 24 * 60 * 60 * 1000, // 7 days
  weakness_analysis: 12 * 60 * 60 * 1000, // 12 hours
  performance_insights: 6 * 60 * 60 * 1000, // 6 hours
}

// AI Provider configurations
const AI_PROVIDERS = {
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
    apiKey: Deno.env.get('OPENAI_API_KEY'),
    costPerToken: 0.0015 / 1000 // $0.0015 per 1K tokens
  },
  anthropic: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-haiku-20240307',
    apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
    costPerToken: 0.00025 / 1000 // $0.00025 per 1K tokens
  },
  google: {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    model: 'gemini-pro',
    apiKey: Deno.env.get('GOOGLE_AI_API_KEY'),
    costPerToken: 0.0005 / 1000 // $0.0005 per 1K tokens
  },
  cohere: {
    endpoint: 'https://api.cohere.ai/v1/generate',
    model: 'command',
    apiKey: Deno.env.get('COHERE_API_KEY'),
    costPerToken: 0.0015 / 1000
  },
  huggingface: {
    endpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
    model: 'microsoft/DialoGPT-large',
    apiKey: Deno.env.get('HUGGINGFACE_API_KEY'),
    costPerToken: 0.0001 / 1000 // Much cheaper for basic tasks
  }
}

function getCacheKey(type: string, data: any): string {
  switch (type) {
    case 'typing_analysis':
      const avgWpm = Math.round(data.reduce((sum: number, test: any) => sum + test.wpm, 0) / data.length)
      const avgAccuracy = Math.round(data.reduce((sum: number, test: any) => sum + test.accuracy, 0) / data.length)
      return `analysis_${avgWpm}_${avgAccuracy}_${data.length}`
    
    case 'personalized_lesson':
      return `lesson_${data.weaknesses.sort().join('_')}`
    
    case 'weakness_analysis':
      return `weakness_${data.userId}_${data.testCount}`
    
    default:
      return `${type}_${JSON.stringify(data).slice(0, 50)}`
  }
}

function getFromCache(key: string): any | null {
  const cached = aiCache.get(key)
  if (!cached) return null
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    aiCache.delete(key)
    return null
  }
  
  return cached.data
}

function setCache(key: string, data: any, ttl: number): void {
  aiCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  })
}

// Smart provider selection based on task type and cost
function selectBestProvider(type: string, complexity: 'simple' | 'medium' | 'complex' = 'medium'): string {
  switch (type) {
    case 'typing_analysis':
      // Complex analysis - use best model
      return 'openai'
    
    case 'personalized_lesson':
      // Creative text generation - Anthropic excels here
      return 'anthropic'
    
    case 'weakness_analysis':
      // Medium complexity - Google Gemini is cost-effective
      return 'google'
    
    case 'performance_insights':
      // Simple insights - use cheapest option
      return 'huggingface'
    
    case 'chat_response':
      // Interactive chat - Cohere is good for conversations
      return 'cohere'
    
    default:
      return 'openai' // Default fallback
  }
}

async function callOpenAI(messages: any[], maxTokens = 500): Promise<string> {
  const response = await fetch(AI_PROVIDERS.openai.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AI_PROVIDERS.openai.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: AI_PROVIDERS.openai.model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const result = await response.json()
  return result.choices[0].message.content
}

async function callAnthropic(messages: any[], maxTokens = 500): Promise<string> {
  const systemMessage = messages.find(m => m.role === 'system')?.content || ''
  const userMessages = messages.filter(m => m.role !== 'system')

  const response = await fetch(AI_PROVIDERS.anthropic.endpoint, {
    method: 'POST',
    headers: {
      'x-api-key': AI_PROVIDERS.anthropic.apiKey!,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: AI_PROVIDERS.anthropic.model,
      max_tokens: maxTokens,
      system: systemMessage,
      messages: userMessages
    })
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`)
  }

  const result = await response.json()
  return result.content[0].text
}

async function callGoogleGemini(messages: any[], maxTokens = 500): Promise<string> {
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n')

  const response = await fetch(`${AI_PROVIDERS.google.endpoint}?key=${AI_PROVIDERS.google.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Google Gemini API error: ${response.status}`)
  }

  const result = await response.json()
  return result.candidates[0].content.parts[0].text
}

async function callCohere(messages: any[], maxTokens = 500): Promise<string> {
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n')

  const response = await fetch(AI_PROVIDERS.cohere.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AI_PROVIDERS.cohere.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: AI_PROVIDERS.cohere.model,
      prompt,
      max_tokens: maxTokens,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error(`Cohere API error: ${response.status}`)
  }

  const result = await response.json()
  return result.generations[0].text
}

async function callHuggingFace(messages: any[], maxTokens = 500): Promise<string> {
  const prompt = messages.map(m => m.content).join(' ')

  const response = await fetch(AI_PROVIDERS.huggingface.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AI_PROVIDERS.huggingface.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_length: maxTokens,
        temperature: 0.7
      }
    })
  })

  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.status}`)
  }

  const result = await response.json()
  return result[0].generated_text
}

// Universal AI caller with fallback support
async function callAI(messages: any[], maxTokens = 500, type: string = 'general'): Promise<{ response: string; provider: string; cost: number }> {
  const primaryProvider = selectBestProvider(type)
  const fallbackProviders = ['openai', 'anthropic', 'google', 'cohere'].filter(p => p !== primaryProvider)
  
  const providers = [primaryProvider, ...fallbackProviders]
  
  for (const provider of providers) {
    try {
      let response: string
      
      switch (provider) {
        case 'openai':
          if (!AI_PROVIDERS.openai.apiKey) continue
          response = await callOpenAI(messages, maxTokens)
          break
        
        case 'anthropic':
          if (!AI_PROVIDERS.anthropic.apiKey) continue
          response = await callAnthropic(messages, maxTokens)
          break
        
        case 'google':
          if (!AI_PROVIDERS.google.apiKey) continue
          response = await callGoogleGemini(messages, maxTokens)
          break
        
        case 'cohere':
          if (!AI_PROVIDERS.cohere.apiKey) continue
          response = await callCohere(messages, maxTokens)
          break
        
        case 'huggingface':
          if (!AI_PROVIDERS.huggingface.apiKey) continue
          response = await callHuggingFace(messages, maxTokens)
          break
        
        default:
          continue
      }
      
      const estimatedTokens = response.length / 4 // Rough estimate
      const cost = estimatedTokens * AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS].costPerToken
      
      return { response, provider, cost }
    } catch (error) {
      console.warn(`${provider} failed:`, error.message)
      continue
    }
  }
  
  throw new Error('All AI providers failed')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, data: requestData, userId, preferredProvider } = await req.json()
    
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

    // Generate cache key
    const cacheKey = getCacheKey(type, requestData)
    
    // Check cache first
    const cachedResult = getFromCache(cacheKey)
    if (cachedResult) {
      return new Response(
        JSON.stringify({ 
          analysis: cachedResult.response, 
          cached: true,
          cacheKey,
          provider: cachedResult.provider,
          cost: 0 // No cost for cached responses
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    let messages: any[]
    let maxTokens = 500
    let ttl = CACHE_TTL.typing_analysis

    switch (type) {
      case 'typing_analysis':
        ttl = CACHE_TTL.typing_analysis
        messages = [
          {
            role: 'system',
            content: 'You are an expert typing coach. Analyze typing performance and provide insights in JSON format with weaknesses, strengths, suggestions, and nextGoals arrays.'
          },
          {
            role: 'user',
            content: `Analyze this typing data and provide structured insights: ${JSON.stringify(requestData)}`
          }
        ]
        break

      case 'personalized_lesson':
        ttl = CACHE_TTL.personalized_lesson
        maxTokens = 200
        messages = [
          {
            role: 'system',
            content: 'Generate a custom typing lesson text that focuses on specific weaknesses. Return only the practice text, no explanations.'
          },
          {
            role: 'user',
            content: `Create a typing practice text that helps with these weaknesses: ${requestData.weaknesses.join(', ')}`
          }
        ]
        break

      case 'weakness_analysis':
        ttl = CACHE_TTL.weakness_analysis
        messages = [
          {
            role: 'system',
            content: 'Analyze typing patterns to identify specific weaknesses and provide targeted improvement strategies.'
          },
          {
            role: 'user',
            content: `Identify weaknesses in this typing data: ${JSON.stringify(requestData)}`
          }
        ]
        break

      case 'performance_insights':
        ttl = CACHE_TTL.performance_insights
        messages = [
          {
            role: 'system',
            content: 'Provide motivational performance insights and next steps for typing improvement.'
          },
          {
            role: 'user',
            content: `Generate insights for this performance data: ${JSON.stringify(requestData)}`
          }
        ]
        break

      case 'chat_response':
        ttl = CACHE_TTL.performance_insights
        messages = [
          {
            role: 'system',
            content: 'You are a helpful typing coach. Provide encouraging and practical advice.'
          },
          {
            role: 'user',
            content: requestData.message || 'How can I improve my typing?'
          }
        ]
        break

      default:
        throw new Error('Invalid analysis type')
    }

    // Call AI with smart provider selection and fallback
    const { response: analysis, provider, cost } = await callAI(messages, maxTokens, type)

    // Cache the result with provider info
    setCache(cacheKey, { response: analysis, provider, cost }, ttl)

    // Store analytics in database
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await serviceSupabase
      .from('ai_cache_analytics')
      .insert({
        user_id: userId,
        cache_key: cacheKey,
        analysis_type: type,
        cache_hit: false,
        response_time_ms: Date.now() % 1000, // Simple response time tracking
        created_at: new Date().toISOString()
      })
      .catch(() => {}) // Don't fail if analytics insert fails

    return new Response(
      JSON.stringify({ 
        analysis, 
        cached: false,
        cacheKey,
        provider,
        cost: cost.toFixed(6)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('AI Analysis error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})