import React, { createContext, useContext, useState, useEffect } from 'react';

interface Clue {
  id: string;
  text: string;
  source: string;
  timestamp: Date;
  isKey: boolean;
}

type GamePhase = 'intro' | 'investigator-select' | 'investigation' | 'resolution';

interface GameContextType {
  gamePhase: GamePhase;
  setGamePhase: (phase: GamePhase) => void;
  clues: Clue[];
  addClue: (clue: Omit<Clue, 'id' | 'timestamp'>) => void;
  startTime: Date;
  elapsedTime: number;
  hasWon: boolean;
  setHasWon: (won: boolean) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const [clues, setClues] = useState<Clue[]>([]);
  const [startTime] = useState<Date>(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasWon, setHasWon] = useState(false);

  // Update elapsed time every second
  useEffect(() => {
    if (gamePhase !== 'intro' && !hasWon) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gamePhase, startTime, hasWon]);

  const addClue = (clue: Omit<Clue, 'id' | 'timestamp'>) => {
    const newClue: Clue = {
      ...clue,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    setClues(prev => {
      // Check if clue already exists to avoid duplicates
      if (prev.some(c => c.text === newClue.text)) {
        return prev;
      }
      return [...prev, newClue];
    });
  };

  const resetGame = () => {
    setGamePhase('intro');
    setClues([]);
    setHasWon(false);
  };

  return (
    <GameContext.Provider
      value={{
        gamePhase,
        setGamePhase,
        clues,
        addClue,
        startTime,
        elapsedTime,
        hasWon,
        setHasWon,
        resetGame
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}