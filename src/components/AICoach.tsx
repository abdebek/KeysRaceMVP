import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, TrendingUp, Lightbulb, MessageCircle, Zap, BarChart3, Clock, Settings, LogIn, AlertCircle } from 'lucide-react';
import { analyzeTypingPatterns, getPerformanceInsights, getCacheStats, clearAICache, getChatResponse, AI_PROVIDERS } from '../lib/ai';
import { LoadingSpinner } from './LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

interface AIInsight {
  type: 'weakness' | 'strength' | 'suggestion' | 'goal';
  title: string;
  description: string;
  action?: string;
}

export function AICoach() {
  const { t } = useTranslation();
  const { user, isAuthenticated, loading } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'ai', message: string, provider?: string, cost?: number}>>([
    {
      role: 'ai',
      message: t('aiCoach.analyzing')
    }
  ]);
  const [preferredProvider, setPreferredProvider] = useState<string>('auto');
  const [showProviderSettings, setShowProviderSettings] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  
  // Ref for auto-scrolling chat
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadAIAnalysis();
      loadCacheStats();
      setAuthError(null);
    } else if (!loading) {
      // Clear data when not authenticated
      setInsights([]);
      setCacheStats(null);
      if (!isAuthenticated) {
        setAuthError(t('aiCoach.authenticationError'));
      }
    }
  }, [isAuthenticated, user, loading, preferredProvider, t]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const loadAIAnalysis = async () => {
    if (!isAuthenticated || !user) {
      setAuthError(t('aiCoach.authenticationError'));
      return;
    }

    setIsAnalyzing(true);
    setAuthError(null);
    
    try {
      // Get typing history from localStorage
      const typingHistory = JSON.parse(localStorage.getItem('typingResults') || '[]');
      
      if (typingHistory.length > 0) {
        const analysis = await analyzeTypingPatterns(
          typingHistory, 
          preferredProvider === 'auto' ? undefined : preferredProvider
        );
        
        const newInsights: AIInsight[] = [
          ...analysis.weaknesses.map(w => ({
            type: 'weakness' as const,
            title: t('aiCoach.areaForImprovement'),
            description: w,
            action: t('aiCoach.startFocusedPractice')
          })),
          ...analysis.strengths.map(s => ({
            type: 'strength' as const,
            title: t('aiCoach.youreDoingGreat'),
            description: s
          })),
          ...analysis.suggestions.map(s => ({
            type: 'suggestion' as const,
            title: t('aiCoach.recommendation'),
            description: s,
            action: t('aiCoach.tryThisExercise')
          })),
          ...analysis.nextGoals.map(g => ({
            type: 'goal' as const,
            title: t('aiCoach.nextMilestone'),
            description: g,
            action: t('aiCoach.createTrainingPlan')
          }))
        ];
        
        setInsights(newInsights);
      } else {
        setInsights([
          {
            type: 'suggestion',
            title: t('aiCoach.getStarted'),
            description: t('aiCoach.getStartedDescription'),
            action: t('aiCoach.takeFirstTest')
          }
        ]);
      }
    } catch (error: any) {
      console.error('AI analysis failed:', error);
      
      // Handle specific authentication errors
      if (error.message?.includes('Not authenticated') || error.message?.includes('authentication')) {
        setAuthError(t('aiCoach.sessionExpired'));
        setInsights([]);
      } else {
        setInsights([
          {
            type: 'suggestion',
            title: t('aiCoach.analysisUnavailable'),
            description: t('aiCoach.analysisUnavailableDescription'),
          }
        ]);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadCacheStats = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const stats = await getCacheStats();
      setCacheStats(stats);
    } catch (error: any) {
      console.error('Failed to load cache stats:', error);
      if (error.message?.includes('Not authenticated')) {
        setAuthError(t('aiCoach.authenticationError'));
      }
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !isAuthenticated || !user || isSendingMessage) return;

    const userMessage = chatMessage.trim();
    setChatMessage('');
    setIsSendingMessage(true);
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', message: userMessage }]);

    try {
      // Add a temporary "thinking" message
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        message: '...',
        provider: preferredProvider,
      }]);
      
      const response = await getChatResponse(
        userMessage,
        preferredProvider === 'auto' ? undefined : preferredProvider
      );
      
      // Replace the temporary message with the actual response
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { 
          role: 'ai', 
          message: response,
          provider: preferredProvider,
          cost: 0.001 // Estimated cost
        };
        return newHistory;
      });
    } catch (error: any) {
      let errorMessage = t('aiCoach.troubleProcessing');
      
      if (error.message?.includes('Not authenticated')) {
        errorMessage = t('aiCoach.sessionExpiredChat');
        setAuthError(t('aiCoach.sessionExpired'));
      }
      
      setChatHistory(prev => {
        // If there's a temporary message, replace it
        if (prev.length > 0 && prev[prev.length - 1].message === '...') {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { 
            role: 'ai', 
            message: errorMessage
          };
          return newHistory;
        }
        // Otherwise add a new message
        return [...prev, { role: 'ai', message: errorMessage }];
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleClearCache = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      await clearAICache();
      await loadCacheStats();
    } catch (error: any) {
      console.error('Failed to clear cache:', error);
      if (error.message?.includes('Not authenticated')) {
        setAuthError(t('aiCoach.authenticationError'));
      }
    }
  };

  const handleTakeFirstTest = () => {
    // Navigate to test view
    window.location.hash = 'test';
    
    // Scroll to text input after navigation
    setTimeout(() => {
      const textDisplay = document.getElementById('text-display-area');
      if (textDisplay) {
        textDisplay.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 300);
  };

  const handleActionClick = (action: string) => {
    if (action === t('aiCoach.takeFirstTest')) {
      handleTakeFirstTest();
    } else if (action === t('aiCoach.startFocusedPractice')) {
      window.location.hash = 'test';
    } else if (action === t('aiCoach.tryThisExercise')) {
      window.location.hash = 'test';
    } else if (action === t('aiCoach.createTrainingPlan')) {
      window.location.hash = 'tutorial';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'weakness': return Target;
      case 'strength': return TrendingUp;
      case 'suggestion': return Lightbulb;
      case 'goal': return Zap;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'weakness': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'strength': return 'text-success-400 bg-success-400/10 border-success-400/30';
      case 'suggestion': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'goal': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </motion.div>
    );
  }

  // Authentication required message
  if (!isAuthenticated || !user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="glass-card p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-primary-600/20 rounded-full">
              <LogIn className="w-8 h-8 text-primary-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-200 mb-4">{t('aiCoach.signInRequired')}</h2>
          <p className="text-gray-400 mb-6">
            {t('aiCoach.signInDescription')}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200"
          >
            {t('aiCoach.signInToContinue')}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-primary-400" />
            <h2 className="text-2xl font-bold text-gray-200">{t('aiCoach.title')}</h2>
            {user && (
              <span className="text-sm text-gray-400">
                {t('aiCoach.welcomeBack', { email: user.email })}
              </span>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Provider Settings */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProviderSettings(!showProviderSettings)}
              className="p-2 bg-dark-800 text-gray-400 rounded-lg hover:text-gray-200 transition-colors"
              title={t('aiCoach.providerSettings')}
            >
              <Settings className="w-4 h-4" />
            </motion.button>

            {/* Cache Stats */}
            {cacheStats && (
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>{cacheStats.cacheHitRate}% {t('aiCoach.cacheHitRate')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{cacheStats.totalRequests} {t('aiCoach.requests')}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearCache}
                  className="px-3 py-1 bg-dark-800 text-gray-400 rounded hover:text-gray-200 transition-colors"
                >
                  {t('aiCoach.clearCache')}
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Authentication Error Alert */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-4 bg-red-600/10 border border-red-600/30 rounded-lg flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-medium">{t('aiCoach.authenticationError')}</p>
              <p className="text-red-300 text-sm">{authError}</p>
            </div>
          </motion.div>
        )}

        {/* Provider Settings Panel */}
        {showProviderSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-dark-800/50 rounded-lg border border-gray-700/30"
          >
            <h4 className="text-sm font-medium text-gray-300 mb-3">{t('aiCoach.providerSettings')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPreferredProvider('auto')}
                className={`p-3 rounded-lg text-left transition-all ${
                  preferredProvider === 'auto'
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                }`}
              >
                <div className="font-medium">{t('aiCoach.autoSelect')}</div>
                <div className="text-xs opacity-80">{t('aiCoach.bestProvider')}</div>
              </motion.button>
              
              {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPreferredProvider(key)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    preferredProvider === key
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }`}
                >
                  <div className="font-medium">{provider.name}</div>
                  <div className="text-xs opacity-80">{provider.description}</div>
                  <div className="text-xs mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      provider.cost === 'Very Low' ? 'bg-green-600/20 text-green-400' :
                      provider.cost === 'Low' ? 'bg-blue-600/20 text-blue-400' :
                      provider.cost === 'Medium' ? 'bg-amber-600/20 text-amber-400' :
                      'bg-red-600/20 text-red-400'
                    }`}>
                      {t(`aiCoach.${provider.cost.toLowerCase().replace(' ', '')}`)} {t('aiCoach.costLabel')}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <p className="text-gray-400">
          {t('aiCoach.description')}
        </p>
      </div>

      {/* Analysis Status */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 text-center"
        >
          <LoadingSpinner size="lg" text={t('aiCoach.analyzing')} />
        </motion.div>
      )}

      {/* AI Insights */}
      {!isAnalyzing && insights.length > 0 && !authError && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-200">{t('aiCoach.personalizedInsights')}</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadAIAnalysis}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t('aiCoach.refreshAnalysis')}
            </motion.button>
          </div>
          
          {insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            const colorClasses = getInsightColor(insight.type);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card p-6 border ${colorClasses}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${colorClasses}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">
                      {insight.title}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick(insight.action!)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200"
                      >
                        {insight.action}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Chat Interface - Enhanced with dynamic sizing */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-5 h-5 text-success-400" />
            <h3 className="text-lg font-semibold text-gray-200">{t('aiCoach.askYourCoach')}</h3>
            {preferredProvider !== 'auto' && (
              <span className="text-xs bg-primary-600/20 text-primary-400 px-2 py-1 rounded-full">
                Using {AI_PROVIDERS[preferredProvider as keyof typeof AI_PROVIDERS]?.name}
              </span>
            )}
          </div>
          
          {/* Expand/Collapse Toggle */}
          {chatHistory.length > 3 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setChatExpanded(!chatExpanded)}
              className="text-xs bg-dark-800 text-gray-400 px-3 py-1 rounded-full hover:text-gray-200 transition-colors"
            >
              {chatExpanded ? 'Collapse' : 'Expand'}
            </motion.button>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Chat History with dynamic height */}
          <div 
            ref={chatHistoryRef}
            className={`space-y-3 p-4 bg-dark-800/30 rounded-lg border border-gray-700/30 overflow-y-auto transition-all duration-300 ${
              chatExpanded 
                ? 'max-h-96' 
                : chatHistory.length <= 3 
                  ? 'max-h-none' 
                  : 'max-h-64'
            }`}
            style={{
              // Dynamic height based on content when not many messages
              minHeight: chatHistory.length <= 3 ? 'auto' : '200px'
            }}
          >
            {chatHistory.map((chat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start space-x-3 ${
                  chat.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {chat.role === 'ai' && (
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    chat.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800/50 text-gray-300'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{chat.message}</p>
                  {chat.provider && chat.cost && (
                    <div className="text-xs opacity-60 mt-1">
                      {chat.provider} • ${chat.cost.toFixed(4)}
                    </div>
                  )}
                </div>
                {chat.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">You</span>
                  </div>
                )}
              </motion.div>
            ))}
            
            {chatHistory.length === 1 && (
              <div className="text-center text-gray-500 text-sm py-4">
                Ask your AI coach anything about improving your typing skills
              </div>
            )}
          </div>
          
          {/* Chat Input */}
          <form onSubmit={handleChatSubmit} className="flex space-x-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder={authError ? t('aiCoach.chatPlaceholderSignedOut') : t('aiCoach.chatPlaceholder')}
              disabled={!!authError || isSendingMessage}
              className="flex-1 px-4 py-3 bg-dark-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!chatMessage.trim() || !!authError || isSendingMessage}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingMessage ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>{t('aiCoach.send')}</span>
                </div>
              ) : (
                t('aiCoach.send')
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}