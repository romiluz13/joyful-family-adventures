import React from 'react';
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { gameState } from '@/lib/openai';
import { FaUserSecret, FaSearch, FaComments, FaExclamationTriangle } from 'react-icons/fa';

interface IntroScreenProps {
  onStartGame: () => void;
}

export function IntroScreen({ onStartGame }: IntroScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto bg-slate-800/90 backdrop-blur-lg rounded-lg shadow-2xl p-8 text-slate-100"
      >
        <motion.h1 
          className="text-5xl font-bold mb-6 text-center bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          Who Killed Omri?
        </motion.h1>

        <motion.p 
          className="text-xl text-slate-300 mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          A family gathering turned tragic when Omri was found dead in the {gameState?.location} during {gameState?.timeOfDeath}. 
          As the family's trusted detective, you must uncover the dark truth hidden beneath the surface of this close-knit family.
        </motion.p>

        <motion.div
          className="grid md:grid-cols-2 gap-8 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center text-purple-400">
              <FaSearch className="mr-2" />
              Investigation Features
            </h2>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center">
                <span className="text-purple-400 mr-2">•</span>
                Group interrogation system
              </li>
              <li className="flex items-center">
                <span className="text-purple-400 mr-2">•</span>
                Dynamic character interactions
              </li>
              <li className="flex items-center">
                <span className="text-purple-400 mr-2">•</span>
                Real-time note-taking system
              </li>
              <li className="flex items-center">
                <span className="text-purple-400 mr-2">•</span>
                Timeline-based evidence gathering
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center text-purple-400">
              <FaUserSecret className="mr-2" />
              Key Suspects
            </h2>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center">
                <span className="text-purple-400 mr-2">•</span>
                Rachel - The sharp-witted grandmother
              </li>
              <li className="flex items-center">
                <span className="text-purple-400 mr-2">•</span>
                Rom - The ambitious uncle
              </li>
              <li className="flex items-center">
                <span className="text-purple-400 mr-2">•</span>
                Ilan - The observant grandfather
              </li>
              <li className="flex items-center">
                <span className="text-purple-400 mr-2">•</span>
                Michal - The caring mother
              </li>
              <li className="flex items-center">
                <span className="text-purple-400 mr-2">•</span>
                Neta - The pregnant aunt
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          className="bg-slate-700/50 rounded-lg p-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <h2 className="text-xl font-semibold flex items-center text-yellow-400 mb-3">
            <FaExclamationTriangle className="mr-2" />
            Detective's Note
          </h2>
          <p className="text-slate-300 italic">
            "Each suspect has their own story, their own secrets. Watch their reactions carefully, 
            compare their statements, and remember - in this family, nothing is quite as it seems. 
            You have three chances to identify the killer. Choose wisely."
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex flex-col items-center"
        >
          <Button 
            onClick={onStartGame}
            size="lg"
            className="w-full max-w-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-6"
          >
            <FaComments className="mr-2" />
            Begin Investigation
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
} 