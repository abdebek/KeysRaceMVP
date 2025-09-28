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
  const [lastKeyPressTime, setLastKeyPressTime] = useState<number>(0);
  
  const intervalRef = useRef<number>();
  const inputRef = useRef<HTMLInputElement>(null);
  const statsRef = useRef<TypingStats>({
    wpm: 0,
    accuracy: 100,
    correctChars: 0,
    incorrectChars: 0,
    totalChars: 0,
    elapsedTime: 0
  });

  // Calculate statistics
  const stats: TypingStats = {
    wpm: elapsedTime > 0 ? Math.round((userInput.length / 5) / (elapsedTime / 60)) : 0,
    accuracy: userInput.length > 0 ? Math.round(((userInput.length - errors.length) / userInput.length) * 100) : 100,
    correctChars: userInput.length - errors.length,
    incorrectChars: errors.length,
    totalChars: userInput.length,
    elapsedTime
  };

  // Update stats ref for access in callbacks without triggering re-renders
  useEffect(() => {
    statsRef.current = stats;
  }, [stats.wpm, stats.accuracy, stats.correctChars, stats.incorrectChars, stats.totalChars, stats.elapsedTime]);

  // Generate character states for display - memoized to reduce re-renders
  const characterStates = useRef<CharacterState[]>([]);
  
  useEffect(() => {
    // Only regenerate character states when necessary
    characterStates.current = testText.split('').map((char, index) => ({
      char,
      status: index < userInput.length 
        ? (userInput[index] === char ? 'correct' : 'incorrect')
        : 'pending',
      isCurrentPosition: index === currentIndex
    }));
    
    // Add extra characters if user typed beyond the text
    if (extraChars.length > 0) {
      extraChars.forEach(char => {
        characterStates.current.push({
          char,
          status: 'extra',
          isCurrentPosition: false
        });
      });
    }
  }, [testText, userInput, currentIndex, extraChars]);

  // Timer effect with improved time tracking
  useEffect(() => {
    if (isActive && !isCompleted && !isPaused) {
      // Update immediately for responsive UI
      if (startTime) {
        setElapsedTime((Date.now() - startTime) / 1000);
      }
      
      intervalRef.current = window.setInterval(() => {
        if (startTime) {
          setElapsedTime((Date.now() - startTime) / 1000);
        }
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
  }, [isActive, isCompleted, isPaused, startTime]);

  // Check for completion
  useEffect(() => {
    if (config.mode === 'time' && elapsedTime >= config.timeLimit) {
      handleComplete();
    } else if (config.mode === 'words' && userInput.length >= testText.length) {
      handleComplete();
    }
  }, [elapsedTime, userInput.length, config, testText.length]);

  // Detect if input is stuck (no key press for 5 seconds while active)
  useEffect(() => {
    if (isActive && !isPaused && !isCompleted) {
      const stuckInputTimer = setTimeout(() => {
        const timeSinceLastKeyPress = Date.now() - lastKeyPressTime;
        if (timeSinceLastKeyPress > 5000 && lastKeyPressTime > 0) {
          // Input might be stuck, try to refocus
          focusInput();
        }
      }, 5000);
      
      return () => clearTimeout(stuckInputTimer);
    }
  }, [isActive, isPaused, isCompleted, lastKeyPressTime]);

  const handleKeyPress = useCallback((key: string, onKeyTrack?: (key: string, isCorrect: boolean) => void) => {
    if (isCompleted) return;

    // Update last key press time to detect stuck input
    setLastKeyPressTime(Date.now());

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
      
      // Ensure input is focused when resuming
      setTimeout(() => focusInput(), 100);
    }
  }, [isPaused, startTime, pausedTime]);

  const handleComplete = useCallback(() => {
    setIsCompleted(true);
    setIsActive(false);
    setIsPaused(false);
    
    // Save result to localStorage
    const result: TestResult = {
      stats: statsRef.current,
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
    
    if (!existingBest || statsRef.current.wpm > existingBest.wpm) {
      const newBest: PersonalBest = {
        wpm: statsRef.current.wpm,
        accuracy: statsRef.current.accuracy,
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
  }, [config, testText]);

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
    setLastKeyPressTime(0);
  }, []);

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      
      // On mobile, this helps ensure the keyboard appears
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        inputRef.current.click();
        inputRef.current.focus();
      }
    }
  }, []);

  return {
    stats,
    characterStates: characterStates.current,
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