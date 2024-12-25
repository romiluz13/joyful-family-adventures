import { cn } from "@/lib/utils";

interface CharacterCardProps {
  name: string;
  description: string;
  color: string;
  onClick: () => void;
}

const CharacterCard = ({ name, description, color, onClick }: CharacterCardProps) => {
  return (
    <div
      className={cn(
        "p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:scale-105",
        "flex flex-col items-center justify-center text-center gap-4",
        "w-64 h-80",
        color
      )}
      onClick={onClick}
    >
      <div className="w-32 h-32 rounded-full bg-white/20 animate-float" />
      <h3 className="text-2xl font-bold text-white">{name}</h3>
      <p className="text-white/90">{description}</p>
    </div>
  );
};

export default CharacterCard;