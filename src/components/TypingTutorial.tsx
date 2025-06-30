import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Target, Keyboard, Zap, Play, Pause } from 'lucide-react';
import { useTypingTest } from '../hooks/useTypingTest';
import { useKeyboardTracking } from '../hooks/useKeyboardTracking';
import { TestConfig } from '../types';
import { TextDisplay } from './TextDisplay';
import { StatsDisplay } from './StatsDisplay';
import { VirtualKeyboard } from './VirtualKeyboard';
import { useTranslation } from 'react-i18next';

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  focusKeys: string[];
  difficulty: number;
}

export function TypingTutorial() {
  const { t } = useTranslation();
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const lessons: Lesson[] = [
    {
      id: 'home-row',
      title: t('tutorial.homeRowMastery'),
      description: t('tutorial.homeRowDescription'),
      content: 'asdf jkl; asdf jkl; aaa sss ddd fff jjj kkk lll ;;; asdf jkl; sad lad ask dad fall all sass glass',
      focusKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
      difficulty: 1
    },
    {
      id: 'top-row',
      title: t('tutorial.topRowExtension'),
      description: t('tutorial.topRowDescription'),
      content: 'qwer tyui qwer tyui qqq www eee rrr ttt yyy uuu iii qwer tyui quit were tire your quite write',
      focusKeys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i'],
      difficulty: 2
    },
    {
      id: 'bottom-row',
      title: t('tutorial.bottomRowChallenge'),
      description: t('tutorial.bottomRowDescription'),
      content: 'zxcv bnm, zxcv bnm, zzz xxx ccc vvv bbb nnn mmm ,,, zxcv bnm, zone exam cave barn main',
      focusKeys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ','],
      difficulty: 3
    },
    {
      id: 'numbers',
      title: t('tutorial.numberRowPrecision'),
      description: t('tutorial.numberRowDescription'),
      content: '1234 5678 90 1234 5678 90 111 222 333 444 555 666 777 888 999 000 12 34 56 78 90',
      focusKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      difficulty: 4
    },
    {
      id: 'symbols',
      title: t('tutorial.specialCharacters'),
      description: t('tutorial.specialCharactersDescription'),
      content: '!@#$ %^&* ()_+ !@#$ %^&* ()_+ ;;; """ ,,, ... ??? !!! @@@ ### $$$ %%% ^^^',
      focusKeys: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
      difficulty: 5
    }
  ];

  const currentLessonData = lessons[currentLesson];

  // Create a config for the typing test
  const tutorialConfig: TestConfig = {
    mode: 'words',
    timeLimit: 60,
    wordLimit: 50,
    textCategory: 'custom'
  };

  const {
    stats,
    characterStates,
    isActive: testIsActive,
    isCompleted,
    currentIndex,
    elapsedTime,
    handleKeyPress,
    restart,
    focusInput,
    inputRef
  } = useTypingTest(currentLessonData.content, tutorialConfig);

  const {
    pressedKeys,
    lastPressedKey,
    keyAccuracy,
    trackKeyPress,
    resetTracking
  } = useKeyboardTracking();

  // Handle keyboard input when practice is active
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;
      
      // Prevent default for typing keys
      if (e.key.length === 1 || e.key === 'Backspace') {
        e.preventDefault();
        handleKeyPress(e.key, (key, isCorrect) => {
          trackKeyPress(key, isCorrect);
        });
      }
      
      // Handle special keys
      if (e.key === 'Tab' || e.key === 'Escape') {
        e.preventDefault();
        handleStop();
      }
    };

    if (isActive) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isActive, handleKeyPress, trackKeyPress]);

  // Auto-focus input when starting practice
  useEffect(() => {
    if (isActive) {
      setTimeout(() => focusInput(), 100);
    }
  }, [isActive, focusInput]);

  // Reset when lesson changes
  useEffect(() => {
    handleStop();
  }, [currentLesson]);

  const handleStart = () => {
    setIsActive(true);
    restart();
    resetTracking();
  };

  const handleStop = () => {
    setIsActive(false);
    restart();
    resetTracking();
  };

  const nextLesson = () => {
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    }
  };

  const prevLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = [
      'text-green-400',
      'text-blue-400',
      'text-yellow-400',
      'text-orange-400',
      'text-red-400'
    ];
    return colors[difficulty - 1] || 'text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="w-6 h-6 text-primary-400" />
          <h2 className="text-2xl font-bold text-gray-200">{t('tutorial.title')}</h2>
        </div>
        <p className="text-gray-400">
          {t('tutorial.description')}
        </p>
      </div>

      {/* Lesson Progress */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-200">{t('tutorial.progress')}</h3>
          <span className="text-sm text-gray-400">
            {t('tutorial.lesson', { current: currentLesson + 1, total: lessons.length })}
          </span>
        </div>
        
        <div className="flex space-x-2 mb-4">
          {lessons.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded-full ${
                index <= currentLesson ? 'bg-primary-500' : 'bg-dark-700'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {lessons.map((lesson, index) => (
            <motion.button
              key={lesson.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentLesson(index)}
              className={`p-3 rounded-lg text-left transition-all duration-200 ${
                index === currentLesson
                  ? 'bg-primary-600 text-white'
                  : index < currentLesson
                  ? 'bg-success-600/20 text-success-400 border border-success-500/30'
                  : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
              }`}
            >
              <div className="text-sm font-medium mb-1">{lesson.title}</div>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {Array.from({ length: lesson.difficulty }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full mr-1 ${getDifficultyColor(lesson.difficulty)}`}
                    />
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Current Lesson */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLesson}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Lesson Info */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-200 mb-2">
                  {currentLessonData.title}
                </h3>
                <p className="text-gray-400">{currentLessonData.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                {Array.from({ length: currentLessonData.difficulty }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${getDifficultyColor(currentLessonData.difficulty)}`}
                  />
                ))}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevLesson}
                disabled={currentLesson === 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentLesson === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t('common.previous')}</span>
              </motion.button>

              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">{t('tutorial.lesson', { current: currentLesson + 1, total: lessons.length })}</div>
                <div className="text-lg font-semibold text-gray-200">{currentLessonData.title}</div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextLesson}
                disabled={currentLesson === lessons.length - 1}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentLesson === lessons.length - 1
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                }`}
              >
                <span>{t('common.next')}</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Practice Area - Only show when active */}
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats */}
              <StatsDisplay 
                stats={stats} 
                config={tutorialConfig} 
                elapsedTime={elapsedTime} 
                isActive={testIsActive} 
              />

              {/* Focus Keys and Practice Controls - Right above text input */}
              <div className="glass-card p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Focus Keys */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">{t('tutorial.focusKeys')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentLessonData.focusKeys.map(key => (
                        <motion.div
                          key={key}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 }}
                          className="w-10 h-10 bg-primary-600/20 border border-primary-500/40 rounded-lg flex items-center justify-center text-primary-400 font-mono font-bold"
                        >
                          {key.toUpperCase()}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Practice Controls */}
                  <div className="flex items-center justify-center lg:justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleStop}
                      className="flex items-center space-x-2 px-6 py-3 bg-error-600 text-white rounded-lg font-medium hover:bg-error-700 transition-all duration-200"
                    >
                      <Pause className="w-4 h-4" />
                      <span>{t('tutorial.stopPractice')}</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Text Display */}
              <TextDisplay
                characterStates={characterStates}
                currentIndex={currentIndex}
                onFocus={focusInput}
                isActive={isActive}
                isCompleted={isCompleted}
              />

              {/* Virtual Keyboard */}
              <VirtualKeyboard
                pressedKeys={pressedKeys}
                lastPressedKey={lastPressedKey}
                keyAccuracy={keyAccuracy}
              />

              {/* Hidden input for mobile keyboards */}
              <input
                ref={inputRef}
                className="absolute -left-[9999px] opacity-0"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </motion.div>
          )}

          {/* Instructions when not active */}
          {!isActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Focus Keys and Start Button - Right above preview */}
              <div className="glass-card p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Focus Keys */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">{t('tutorial.focusKeys')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentLessonData.focusKeys.map(key => (
                        <motion.div
                          key={key}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 }}
                          className="w-10 h-10 bg-primary-600/20 border border-primary-500/40 rounded-lg flex items-center justify-center text-primary-400 font-mono font-bold"
                        >
                          {key.toUpperCase()}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Start Practice Button */}
                  <div className="flex items-center justify-center lg:justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleStart}
                      className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200"
                    >
                      <Play className="w-4 h-4" />
                      <span>{t('tutorial.startPractice')}</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Practice Text Preview */}
              <div className="glass-card p-8 text-center">
                <Keyboard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-300 mb-2">{t('tutorial.readyToPractice')}</h3>
                <p className="text-gray-400 mb-6">
                  {t('tutorial.practiceInstructions')}
                </p>
                <div className="bg-dark-800/50 rounded-xl p-6 border border-gray-700/30">
                  <div className="text-lg font-mono leading-relaxed text-gray-300 select-none">
                    {currentLessonData.content}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}