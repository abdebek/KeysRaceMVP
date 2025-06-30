import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypingTestView } from './TypingTestView';
import { Statistics } from './Statistics';
import { Settings } from './Settings';
import { TypingHeatmap } from './TypingHeatmap';
import { TypingChallenges } from './TypingChallenges';
import { TypingTutorial } from './TypingTutorial';
import { PremiumFeatures } from './PremiumFeatures';
import { MultiplayerRacing } from './MultiplayerRacing';
import { AICoach } from './AICoach';
import { GlobalLeaderboard } from './GlobalLeaderboard';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsOfService } from './TermsOfService';
import { HackathonShowcase } from './HackathonShowcase';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from './NotificationSystem';
import { TestConfig } from '../types';

interface ViewManagerProps {
  currentView: string;
  config: TestConfig;
  onConfigChange: (config: TestConfig) => void;
  onViewChange?: (view: string) => void;
}

export function ViewManager({ currentView, config, onConfigChange, onViewChange }: ViewManagerProps) {
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  const handleStartChallenge = (challengeId: string, testConfig?: TestConfig) => {
    // Show notification
    addNotification({
      type: 'info',
      title: 'Challenge Started!',
      message: 'Good luck with your typing challenge',
      duration: 2000
    });
    
    // If test config is provided, update the test configuration
    if (testConfig) {
      onConfigChange(testConfig);
    }
    
    // Navigate to test view
    if (onViewChange) {
      onViewChange('test');
    }
  };

  const handleUpgrade = () => {
    addNotification({
      type: 'info',
      title: 'Premium Upgrade',
      message: 'Redirecting to payment...',
      duration: 2000
    });
  };

  const handleStartRace = () => {
    addNotification({
      type: 'info',
      title: 'Race Starting!',
      message: 'Get ready to type...',
      duration: 2000
    });
  };

  // Mock data for heatmap
  const mockHeatmapData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    wpm: Math.floor(Math.random() * 40) + 40,
    accuracy: Math.floor(Math.random() * 20) + 80,
    duration: Math.floor(Math.random() * 300) + 60
  }));

  return (
    <AnimatePresence mode="wait">
      {currentView === 'hackathon' && (
        <motion.div
          key="hackathon"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <HackathonShowcase onViewChange={onViewChange || (() => {})} />
        </motion.div>
      )}

      {currentView === 'test' && (
        <motion.div
          key="test"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <TypingTestView 
            config={config}
            onConfigChange={onConfigChange}
          />
        </motion.div>
      )}

      {currentView === 'stats' && (
        <motion.div
          key="stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <Statistics />
          <TypingHeatmap sessions={mockHeatmapData} />
        </motion.div>
      )}

      {currentView === 'settings' && (
        <motion.div
          key="settings"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Settings />
        </motion.div>
      )}

      {currentView === 'leaderboard' && (
        <motion.div
          key="leaderboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <TypingChallenges onStartChallenge={handleStartChallenge} />
          <div className="mt-8">
            <GlobalLeaderboard />
          </div>
        </motion.div>
      )}

      {currentView === 'multiplayer' && (
        <motion.div
          key="multiplayer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <MultiplayerRacing onStartRace={handleStartRace} />
        </motion.div>
      )}

      {currentView === 'ai-coach' && (
        <motion.div
          key="ai-coach"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <AICoach />
        </motion.div>
      )}

      {currentView === 'premium' && (
        <motion.div
          key="premium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <PremiumFeatures onUpgrade={handleUpgrade} />
        </motion.div>
      )}

      {currentView === 'tutorial' && (
        <motion.div
          key="tutorial"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <TypingTutorial />
        </motion.div>
      )}

      {currentView === 'privacy' && (
        <motion.div
          key="privacy"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <PrivacyPolicy />
        </motion.div>
      )}

      {currentView === 'terms' && (
        <motion.div
          key="terms"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <TermsOfService />
        </motion.div>
      )}
    </AnimatePresence>
  );
}