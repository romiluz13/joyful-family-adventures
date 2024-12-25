import React from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { IntroScreen } from './components/IntroScreen';
import GameScreen from './components/GameScreen';
import { Toaster } from 'sonner';

function GameContainer() {
  const { gamePhase, setGamePhase } = useGame();

  const handleStartGame = () => {
    setGamePhase('investigation');
  };

  return (
    <>
      {gamePhase === 'intro' ? (
        <IntroScreen onStartGame={handleStartGame} />
      ) : (
        <GameScreen />
      )}
    </>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContainer />
      <Toaster position="top-center" />
    </GameProvider>
  );
}

export default App;
