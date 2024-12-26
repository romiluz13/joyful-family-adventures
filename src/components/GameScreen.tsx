import { useState, useEffect } from 'react';
import { getCharacterResponse, checkAccusation } from '@/lib/openai';
import { CharacterCard } from './CharacterCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import type { CreateTypes } from 'canvas-confetti';

// Import confetti dynamically to avoid SSR issues
let confetti: CreateTypes | null = null;
if (typeof window !== 'undefined') {
  import('canvas-confetti').then((module) => {
    confetti = module.default;
  });
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function GameScreen() {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<Record<string, string[]>>({});
  const [accusationOpen, setAccusationOpen] = useState(false);
  const [accusedCharacter, setAccusedCharacter] = useState<string>('');
  const [gameStartTime] = useState<number>(Date.now());
  const [gameEnded, setGameEnded] = useState(false);
  const [endGameMessage, setEndGameMessage] = useState('');

  const characters = ['Rachel', 'Rom', 'Ilan', 'Michal', 'Neta'];

  useEffect(() => {
    if (selectedCharacter && messages.length === 0) {
      handleSendMessage('Hello, can you tell me about yourself?');
    }
  }, [selectedCharacter]);

  const handleCharacterSelect = (character: string) => {
    setSelectedCharacter(character);
    setMessages([]);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedCharacter) return;

    setIsLoading(true);
    const userMessage: Message = { role: 'user', content, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      const response = await getCharacterResponse(
        selectedCharacter,
        content,
        messages
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Extract important information for notes
      const cleanedResponse = response.toLowerCase().trim();
      if (cleanedResponse.includes('saw') || 
          cleanedResponse.includes('heard') || 
          cleanedResponse.includes('found') ||
          cleanedResponse.includes('noticed')) {
        const normalizedNote = response.trim();
        setNotes(prev => {
          const characterNotes = prev[selectedCharacter] || [];
          if (!characterNotes.some(note => 
            note.toLowerCase().includes(normalizedNote.toLowerCase())
          )) {
            return {
              ...prev,
              [selectedCharacter]: [...characterNotes, normalizedNote]
            };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error getting response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      handleSendMessage(inputValue.trim());
    }
  };

  const handleMakeAccusation = () => {
    setAccusationOpen(true);
  };

  const handleAccusationSubmit = () => {
    if (!accusedCharacter) return;

    const result = checkAccusation(accusedCharacter);
    const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    
    const timeMessage = `\nTime taken: ${minutes} minutes and ${seconds} seconds.`;
    
    if (result.correct && confetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    setEndGameMessage(result.explanation + timeMessage);
    setGameEnded(true);
    setAccusationOpen(false);
  };

  const resetGame = () => {
    window.location.reload();
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Character Selection Panel */}
      <div className="w-full md:w-64 p-4 border-r">
        <h2 className="text-lg font-bold mb-4">Suspects</h2>
        <div className="space-y-2">
          {characters.map(character => (
            <CharacterCard
              key={character}
              name={character}
              isSelected={selectedCharacter === character}
              onSelect={() => handleCharacterSelect(character)}
            />
          ))}
        </div>
        
        {/* Notes Section */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">Notes</h3>
          <ScrollArea className="h-48 rounded-md border p-2">
            {Object.entries(notes).map(([character, characterNotes]) => (
              <div key={character} className="mb-2">
                <h4 className="text-xs font-bold">{character}</h4>
                {characterNotes.map((note, index) => (
                  <p key={index} className="text-xs text-muted-foreground ml-2">
                    • {note}
                  </p>
                ))}
              </div>
            ))}
          </ScrollArea>
        </div>

        <Button 
          className="w-full mt-4" 
          onClick={handleMakeAccusation}
          disabled={gameEnded}
        >
          Make Accusation
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.timestamp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mb-4 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>

        <form onSubmit={handleInputSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={
                selectedCharacter
                  ? "Type your message..."
                  : "Select a character to start..."
              }
              disabled={!selectedCharacter || isLoading || gameEnded}
            />
            <Button type="submit" disabled={!selectedCharacter || isLoading || gameEnded}>
              Send
            </Button>
          </div>
        </form>
      </div>

      {/* Accusation Dialog */}
      <Dialog open={accusationOpen} onOpenChange={setAccusationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Your Accusation</DialogTitle>
            <DialogDescription>
              Who do you think killed Omri?
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={accusedCharacter} onValueChange={setAccusedCharacter}>
            {characters.map(character => (
              <div key={character} className="flex items-center space-x-2">
                <RadioGroupItem value={character} id={character} />
                <Label htmlFor={character}>{character}</Label>
              </div>
            ))}
          </RadioGroup>
          <Button onClick={handleAccusationSubmit} disabled={!accusedCharacter}>
            Submit Accusation
          </Button>
        </DialogContent>
      </Dialog>

      {/* End Game Dialog */}
      <Dialog open={gameEnded} onOpenChange={setGameEnded}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Over</DialogTitle>
            <DialogDescription>
              {endGameMessage}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={resetGame}>
            Play Again
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
} 