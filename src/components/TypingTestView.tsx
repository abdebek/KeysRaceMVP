import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TestControls } from './TestControls';
import { TextDisplay } from './TextDisplay';
import { StatsDisplay } from './StatsDisplay';
import { VirtualKeyboard } from './VirtualKeyboard';
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

  // Track if the component is mounted
  const isMounted = useRef(true);
  
  // Track focus attempts to prevent excessive refocusing
  const focusAttempts = useRef(0);
  const lastFocusTime = useRef(0);
  
  // Debounce state updates
  const updateTimeoutRef = useRef<number>();

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
    // Use a timeout to debounce state updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = window.setTimeout(() => {
      setIsTypingActive(isActive && !isCompleted);
    }, 100);
    
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [isActive, isCompleted, setIsTypingActive]);

  // Generate new text when config changes
  useEffect(() => {
    if (config.mode === 'words') {
      setTestText(generateCustomText(config.wordLimit));
    } else {
      setTestText(getTextForDuration(config.textCategory, config.timeLimit));
    }
  }, [config]);

  // Track performance when test completes
  useEffect(() => {
    if (isCompleted) {
      trackTypingPerformance({
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        testDuration: elapsedTime,
        errorCount: stats.incorrectChars
      });

      // Show completion notification
      addNotification({
        type: 'success',
        title: 'Test Completed!',
        message: `${stats.wpm} WPM with ${stats.accuracy}% accuracy`,
        duration: 4000
      });
    }
  }, [isCompleted]);

  // Set up cleanup when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
      removeGlobalKeyPress();
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [removeGlobalKeyPress]);

  // Handle keyboard input using global context
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      try {
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
          handleRestart();
        }
      } catch (error) {
        trackError(error as Error, 'keyboard_input');
      }
    };

    // Register the keyboard handler with global context
    handleGlobalKeyPress(handleKeyDown);

    return () => {
      if (isMounted.current) {
        removeGlobalKeyPress();
      }
    };
  }, [handleKeyPress, trackKeyPress, addKeystroke, trackError, handleGlobalKeyPress, removeGlobalKeyPress]);

  // Auto-focus when component mounts and periodically check focus
  useEffect(() => {
    // Initial focus
    const timer = setTimeout(() => {
      focusTypingInput();
    }, 300);
    
    // Set up periodic focus check - but with reduced frequency
    const focusCheckInterval = setInterval(() => {
      if (isActive && !isPaused && !isCompleted && document.activeElement !== inputRef.current) {
        // Only attempt to refocus if we haven't tried too many times recently
        const now = Date.now();
        if (now - lastFocusTime.current > 3000) { // 3 seconds between focus attempts
          focusAttempts.current = 0;
        }
        
        if (focusAttempts.current < 2) { // Limit to 2 consecutive attempts
          focusTypingInput();
          focusAttempts.current++;
          lastFocusTime.current = now;
        }
      } else {
        // Reset focus attempts when already focused
        focusAttempts.current = 0;
      }
    }, 3000); // Check less frequently (3 seconds)
    
    return () => {
      clearTimeout(timer);
      clearInterval(focusCheckInterval);
    };
  }, [focusTypingInput, isActive, isPaused, isCompleted, inputRef]);

  const handleConfigChange = useCallback((newConfig: TestConfig) => {
    onConfigChange(newConfig);
    handleRestart();
  }, [onConfigChange]);

  const handleRestart = useCallback(() => {
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
    
    // Reset focus attempts
    focusAttempts.current = 0;
    
    // Focus input after restart
    setTimeout(() => {
      focusTypingInput();
    }, 100);
  }, [config, restart, resetTracking, resetWPMTracking, resetAdvancedMetrics, clearAllNotifications, focusTypingInput]);

  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      resume();
      // Focus input when resuming
      setTimeout(() => {
        focusTypingInput();
      }, 100);
    } else {
      pause();
    }
  }, [isPaused, resume, pause, focusTypingInput]);

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
                    onClick={() => {
                      resume();
                      setTimeout(() => focusTypingInput(), 100);
                    }}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200"
                  >
                    Resume Test
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Stats Display - Full width */}
            <StatsDisplay 
              stats={stats} 
              config={config} 
              elapsedTime={elapsedTime} 
              isActive={isActive && !isPaused} 
            />

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
            {/* TODO: WPM graph removed for performance reasons. Will be reimplemented in the future. */}
            <AdvancedMetrics 
              stats={metrics} 
              isVisible={showAdvancedMetrics} 
            />

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