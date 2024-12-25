import { createContext, useContext, useState, ReactNode } from "react";

interface GameContextType {
  gameState: "welcome" | "select" | "play";
  setGameState: (state: "welcome" | "select" | "play") => void;
  selectedCharacter: string | null;
  setSelectedCharacter: (character: string | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<"welcome" | "select" | "play">("welcome");
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        selectedCharacter,
        setSelectedCharacter,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}