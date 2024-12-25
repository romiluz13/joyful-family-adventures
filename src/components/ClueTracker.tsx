import { motion, AnimatePresence } from "framer-motion";
import { gameRules } from "@/types/GameRules";
import { useState } from "react";

interface ClueTrackerProps {
  discoveredClues: Set<string>;
}

const ClueTracker = ({ discoveredClues }: ClueTrackerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const discoveredCluesList = Array.from(discoveredClues).map(clueId => ({
    id: clueId,
    ...gameRules.clues[clueId]
  }));

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed right-4 top-4 bg-white rounded-lg shadow-xl"
    >
      <div
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-bold text-lg">
          Clues ({discoveredClues.size})
        </h3>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="ml-2"
        >
          ▼
        </motion.span>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t">
              {discoveredCluesList.length === 0 ? (
                <p className="text-gray-500 italic">No clues discovered yet...</p>
              ) : (
                <ul className="space-y-3">
                  {discoveredCluesList.map(clue => (
                    <motion.li
                      key={clue.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-50 p-3 rounded"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold capitalize">
                            {clue.id.replace(/_/g, " ")}
                            {clue.isKey && (
                              <span className="ml-2 text-xs bg-yellow-200 px-2 py-1 rounded">
                                Key Evidence
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {clue.description}
                          </p>
                          <div className="mt-2 text-xs text-gray-500">
                            <span>Revealed by: {clue.revealedBy}</span>
                            <span className="mx-2">•</span>
                            <span>Related to: {clue.relatedTo.join(", ")}</span>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
              
              {discoveredCluesList.length >= gameRules.accusation.requiredClues && (
                <div className="mt-4 p-3 bg-green-50 rounded text-sm text-green-700">
                  You have enough clues to make an accusation!
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClueTracker; 