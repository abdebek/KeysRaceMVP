export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  elapsedTime: number;
}

export interface TestConfig {
  mode: 'time' | 'words';
  timeLimit: number; // in seconds
  wordLimit: number;
  textCategory: 'quotes' | 'programming' | 'literature' | 'news' | 'custom';
}

export interface CharacterState {
  char: string;
  status: 'pending' | 'correct' | 'incorrect' | 'extra';
  isCurrentPosition: boolean;
}

export interface PersonalBest {
  wpm: number;
  accuracy: number;
  date: string;
  testConfig: TestConfig;
}

export interface KeyboardHeatmap {
  [key: string]: {
    correct: number;
    incorrect: number;
  };
}

export interface TestResult {
  stats: TypingStats;
  config: TestConfig;
  timestamp: string;
  textUsed: string;
}