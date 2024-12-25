import { motion } from "framer-motion";
import CharacterCard from "./CharacterCard";

interface CharacterSelectProps {
  onSelectCharacter: (character: string) => void;
}

const characters = [
  {
    name: "Rachel",
    description: "The loving grandmother with amazing cooking skills",
    color: "bg-game-pink",
  },
  {
    name: "Rom",
    description: "The handy uncle who can fix anything",
    color: "bg-game-blue",
  },
  {
    name: "Ilan",
    description: "The wise grandfather full of interesting stories",
    color: "bg-game-yellow",
  },
  {
    name: "Omri",
    description: "The adventurous father who makes every moment fun",
    color: "bg-game-green",
  },
  {
    name: "Michal",
    description: "The creative mother who makes everyday special",
    color: "bg-game-purple",
  },
  {
    name: "Neta",
    description: "Rom's wife, soon to be a mother, bringing joy and new beginnings",
    color: "bg-game-teal",
  },
];

const CharacterSelect = ({ onSelectCharacter }: CharacterSelectProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-game-green via-game-blue to-game-pink p-8">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-white text-center"
      >
        Choose a Family Member
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {characters.map((character, index) => (
          <motion.div
            key={character.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
          >
            <CharacterCard
              {...character}
              onClick={() => onSelectCharacter(character.name)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelect;