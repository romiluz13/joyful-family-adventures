import { useState, useEffect } from 'react';
import { getCharacterResponse, checkAccusation, GAME_TITLE, GAME_INTRO } from '@/lib/openai';
import { CharacterCard } from './CharacterCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from './ui/alert';
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
  const [guessesLeft, setGuessesLeft] = useState(3);
  const [lastGuessResult, setLastGuessResult] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);

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

  const extractImportantInfo = (text: string): string | null => {
    const match = text.match(/\*(.*?)\*/);
    return match ? match[1].trim() : null;
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
      
      // Extract important information (marked with asterisks)
      const importantInfo = extractImportantInfo(response);
      if (importantInfo) {
        setNotes(prev => {
          const characterNotes = prev[selectedCharacter] || [];
          // Normalize text for comparison
          const normalizedInfo = importantInfo.toLowerCase().trim();
          const isDuplicate = characterNotes.some(note => 
            note.toLowerCase().trim() === normalizedInfo
          );
          
          if (!isDuplicate) {
            return {
              ...prev,
              [selectedCharacter]: [...characterNotes, importantInfo]
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
    if (guessesLeft > 0) {
      setAccusationOpen(true);
      setLastGuessResult(null);
    }
  };

  const handleAccusationSubmit = () => {
    if (!accusedCharacter || guessesLeft <= 0) return;

    const result = checkAccusation(accusedCharacter);
    const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    
    const timeMessage = `\nTime taken: ${minutes} minutes and ${seconds} seconds.`;
    
    if (result.correct) {
      if (confetti) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      setEndGameMessage(result.explanation + timeMessage);
      setGameEnded(true);
      setLastGuessResult({
        correct: true,
        message: "Congratulations! You've found the killer!"
      });
    } else {
      setGuessesLeft(prev => prev - 1);
      setLastGuessResult({
        correct: false,
        message: `Wrong! You have ${guessesLeft - 1} guesses left.`
      });
      
      if (guessesLeft === 1) {
        setEndGameMessage(result.explanation + "\n\nGame Over! You're out of guesses." + timeMessage);
        setGameEnded(true);
      }
    }
    
    setAccusationOpen(false);
  };

  const resetGame = () => {
    window.location.reload();
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="w-full md:w-64 p-4 border-r">
        <h2 className="text-lg font-bold mb-2">{GAME_TITLE}</h2>
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
          <h3 className="text-sm font-semibold mb-2">Important Clues</h3>
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
          disabled={gameEnded || guessesLeft <= 0}
        >
          Make Accusation ({guessesLeft} guesses left)
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
              Who do you think killed Omri? Choose carefully, you have {guessesLeft} {guessesLeft === 1 ? 'guess' : 'guesses'} left.
            </DialogDescription>
          </DialogHeader>
          
          {lastGuessResult && (
            <Alert variant={lastGuessResult.correct ? "default" : "destructive"}>
              <AlertDescription>
                {lastGuessResult.message}
              </AlertDescription>
            </Alert>
          )}

          <RadioGroup value={accusedCharacter} onValueChange={setAccusedCharacter}>
            {characters.map(character => (
              <div key={character} className="flex items-center space-x-2">
                <RadioGroupItem value={character} id={character} />
                <Label htmlFor={character}>{character}</Label>
              </div>
            ))}
          </RadioGroup>
          
          <DialogFooter>
            <Button onClick={handleAccusationSubmit} disabled={!accusedCharacter}>
              Submit Accusation
            </Button>
          </DialogFooter>
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