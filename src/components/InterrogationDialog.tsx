import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "./ui/button";
import { gameRules } from "@/types/GameRules";

interface InterrogationDialogProps {
  character: string;
  onClueDiscovered: (clueId: string) => void;
  remainingQuestions: number;
  onQuestionAsked: () => void;
}

const InterrogationDialog = ({
  character,
  onClueDiscovered,
  remainingQuestions,
  onQuestionAsked,
}: InterrogationDialogProps) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());

  const characterProfile = gameRules.suspects.find(s => s.name === character);
  const availableQuestions = [
    ...gameRules.interrogation.standardQuestions,
    ...(gameRules.interrogation.characterSpecificQuestions[character] || [])
  ].filter(q => !askedQuestions.has(q));

  const handleAskQuestion = async (question: string) => {
    setSelectedQuestion(question);
    onQuestionAsked();
    
    // Simulate response and clue discovery
    const relatedClues = Object.entries(gameRules.clues)
      .filter(([_, clue]) => 
        clue.revealedBy === character || 
        clue.relatedTo.includes(character)
      )
      .map(([id]) => id);

    if (relatedClues.length > 0 && Math.random() > 0.5) {
      const randomClue = relatedClues[Math.floor(Math.random() * relatedClues.length)];
      onClueDiscovered(randomClue);
    }

    setAskedQuestions(prev => new Set([...prev, question]));
    
    // Simulate character response
    setResponse(characterProfile?.introLine || "I have nothing to say about that.");
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Questioning {character}</h2>
          <span className="text-gray-600">
            Questions remaining: {remainingQuestions}
          </span>
        </div>

        <div className="min-h-[200px] bg-gray-50 rounded-lg p-4 mb-6">
          <AnimatePresence mode="wait">
            {response ? (
              <motion.div
                key="response"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-gray-700 font-medium mb-2">
                      You asked: {selectedQuestion}
                    </p>
                    <p className="text-gray-600">{response}</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setResponse(null);
                    setSelectedQuestion(null);
                  }}
                >
                  Ask Another Question
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="questions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                {availableQuestions.map((question, index) => (
                  <motion.button
                    key={question}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: { delay: index * 0.1 }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAskQuestion(question)}
                    disabled={remainingQuestions <= 0}
                    className="w-full text-left p-3 rounded-lg border-2 border-gray-200 hover:border-game-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {question}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {remainingQuestions <= 0 && (
          <p className="text-red-600 text-center mb-4">
            No more questions available for this session.
          </p>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => window.history.back()}>
            End Interrogation
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InterrogationDialog; 