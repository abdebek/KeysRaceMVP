// Client-side AI interface - all calls go through secure edge functions
import { supabase } from './supabase';

export interface TypingAnalysis {
  weaknesses: string[];
  strengths: string[];
  suggestions: string[];
  nextGoals: string[];
}

export interface AIResponse {
  analysis: string;
  cached: boolean;
  cacheKey: string;
  provider: string;
  cost: number;
}

export async function analyzeTypingPatterns(typingHistory: any[], preferredProvider?: string): Promise<TypingAnalysis> {
  if (!typingHistory.length) {
    return {
      weaknesses: [],
      strengths: [],
      suggestions: ['Complete more typing tests to get personalized insights'],
      nextGoals: ['Aim for 40+ WPM with 90%+ accuracy']
    };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('ai-analysis', {
      body: { 
        type: 'typing_analysis',
        data: typingHistory,
        userId: session.user.id,
        preferredProvider
      }
    });

    if (error) throw error;

    // Parse the AI response
    let analysis: TypingAnalysis;
    try {
      analysis = JSON.parse(data.analysis);
    } catch {
      // Fallback if AI doesn't return valid JSON
      analysis = generateFallbackAnalysis(typingHistory);
    }

    return analysis;
  } catch (error) {
    console.error('AI analysis failed:', error);
    return generateFallbackAnalysis(typingHistory);
  }
}

export async function generatePersonalizedLesson(weaknesses: string[], preferredProvider?: string): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('ai-analysis', {
      body: { 
        type: 'personalized_lesson',
        data: { weaknesses },
        userId: session.user.id,
        preferredProvider
      }
    });

    if (error) throw error;
    return data.analysis;
  } catch (error) {
    console.error('Failed to generate lesson:', error);
    return 'The quick brown fox jumps over the lazy dog. Practice makes perfect when learning to type efficiently.';
  }
}

export async function getPerformanceInsights(recentTests: any[], preferredProvider?: string): Promise<string[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('ai-analysis', {
      body: { 
        type: 'performance_insights',
        data: recentTests,
        userId: session.user.id,
        preferredProvider
      }
    });

    if (error) throw error;
    
    // Parse insights from AI response
    const insights = data.analysis.split('\n').filter((line: string) => line.trim());
    return insights;
  } catch (error) {
    console.error('Failed to get insights:', error);
    return ['Keep practicing to improve your typing skills!'];
  }
}

export async function getChatResponse(message: string, preferredProvider?: string): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('ai-analysis', {
      body: { 
        type: 'chat_response',
        data: { message },
        userId: session.user.id,
        preferredProvider
      }
    });

    if (error) throw error;
    return data.analysis;
  } catch (error) {
    console.error('Failed to get chat response:', error);
    return "I'm having trouble processing your request right now. Please try again later!";
  }
}

function generateFallbackAnalysis(typingHistory: any[]): TypingAnalysis {
  const avgWpm = typingHistory.reduce((sum, test) => sum + test.wpm, 0) / typingHistory.length;
  const avgAccuracy = typingHistory.reduce((sum, test) => sum + test.accuracy, 0) / typingHistory.length;

  const analysis: TypingAnalysis = {
    weaknesses: [],
    strengths: [],
    suggestions: [],
    nextGoals: []
  };

  if (avgAccuracy < 90) {
    analysis.weaknesses.push('Accuracy needs improvement');
    analysis.suggestions.push('Slow down and focus on precision over speed');
  }

  if (avgWpm < 40) {
    analysis.weaknesses.push('Typing speed is below average');
    analysis.suggestions.push('Practice touch typing fundamentals');
  }

  if (avgAccuracy >= 95) {
    analysis.strengths.push('Excellent accuracy - great foundation!');
  }

  if (avgWpm >= 60) {
    analysis.strengths.push('Above-average typing speed');
  }

  // Set realistic goals
  if (avgWpm < 40) {
    analysis.nextGoals.push('Reach 40 WPM consistently');
  } else if (avgWpm < 60) {
    analysis.nextGoals.push('Achieve 60 WPM milestone');
  } else {
    analysis.nextGoals.push('Master advanced typing techniques');
  }

  return analysis;
}

// Cache management utilities
export async function clearAICache(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.functions.invoke('ai-cache-manager', {
      body: { 
        action: 'clear',
        userId: session.user.id 
      }
    });
  } catch (error) {
    console.error('Failed to clear AI cache:', error);
  }
}

export async function getCacheStats(): Promise<any> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase.functions.invoke('ai-cache-manager', {
      body: { 
        action: 'stats',
        userId: session.user.id 
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return null;
  }
}

// Provider preference management
export const AI_PROVIDERS = {
  openai: { name: 'OpenAI GPT', description: 'Best for complex analysis', cost: 'Medium' },
  anthropic: { name: 'Anthropic Claude', description: 'Excellent for creative text', cost: 'Low' },
  google: { name: 'Google Gemini', description: 'Cost-effective for most tasks', cost: 'Low' },
  cohere: { name: 'Cohere', description: 'Great for conversations', cost: 'Medium' },
  huggingface: { name: 'HuggingFace', description: 'Cheapest option', cost: 'Very Low' }
};