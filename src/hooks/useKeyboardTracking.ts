import { useState, useCallback, useRef } from 'react';

interface KeyAccuracy {
  correct: number;
  total: number;
}

interface TypingEffect {
  id: string;
  type: 'correct' | 'incorrect' | 'combo';
  x: number;
  y: number;
  value?: string | number;
}

export function useKeyboardTracking() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null);
  const [keyAccuracy, setKeyAccuracy] = useState<Record<string, KeyAccuracy>>({});
  const [typingEffects, setTypingEffects] = useState<TypingEffect[]>([]);
  const [correctStreak, setCorrectStreak] = useState(0);
  
  const effectIdRef = useRef(0);

  const addTypingEffect = useCallback((type: TypingEffect['type'], value?: string | number) => {
    const rect = document.querySelector('.text-display')?.getBoundingClientRect();
    if (!rect) return;

    const effect: TypingEffect = {
      id: `effect-${effectIdRef.current++}`,
      type,
      x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 100,
      y: rect.top + rect.height / 2,
      value
    };

    setTypingEffects(prev => [...prev, effect]);

    // Remove effect after animation
    setTimeout(() => {
      setTypingEffects(prev => prev.filter(e => e.id !== effect.id));
    }, 800);
  }, []);

  const trackKeyPress = useCallback((key: string, isCorrect: boolean) => {
    const normalizedKey = key.toLowerCase();
    
    // Update pressed keys
    setPressedKeys(prev => new Set([...prev, normalizedKey]));
    setLastPressedKey(normalizedKey);
    
    // Clear pressed key after animation
    setTimeout(() => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(normalizedKey);
        return newSet;
      });
    }, 150);

    // Update key accuracy
    setKeyAccuracy(prev => ({
      ...prev,
      [normalizedKey]: {
        correct: (prev[normalizedKey]?.correct || 0) + (isCorrect ? 1 : 0),
        total: (prev[normalizedKey]?.total || 0) + 1
      }
    }));

    // Handle effects and streaks
    if (isCorrect) {
      setCorrectStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > 0 && newStreak % 10 === 0) {
          addTypingEffect('combo', newStreak);
        } else {
          addTypingEffect('correct');
        }
        return newStreak;
      });
    } else {
      setCorrectStreak(0);
      addTypingEffect('incorrect');
    }
  }, [addTypingEffect]);

  const resetTracking = useCallback(() => {
    setPressedKeys(new Set());
    setLastPressedKey(null);
    setKeyAccuracy({});
    setTypingEffects([]);
    setCorrectStreak(0);
  }, []);

  return {
    pressedKeys,
    lastPressedKey,
    keyAccuracy,
    typingEffects,
    correctStreak,
    trackKeyPress,
    resetTracking
  };
}