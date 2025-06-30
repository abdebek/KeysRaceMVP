import { useState, useEffect, useRef, useCallback } from 'react';
import { TypingStats, TestConfig, CharacterState, PersonalBest, TestResult } from '../types';

export function useTypingTest(testText: string, config: TestConfig) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const [errors, setErrors] = useState<number[]>([]);
  const [extraChars, setExtraChars] = useState<string[]>([]);
  
  const intervalRef = useRef<number>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate statistics
  const stats: TypingStats = {
    wpm: elapsedTime > 0 ? Math.round((userInput.length / 5) / (elapsedTime / 60)) : 0,
    accuracy: userInput.length > 0 ? Math.round(((userInput.length - errors.length) / userInput.length) * 100) : 100,
    correctChars: userInput.length - errors.length,
    incorrectChars: errors.length,
    totalChars: userInput.length,
    elapsedTime
  };

  // Generate character states for display
  const characterStates: CharacterState[] = testText.split('').map((char, index) => ({
    char,
    status: index < userInput.length 
      ? (userInput[index] === char ? 'correct' : 'incorrect')
      : 'pending',
    isCurrentPosition: index === currentIndex
  }));

  // Add extra characters if user typed beyond the text
  if (extraChars.length > 0) {
    extraChars.forEach(char => {
      characterStates.push({
        char,
        status: 'extra',
        isCurrentPosition: false
      });
    });
  }

  // Timer effect
  useEffect(() => {
    if (isActive && !isCompleted && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 0.1);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isCompleted, isPaused]);

  // Check for completion
  useEffect(() => {
    if (config.mode === 'time' && elapsedTime >= config.timeLimit) {
      handleComplete();
    } else if (config.mode === 'words' && userInput.length >= testText.length) {
      handleComplete();
    }
  }, [elapsedTime, userInput.length, config, testText.length]);

  const handleKeyPress = useCallback((key: string, onKeyTrack?: (key: string, isCorrect: boolean) => void) => {
    if (isCompleted) return;

    // Handle pause/resume
    if (key === 'Escape') {
      if (isActive && !isPaused) {
        pause();
      } else if (isPaused) {
        resume();
      }
      return;
    }

    // Don't allow typing when paused
    if (isPaused) return;

    if (!isActive && !startTime) {
      setIsActive(true);
      setStartTime(Date.now());
    }

    if (key === 'Backspace') {
      if (userInput.length > 0) {
        const newInput = userInput.slice(0, -1);
        setUserInput(newInput);
        setCurrentIndex(Math.max(0, currentIndex - 1));
        
        // Remove error if we're backspacing over one
        const errorIndex = errors.indexOf(userInput.length - 1);
        if (errorIndex > -1) {
          setErrors(prev => prev.filter((_, i) => i !== errorIndex));
        }
        
        // Remove extra character if we're backspacing over one
        if (extraChars.length > 0) {
          setExtraChars(prev => prev.slice(0, -1));
        }
      }
    } else if (key.length === 1) {
      const newInput = userInput + key;
      setUserInput(newInput);
      
      let isCorrect = false;
      
      if (currentIndex < testText.length) {
        isCorrect = key === testText[currentIndex];
        if (!isCorrect) {
          setErrors(prev => [...prev, userInput.length]);
        }
        setCurrentIndex(prev => prev + 1);
      } else {
        // User is typing beyond the test text
        setExtraChars(prev => [...prev, key]);
      }

      // Track key press for keyboard visualization
      if (onKeyTrack) {
        onKeyTrack(key, isCorrect);
      }
    }
  }, [userInput, currentIndex, testText, isActive, startTime, isCompleted, errors, extraChars, isPaused]);

  const pause = useCallback(() => {
    if (isActive && !isPaused) {
      setIsPaused(true);
      setPausedTime(Date.now());
    }
  }, [isActive, isPaused]);

  const resume = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      // Adjust start time to account for paused duration
      if (startTime && pausedTime) {
        const pauseDuration = Date.now() - pausedTime;
        setStartTime(prev => prev ? prev + pauseDuration : Date.now());
      }
      setPausedTime(0);
    }
  }, [isPaused, startTime, pausedTime]);

  const handleComplete = useCallback(() => {
    setIsCompleted(true);
    setIsActive(false);
    setIsPaused(false);
    
    // Save result to localStorage
    const result: TestResult = {
      stats,
      config,
      timestamp: new Date().toISOString(),
      textUsed: testText
    };
    
    const savedResults = JSON.parse(localStorage.getItem('typingResults') || '[]');
    savedResults.push(result);
    localStorage.setItem('typingResults', JSON.stringify(savedResults));
    
    // Update personal best if needed
    const personalBests = JSON.parse(localStorage.getItem('personalBests') || '[]');
    const existingBest = personalBests.find((pb: PersonalBest) => 
      pb.testConfig.mode === config.mode && 
      pb.testConfig.timeLimit === config.timeLimit &&
      pb.testConfig.wordLimit === config.wordLimit
    );
    
    if (!existingBest || stats.wpm > existingBest.wpm) {
      const newBest: PersonalBest = {
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        date: new Date().toISOString(),
        testConfig: config
      };
      
      if (existingBest) {
        const index = personalBests.indexOf(existingBest);
        personalBests[index] = newBest;
      } else {
        personalBests.push(newBest);
      }
      
      localStorage.setItem('personalBests', JSON.stringify(personalBests));
    }
  }, [stats, config, testText]);

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setUserInput('');
    setIsActive(false);
    setIsPaused(false);
    setIsCompleted(false);
    setStartTime(null);
    setElapsedTime(0);
    setPausedTime(0);
    setErrors([]);
    setExtraChars([]);
  }, []);

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return {
    stats,
    characterStates,
    isActive,
    isPaused,
    isCompleted,
    currentIndex,
    userInput,
    elapsedTime,
    handleKeyPress,
    pause,
    resume,
    restart,
    focusInput,
    inputRef
  };
}