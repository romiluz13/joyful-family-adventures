import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { useGame } from "@/contexts/GameContext";
import { gameRules } from "@/types/GameRules";

const IntroductionScreen = () => {
  const { setGameState } = useGame();

  return (
    <div className="min-h-screen bg-gradient-to-br from-game-green via-game-blue to-game-pink p-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl bg-white rounded-lg shadow-xl p-8 text-center"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold mb-4 text-gray-800"
        >
          {gameRules.introduction.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg text-gray-600 mb-8"
        >
          {gameRules.introduction.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            onClick={() => setGameState("select")}
            className="bg-game-blue hover:bg-game-blue/90 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            {gameRules.introduction.startButtonText}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default IntroductionScreen; 