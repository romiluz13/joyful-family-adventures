import React from 'react';
import { motion } from "framer-motion";
import { FaUserSecret } from 'react-icons/fa';
import { characterProfiles } from '@/lib/openai';

interface CharacterCardProps {
  name: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function CharacterCard({ name, isSelected, onSelect }: CharacterCardProps) {
  const profile = characterProfiles[name];
  const colors = {
    Rachel: 'from-game-pink to-game-purple',
    Rom: 'from-game-blue to-game-teal',
    Ilan: 'from-game-green to-game-blue',
    Michal: 'from-game-yellow to-game-pink',
    Neta: 'from-game-purple to-game-green'
  };

  // Concise character summaries
  const summaries = {
    Rachel: "Grandmother with chatty dogs",
    Rom: "Tech-obsessed uncle",
    Ilan: "Observant grandfather",
    Michal: "Busy mother",
    Neta: "Pregnant, often awake at night"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={{
        borderColor: isSelected ? 'rgb(var(--primary))' : 'transparent',
      }}
      className={`
        relative overflow-hidden rounded-lg cursor-pointer
        ${isSelected ? 'ring-2 ring-primary' : ''}
      `}
      onClick={onSelect}
    >
      <div className={`
        absolute inset-0 bg-gradient-to-br ${colors[name]}
        opacity-20 transition-opacity duration-300
        ${isSelected ? 'opacity-30' : 'opacity-10'}
      `} />

      <div className="relative p-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <FaUserSecret className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-base">{name}</h3>
            <p className="text-xs text-muted-foreground">{summaries[name]}</p>
          </div>
        </div>

        {isSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: 1,
              height: 'auto'
            }}
            transition={{ duration: 0.2 }}
            className="text-xs text-muted-foreground pt-2 border-t"
          >
            {profile.role}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}