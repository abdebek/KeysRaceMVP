import React from 'react';
import { RefreshCw, Clock, Type, Play, Pause } from 'lucide-react';
import { TestConfig } from '../types';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTyping } from '../contexts/TypingContext';

interface TestControlsProps {
  config: TestConfig;
  onConfigChange: (config: TestConfig) => void;
  onRestart: () => void;
  onPauseResume: () => void;
  onFocusInput: () => void;
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
}

export function TestControls({ 
  config, 
  onConfigChange, 
  onRestart, 
  onPauseResume,
  onFocusInput,
  isActive, 
  isPaused,
  isCompleted 
}: TestControlsProps) {
  const { t } = useTranslation();
  const { focusTypingInput } = useTyping();
  
  const timeOptions = [15, 30, 60, 120];
  const wordOptions = [25, 50, 100, 200];
  const categoryOptions = [
    { value: 'quotes', label: t('testConfig.quotes') },
    { value: 'programming', label: t('testConfig.code') },
    { value: 'literature', label: t('testConfig.literature') },
    { value: 'news', label: t('testConfig.news') }
  ] as const;

  const scrollToTextInput = () => {
    // Scroll to text display area instead of virtual keyboard
    const textDisplay = document.getElementById('text-display-area');
    if (textDisplay) {
      textDisplay.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
    }
    // Focus input after scroll
    setTimeout(() => focusTypingInput(), 300);
  };

  const handleConfigChange = (newConfig: TestConfig) => {
    onConfigChange(newConfig);
    // Scroll to text input after config change
    setTimeout(() => scrollToTextInput(), 200);
  };

  const handleRestart = () => {
    onRestart();
    // Scroll to text input after restart
    setTimeout(() => scrollToTextInput(), 200);
  };

  const handlePauseResume = () => {
    onPauseResume();
    // If resuming, focus the input and scroll to it
    if (isPaused) {
      setTimeout(() => scrollToTextInput(), 200);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 md:p-6"
    >
      {/* Main Controls Grid - Adjust columns based on mode */}
      <div className={`grid grid-cols-1 gap-6 lg:gap-8 ${
        config.mode === 'time' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
      }`}>
        
        {/* Mode Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400 text-center lg:text-left">{t('testConfig.testMode')}</h4>
          <div className="flex justify-center lg:justify-start space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleConfigChange({ ...config, mode: 'time' })}
              disabled={isActive && !isCompleted}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                config.mode === 'time'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' 
                  : 'bg-dark-800 text-gray-400 hover:text-gray-200 hover:bg-dark-700'
              } ${isActive && !isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Clock className="w-4 h-4" />
              <span>{t('testConfig.timed')}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleConfigChange({ ...config, mode: 'words' })}
              disabled={isActive && !isCompleted}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                config.mode === 'words'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' 
                  : 'bg-dark-800 text-gray-400 hover:text-gray-200 hover:bg-dark-700'
              } ${isActive && !isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Type className="w-4 h-4" />
              <span>{t('testConfig.words')}</span>
            </motion.button>
          </div>
        </div>

        {/* Duration/Words Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400 text-center lg:text-left">
            {config.mode === 'time' ? t('testConfig.duration') : t('testConfig.wordCount')}
          </h4>
          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
            {(config.mode === 'time' ? timeOptions : wordOptions).map((option) => (
              <motion.button
                key={option}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleConfigChange({
                  ...config,
                  [config.mode === 'time' ? 'timeLimit' : 'wordLimit']: option
                })}
                disabled={isActive && !isCompleted}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 min-w-[60px] ${
                  (config.mode === 'time' ? config.timeLimit : config.wordLimit) === option
                    ? 'bg-success-600 text-white shadow-lg shadow-success-600/25'
                    : 'bg-dark-800 text-gray-400 hover:text-gray-200 hover:bg-dark-700'
                } ${isActive && !isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {option}{config.mode === 'time' ? 's' : ''}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Category Selection - Only show for timed mode */}
        {config.mode === 'time' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-400 text-center lg:text-left">{t('testConfig.textCategory')}</h4>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
              {categoryOptions.map((category) => (
                <motion.button
                  key={category.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleConfigChange({ ...config, textCategory: category.value })}
                  disabled={isActive && !isCompleted}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    config.textCategory === category.value
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25'
                      : 'bg-dark-800 text-gray-400 hover:text-gray-200 hover:bg-dark-700'
                  } ${isActive && !isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {category.label}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Words Mode Info - Show when words mode is selected */}
        {config.mode === 'words' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-400 text-center lg:text-left">{t('testConfig.textType')}</h4>
            <div className="bg-dark-800/50 rounded-lg p-4 border border-gray-700/30">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Type className="w-4 h-4 text-primary-400" />
                <span>{t('testConfig.commonWordsGenerated')}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {t('testConfig.wordBasedDescription')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-6 border-t border-gray-700/30">
        <div className="flex justify-center space-x-4">
          {/* Pause/Resume Button - Only show when test is active */}
          {isActive && !isCompleted && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePauseResume}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 ${
                isPaused 
                  ? 'bg-success-600 text-white hover:bg-success-700'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span>{isPaused ? t('common.resume') : t('common.pause')}</span>
            </motion.button>
          )}

          {/* Restart Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRestart}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-success-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('testConfig.newTest')}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}