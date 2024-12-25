import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "./ui/button";
import { gameRules } from "@/types/GameRules";
import { useGame } from "@/contexts/GameContext";

interface AccusationScreenProps {
  discoveredClues: Set<string>;
  onAccuse: (suspect: string) => void;
  attempts: number;
}

const AccusationScreen = ({ discoveredClues, onAccuse, attempts }: AccusationScreenProps) => {
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { setGameState } = useGame();

  const hasEnoughClues = discoveredClues.size >= gameRules.accusation.requiredClues;

  const handleAccusation = () => {
    if (selectedSuspect) {
      onAccuse(selectedSuspect);
      setShowConfirmation(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
      >
        <h2 className="text-2xl font-bold mb-4">Make Your Accusation</h2>
        
        {!hasEnoughClues ? (
          <div className="text-center p-6">
            <p className="text-red-600 mb-4">
              You need at least {gameRules.accusation.requiredClues} clues to make an accusation.
              Currently have: {discoveredClues.size}
            </p>
            <Button onClick={() => setGameState("play")}>
              Continue Investigation
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-6 text-gray-600">
              Choose carefully! You have {attempts} attempts remaining.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {gameRules.suspects.map(suspect => (
                <motion.button
                  key={suspect.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSuspect(suspect.name)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedSuspect === suspect.name
                      ? "border-game-blue bg-game-blue/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <h3 className="font-bold mb-2">{suspect.name}</h3>
                  <p className="text-sm text-gray-600">{suspect.introLine}</p>
                </motion.button>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setGameState("play")}
              >
                Cancel
              </Button>
              <Button
                disabled={!selectedSuspect}
                onClick={() => setShowConfirmation(true)}
              >
                Make Accusation
              </Button>
            </div>

            {showConfirmation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-xl font-bold mb-4">Confirm Accusation</h3>
                  <p className="mb-6">
                    Are you sure you want to accuse {selectedSuspect}? 
                    This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmation(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleAccusation}
                    >
                      Confirm Accusation
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AccusationScreen; 