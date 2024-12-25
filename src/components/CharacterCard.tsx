import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CharacterCardProps {
  name: string;
  description: string;
  color: string;
  onClick: () => void;
}

const CharacterCard = ({ name, description, color, onClick }: CharacterCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "p-6 rounded-lg shadow-lg cursor-pointer",
        color,
        "text-white hover:shadow-xl transition-shadow"
      )}
      onClick={onClick}
    >
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <p className="text-white/90">{description}</p>
    </motion.div>
  );
};

export default CharacterCard;