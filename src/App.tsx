import { useState } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { IntroScreen } from './components/IntroScreen';
import GameScreen from './components/GameScreen';
import InvestigatorSelect from './components/InvestigatorSelect';
import { Toaster } from 'sonner';

function GameContainer() {
  const { gamePhase, setGamePhase } = useGame();
  const [selectedInvestigator, setSelectedInvestigator] = useState<string | null>(null);

  const handleStartGame = () => {
    setGamePhase('investigator-select');
  };

  const handleSelectInvestigator = (investigator: string) => {
    setSelectedInvestigator(investigator);
    setGamePhase('investigation');
  };

  return (
    <>
      {gamePhase === 'intro' && (
        <IntroScreen onStartGame={handleStartGame} />
      )}
      {gamePhase === 'investigator-select' && (
        <InvestigatorSelect onSelect={handleSelectInvestigator} />
      )}
      {gamePhase === 'investigation' && (
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
