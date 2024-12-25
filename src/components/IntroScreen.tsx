import React from 'react';
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { gameState } from '@/lib/openai';

interface IntroScreenProps {
  onStartGame: () => void;
}

export function IntroScreen({ onStartGame }: IntroScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-game-blue via-game-pink to-game-yellow flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-8 text-center space-y-6"
      >
        <motion.h1 
          className="text-4xl font-bold mb-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          Who Killed {gameState.victimName}?
        </motion.h1>

        <motion.p 
          className="text-lg text-gray-700 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {gameState.victimName} has been found murdered in the {gameState.murderLocation} during the {gameState.timeOfMurder}. 
          As the family's trusted detective, it's up to you to uncover the truth by interrogating the suspects.
        </motion.p>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p className="text-gray-600 italic">
            Can you piece together the clues and find the murderer?
          </p>

          <div className="flex flex-col space-y-2">
            <p className="text-sm text-gray-500">Game Features:</p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Interrogate five family members</li>
              <li>Gather and analyze clues</li>
              <li>Make careful observations</li>
              <li>Solve the mystery before time runs out</li>
            </ul>
          </div>

          <Button 
            onClick={onStartGame}
            size="lg"
            className="w-full mt-6"
          >
            Start Investigation
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
} 