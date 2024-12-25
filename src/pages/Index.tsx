import { GameProvider } from "@/contexts/GameContext";
import { useGame } from "@/contexts/GameContext";
import WelcomeScreen from "@/components/WelcomeScreen";
import CharacterSelect from "@/components/CharacterSelect";
import GameScreen from "@/components/GameScreen";
import { useToast } from "@/components/ui/use-toast";

const GameContent = () => {
  const { gameState, setGameState, setSelectedCharacter } = useGame();
  const { toast } = useToast();

  const handleStart = () => {
    setGameState("select");
  };

  const handleSelectCharacter = (character: string) => {
    setSelectedCharacter(character);
    toast({
      title: "Character Selected!",
      description: `You chose to interact with ${character}!`,
    });
    setGameState("play");
  };

  if (gameState === "welcome") {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (gameState === "select") {
    return <CharacterSelect onSelectCharacter={handleSelectCharacter} />;
  }

  if (gameState === "play") {
    return <GameScreen />;
  }

  return null;
};

const Index = () => {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
};

export default Index;