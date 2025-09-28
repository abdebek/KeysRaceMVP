import React, { useEffect } from 'react';
import { TextDisplay } from '../TextDisplay';
import { StatsDisplay } from '../StatsDisplay';
import { VirtualKeyboard } from '../VirtualKeyboard';
import { TestConfig } from '../../types';

interface RaceInterfaceProps {
  stats: any;
  characterStates: any[];
  currentIndex: number;
  elapsedTime: number;
  isActive: boolean;
  isCompleted: boolean;
  pressedKeys: Set<string>;
  lastPressedKey: string | null;
  keyAccuracy: Record<string, { correct: number; total: number }>;
  focusInput: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  config: TestConfig;
}

export function RaceInterface({
  stats,
  characterStates,
  currentIndex,
  elapsedTime,
  isActive,
  isCompleted,
  pressedKeys,
  lastPressedKey,
  keyAccuracy,
  focusInput,
  inputRef,
  config
}: RaceInterfaceProps) {
  // Auto-focus input when component mounts
  useEffect(() => {
    setTimeout(() => focusInput(), 100);
  }, [focusInput]);

  return (
    <div className="space-y-4">
      {/* Stats Display */}
      <StatsDisplay 
        stats={stats} 
        config={config} 
        elapsedTime={elapsedTime} 
        isActive={isActive} 
      />

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
    </div>
  );
}