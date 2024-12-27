import { useState } from 'react';
import { Button } from './ui/button';
import { FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../styles/investigator.css';

interface InvestigatorSelectProps {
  onSelect: (investigator: string) => void;
}

export default function InvestigatorSelect({ onSelect }: InvestigatorSelectProps) {
  const [selectedInvestigator, setSelectedInvestigator] = useState<string | null>(null);

  const investigators = {
    yuval: {
      name: "Yuval",
      age: 16,
      description: "A sharp-minded young detective with a keen eye for detail and a passion for solving mysteries.",
      gender: "male",
      avatar: "👦"
    },
    romi: {
      name: "Romi",
      age: 16,
      description: "A brilliant teenage investigator known for her analytical thinking and intuitive understanding of human behavior.",
      gender: "female",
      avatar: "👧"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Choose Your Investigator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {Object.entries(investigators).map(([id, investigator]) => (
          <motion.div
            key={id}
            className={`
              relative p-6 rounded-lg backdrop-blur-sm transition-all duration-300
              ${selectedInvestigator === id 
                ? 'bg-purple-600/30 ring-2 ring-purple-500 shadow-lg shadow-purple-500/20' 
                : 'bg-slate-800/30 hover:bg-slate-700/30'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedInvestigator(id)}
          >
            <div className="flex flex-col items-center gap-4">
              {/* Floating Avatar */}
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Glowing background effect */}
                  <div className="absolute w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                  
                  {/* Floating particles */}
                  <div className="absolute w-full h-full">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="particle"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          animation: `float-particle ${2 + Math.random() * 2}s infinite ease-in-out ${Math.random() * 2}s`
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Main avatar */}
                  <div 
                    className="text-7xl animate-float filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                    style={{
                      transform: selectedInvestigator === id ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.3s ease-in-out'
                    }}
                  >
                    {investigator.avatar}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-1">{investigator.name}</h2>
                <p className="text-sm text-purple-200/70 mb-2">Age: {investigator.age}</p>
                <p className="text-sm text-purple-100/90">{investigator.description}</p>
              </div>

              {selectedInvestigator === id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2"
                >
                  <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm shadow-lg">
                    Selected
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={() => selectedInvestigator && onSelect(selectedInvestigator)}
        disabled={!selectedInvestigator}
        className={`
          mt-8 px-8 py-4 text-lg flex items-center gap-2 transition-all duration-300
          ${!selectedInvestigator 
            ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20'
          }
        `}
      >
        Begin Investigation
        <FaArrowRight />
      </Button>
    </div>
  );
} 