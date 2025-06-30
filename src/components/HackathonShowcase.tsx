import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Brain, Palette, Users, Target, Star, Award, Rocket, Code, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HackathonShowcaseProps {
  onViewChange: (view: string) => void;
}

export function HackathonShowcase({ onViewChange }: HackathonShowcaseProps) {
  const { t } = useTranslation();
  
  const achievements = [
    {
      icon: Brain,
      title: t('hackathon.creativeUseOfAI'),
      description: t('hackathon.creativeAIDescription'),
      color: 'text-purple-400 bg-purple-400/10 border-purple-400/30'
    },
    {
      icon: Palette,
      title: t('hackathon.mostBeautifulUI'),
      description: t('hackathon.beautifulUIDescription'),
      color: 'text-pink-400 bg-pink-400/10 border-pink-400/30'
    },
    {
      icon: Target,
      title: t('hackathon.sharpestProblemFit'),
      description: t('hackathon.problemFitDescription'),
      color: 'text-blue-400 bg-blue-400/10 border-blue-400/30'
    },
    {
      icon: Rocket,
      title: t('hackathon.futureUnicorn'),
      description: t('hackathon.futureUnicornDescription'),
      color: 'text-green-400 bg-green-400/10 border-green-400/30'
    },
    {
      icon: Users,
      title: t('hackathon.mostViralProject'),
      description: t('hackathon.viralProjectDescription'),
      color: 'text-orange-400 bg-orange-400/10 border-orange-400/30'
    },
    {
      icon: Star,
      title: t('hackathon.uniquelyUsefulTool'),
      description: t('hackathon.usefulToolDescription'),
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/30'
    }
  ];

  const technicalHighlights = [
    t('hackathon.realTimePerformance'),
    t('hackathon.progressiveWebApp'),
    t('hackathon.advancedTypingMetrics'),
    t('hackathon.realTimeMultiplayer'),
    t('hackathon.aiPoweredCoaching'),
    t('hackathon.comprehensiveErrorBoundary'),
    t('hackathon.responsiveDesign'),
    t('hackathon.productionReadyAuth')
  ];

  const handleStartJourney = () => {
    // Navigate to test view and scroll to text input
    onViewChange('test');
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Hackathon Header */}
      <div className="glass-card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-green-600/10" />
        <div className="relative z-10">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Trophy className="w-16 h-16 text-amber-400" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gradient mb-4">
            World's Largest Hackathon Entry
          </h1>
          
          <p className="text-xl text-gray-300 mb-6">
            KeysRace - Revolutionizing Typing Education with AI
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 mb-6">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span>{t('hackathon.builtWithBolt')}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>{t('hackathon.productionReady')}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>{t('hackathon.multiplePrizes')}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://github.com/abdebek/KeysRace"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-dark-800 text-gray-300 rounded-lg hover:bg-dark-700 transition-colors"
            >
              <span>{t('hackathon.viewSource')}</span>
              <ExternalLink className="w-4 h-4" />
            </motion.a>
            
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://bolt.new"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg"
            >
              <span>{t('hackathon.builtWithBolt')}</span>
              <ExternalLink className="w-4 h-4" />
            </motion.a>
            
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://keysrace.waanfeetan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors"
            >
              <span>{t('hackathon.liveDemo')}</span>
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          </div>
        </div>
      </div>

      {/* Prize Categories */}
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">
          {t('hackathon.targeting')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`${achievement.color} rounded-xl p-6 border`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Icon className="w-6 h-6" />
                  <h3 className="font-semibold text-gray-200">{achievement.title}</h3>
                </div>
                <p className="text-sm text-gray-400">
                  {achievement.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Technical Excellence */}
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold text-gray-200 mb-6">
          {t('hackathon.technicalHighlights')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {technicalHighlights.map((highlight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start space-x-3 bg-dark-800/30 rounded-lg p-4"
            >
              <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0" />
              <span className="text-gray-300">{highlight}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Innovation Story */}
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold text-gray-200 mb-6">
          {t('hackathon.innovationStory')}
        </h2>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed mb-4">
            KeysRace represents a paradigm shift in typing education, transforming a traditionally mundane skill-building exercise into an engaging, AI-powered learning experience. Built entirely with Bolt.new, this application demonstrates the platform's capability to create production-ready, feature-rich applications.
          </p>
          
          <p className="text-gray-300 leading-relaxed mb-4">
            The project addresses the growing need for digital literacy skills in our remote-work world, where typing proficiency directly impacts productivity and career advancement. By gamifying the learning process and providing personalized AI coaching, KeysRace makes skill development both effective and enjoyable.
          </p>
          
          <p className="text-gray-300 leading-relaxed">
            With its comprehensive feature set including real-time multiplayer racing, advanced analytics, and progressive web app capabilities, KeysRace is positioned to capture significant market share in the $2.8B online education market, specifically targeting the typing education segment.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="glass-card p-8 text-center bg-gradient-to-r from-primary-600/10 to-success-600/10 border border-primary-500/30">
        <h2 className="text-2xl font-bold text-gray-200 mb-4">
          {t('hackathon.experienceFuture')}
        </h2>
        <p className="text-gray-400 mb-6">
          {t('hackathon.joinUsers')}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartJourney}
          className="px-8 py-4 bg-gradient-to-r from-primary-600 to-success-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {t('hackathon.startJourney')}
        </motion.button>
      </div>
    </motion.div>
  );
}