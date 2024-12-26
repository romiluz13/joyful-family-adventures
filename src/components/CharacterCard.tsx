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

      <div className="relative p-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FaUserSecret className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground">{profile.role}</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isSelected ? 1 : 0,
            height: isSelected ? 'auto' : 0
          }}
          transition={{ duration: 0.2 }}
          className="space-y-2 overflow-hidden"
        >
          <p className="text-sm italic">{profile.personality}</p>
          <div className="text-xs space-y-1">
            {profile.quirks.map((quirk, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span>{quirk}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}