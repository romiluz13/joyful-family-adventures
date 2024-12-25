import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-game-blue via-game-pink to-game-yellow">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-6xl font-bold text-white text-center"
      >
        Family Game
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-xl text-white/90 text-center max-w-md"
      >
        Join the fun and interact with your favorite family members!
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Button
          onClick={onStart}
          className="text-lg px-8 py-6 bg-white text-game-blue hover:bg-white/90"
        >
          Start Game
        </Button>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;