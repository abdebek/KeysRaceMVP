import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TestControls } from './TestControls';
import { TextDisplay } from './TextDisplay';
import { StatsDisplay } from './StatsDisplay';
import { VirtualKeyboard } from './VirtualKeyboard';
import { WPMGraph } from './WPMGraph';
import { AdvancedMetrics } from './AdvancedMetrics';
import { Results } from './Results';
import { TypingEffects } from './TypingEffects';
import { useTypingTest } from '../hooks/useTypingTest';
import { useKeyboardTracking } from '../hooks/useKeyboardTracking';
import { useWPMTracking } from '../hooks/useWPMTracking';
import { useAdvancedMetrics } from '../hooks/useAdvancedMetrics';
import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring';
import { useNotifications } from './NotificationSystem';
import { useTyping } from '../contexts/TypingContext';
import { getRandomText, generateCustomText, getTextForDuration } from '../data/texts';
import { TestConfig } from '../types';

interface TypingTestViewProps {
  config: TestConfig;
  onConfigChange: (config: TestConfig) => void;
}

export function TypingTestView({ config, onConfigChange }: TypingTestViewProps) {
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [testText, setTestText] = useState(() => 
    config.mode === 'time' 
      ? getTextForDuration('quotes', config.timeLimit)
      : generateCustomText(config.wordLimit)
  );

  const { addNotification, clearAllNotifications } = useNotifications();
  const { trackTypingPerformance, trackError } = usePerformanceMonitoring();
  const { 
    setIsTypingActive, 
    focusTypingInput, 
    handleGlobalKeyPress, 
    removeGlobalKeyPress,
    inputRef
  } = useTyping();

  const {
    stats,
    characterStates,
    isActive,
    isPaused,
    isCompleted,
    currentIndex,
    elapsedTime,
    handleKeyPress,
    pause,
    resume,
    restart,
    focusInput,
  } = useTypingTest(testText, config);

  const {
    pressedKeys,
    lastPressedKey,
    keyAccuracy,
    typingEffects,
    correctStreak,
    trackKeyPress,
    resetTracking
  } = useKeyboardTracking();

  const { wpmHistory, resetWPMTracking } = useWPMTracking(isActive && !isPaused, stats.wpm, stats.accuracy);
  const { metrics, addKeystroke, reset: resetAdvancedMetrics } = useAdvancedMetrics();

  // Update global typing state
  useEffect(() => {
    setIsTypingActive(isActive && !isCompleted);
    console.log('Typing active state:', isActive && !isCompleted);
  }, [isActive, isCompleted, setIsTypingActive]);

  // Generate new text when config changes
  useEffect(() => {
    if (config.mode === 'words') {
      setTestText(generateCustomText(config.wordLimit));
    } else {
      setTestText(getTextForDuration(config.textCategory, config.timeLimit));
    }
  }, [config]);

  // Track performance when test completes (only once per completion)
  useEffect(() => {
    if (isCompleted) {
      trackTypingPerformance({
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        testDuration: elapsedTime,
        errorCount: stats.incorrectChars
      });

      // Show completion notification only once
      addNotification({
        type: 'success',
        title: 'Test Completed!',
        message: `${stats.wpm} WPM with ${stats.accuracy}% accuracy`,
        duration: 4000
      });
    }
  }, [isCompleted]); // Remove other dependencies to prevent multiple triggers

  // Handle keyboard input using global context
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      try {
        console.log('Key pressed in TypingTestView:', e.key);
        
        // Prevent default for typing keys
        if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Escape') {
          e.preventDefault();
          handleKeyPress(e.key, (key, isCorrect) => {
            trackKeyPress(key, isCorrect);
            addKeystroke(key, isCorrect);
          });
        }
        
        // Handle Tab for restart
        if (e.key === 'Tab') {
          e.preventDefault();
          restart();
          resetTracking();
          resetWPMTracking();
          resetAdvancedMetrics();
          clearAllNotifications();
          // Focus input after restart
          setTimeout(() => focusTypingInput(), 200);
        }
      } catch (error) {
        trackError(error as Error, 'keyboard_input');
      }
    };

    // Register the keyboard handler with global context
    handleGlobalKeyPress(handleKeyDown);
    console.log('Registered typing test keyboard handler');

    return () => {
      removeGlobalKeyPress();
      console.log('Removed typing test keyboard handler');
    };
  }, [handleKeyPress, restart, trackKeyPress, resetTracking, resetWPMTracking, addKeystroke, resetAdvancedMetrics, trackError, clearAllNotifications, focusTypingInput, handleGlobalKeyPress, removeGlobalKeyPress]);

  // Auto-focus when component mounts
  useEffect(() => {
    console.log('TypingTestView mounted, focusing input');
    const timer = setTimeout(() => {
      focusTypingInput();
    }, 300);
    return () => clearTimeout(timer);
  }, [focusTypingInput]);

  const handleConfigChange = (newConfig: TestConfig) => {
    onConfigChange(newConfig);
    restart();
    resetTracking();
    resetWPMTracking();
    resetAdvancedMetrics();
    clearAllNotifications();
  };

  const handleRestart = () => {
    // Generate new text based on current config
    if (config.mode === 'words') {
      setTestText(generateCustomText(config.wordLimit));
    } else {
      setTestText(getTextForDuration(config.textCategory, config.timeLimit));
    }
    restart();
    resetTracking();
    resetWPMTracking();
    resetAdvancedMetrics();
    clearAllNotifications();
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleTextDisplayClick = () => {
    console.log('Text display clicked, focusing input');
    focusTypingInput();
  };

  return (
    <>
      {/* Typing Effects */}
      <TypingEffects effects={typingEffects} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-3 md:space-y-4"
      >
        {!isCompleted ? (
          <>
            {/* Test Controls at the top */}
            <TestControls
              config={config}
              onConfigChange={handleConfigChange}
              onRestart={handleRestart}
              onPauseResume={handlePauseResume}
              onFocusInput={focusTypingInput}
              isActive={isActive}
              isPaused={isPaused}
              isCompleted={isCompleted}
            />

            {/* Pause Overlay */}
            {isPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center"
                data-modal="pause"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="glass-card p-8 text-center max-w-md mx-4"
                >
                  <h3 className="text-2xl font-bold text-gray-200 mb-4">Test Paused</h3>
                  <p className="text-gray-400 mb-6">
                    Your progress has been saved. Press Esc or click below to resume.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resume}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200"
                  >
                    Resume Test
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Optimized layout for typing interface */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 md:gap-4">
              {/* Stats - takes more space */}
              <div className="xl:col-span-3">
                <StatsDisplay 
                  stats={stats} 
                  config={config} 
                  elapsedTime={elapsedTime} 
                  isActive={isActive && !isPaused} 
                />
              </div>
              {/* WPM Graph - compact */}
              <div className="xl:col-span-2">
                <WPMGraph data={wpmHistory} currentWPM={stats.wpm} />
              </div>
            </div>

            {/* Text Display - single line, prominent */}
            <TextDisplay
              characterStates={characterStates}
              currentIndex={currentIndex}
              onFocus={focusTypingInput}
              isActive={isActive}
              isCompleted={isCompleted}
            />
            
            {/* Virtual Keyboard - compact, directly below text */}
            <VirtualKeyboard
              pressedKeys={pressedKeys}
              lastPressedKey={lastPressedKey}
              keyAccuracy={keyAccuracy}
            />

            {/* Advanced Metrics Toggle - moved to bottom */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                className="px-4 py-2 bg-dark-800 text-gray-400 rounded-lg hover:text-gray-200 transition-colors duration-200"
              >
                {showAdvancedMetrics ? 'Hide' : 'Show'} Advanced Metrics
              </motion.button>
            </div>

            {/* Advanced Metrics - collapsible */}
            <AdvancedMetrics stats={metrics} isVisible={showAdvancedMetrics} />

            {/* Streak Display */}
            {correctStreak > 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed top-20 right-4 md:right-8 glass-card p-3 md:p-4 border-l-4 border-success-500 z-40"
              >
                <div className="text-success-400 font-bold text-base md:text-lg">
                  🔥 {correctStreak} Streak!
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <Results
            stats={stats}
            config={config}
            onRestart={handleRestart}
          />
        )}
      </motion.div>
    </>
  );
}