import { GameProvider } from "@/contexts/GameContext";
import { useGame } from "@/contexts/GameContext";
import WelcomeScreen from "@/components/WelcomeScreen";
import CharacterSelect from "@/components/CharacterSelect";
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
    // For now, we'll just show a toast. Later we can transition to the game screen
    // setGameState("play");
  };

  if (gameState === "welcome") {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (gameState === "select") {
    return <CharacterSelect onSelectCharacter={handleSelectCharacter} />;
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