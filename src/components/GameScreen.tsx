import { useState, useEffect } from 'react';
import { getCharacterResponse, checkAccusation, GAME_TITLE, GAME_INTRO, initializeNewGame, type GameContext } from '@/lib/openai';
import { CharacterCard } from './CharacterCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import type { CreateTypes } from 'canvas-confetti';
import { characters } from '@/models/characters';
import { FaUserSecret, FaScroll, FaHourglassHalf, FaSkull } from 'react-icons/fa';
import { useSpring, animated } from '@react-spring/web';
import { Tilt } from 'react-tilt';
import { useSound } from 'use-sound';

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
  character?: string;
}

export default function GameScreen() {
  const [selectedCharacters, setSelectedCharacters] = useState<Set<string>>(new Set());
  const [activeCharacter, setActiveCharacter] = useState<string | null>(null);
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

  const characterList = Object.keys(characters);

  useEffect(() => {
    if (activeCharacter && messages.length === 0) {
      handleSendMessage('Hello, can you tell me about yourself?');
    }
  }, [activeCharacter]);

  const handleCharacterSelect = (character: string) => {
    setSelectedCharacters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(character)) {
        newSet.delete(character);
        if (activeCharacter === character) {
          setActiveCharacter(newSet.size > 0 ? Array.from(newSet)[0] : null);
        }
      } else {
        newSet.add(character);
        if (!activeCharacter) {
          setActiveCharacter(character);
        }
      }
      return newSet;
    });
  };

  const extractImportantInfo = (text: string): string | null => {
    const match = text.match(/\*(.*?)\*/);
    return match ? match[1].trim() : null;
  };

  const handleSendMessage = async (content: string) => {
    if (!activeCharacter) return;

    setIsLoading(true);
    const userMessage: Message = { role: 'user', content, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      const gameContext: GameContext = {
        revealedClues: Object.values(notes).flat(),
        accusationMade: guessesLeft < 3,
        currentPhase: gameEnded ? 'resolution' : guessesLeft < 3 ? 'accusation' : 'investigation',
        timelineProgress: {
          dayBefore: messages.some(m => m.content.toLowerCase().includes('day before')),
          murderNight: messages.some(m => m.content.toLowerCase().includes('murder night')),
          dayAfter: messages.some(m => m.content.toLowerCase().includes('day after'))
        }
      };

      const response = await getCharacterResponse(
        activeCharacter,
        content,
        messages.filter(m => m.character === activeCharacter || m.role === 'user'),
        gameContext
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        character: activeCharacter
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Extract important information (marked with asterisks)
      const importantInfo = extractImportantInfo(response);
      if (importantInfo) {
        setNotes(prev => {
          const characterNotes = prev[activeCharacter] || [];
          const normalizedInfo = importantInfo.toLowerCase().trim();
          if (!characterNotes.some(note => note.toLowerCase().trim() === normalizedInfo)) {
            return {
              ...prev,
              [activeCharacter]: [...characterNotes, importantInfo]
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
      
      if (guessesLeft === 1) { // Last guess was wrong
        setEndGameMessage(result.explanation + "\n\nGame Over! You're out of guesses." + timeMessage);
        setGameEnded(true);
      }
    }
  };

  const resetGame = () => {
    window.location.reload();
  };

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 1000 }
  });

  const pulseAnimation = useSpring({
    loop: true,
    from: { transform: 'scale(1)' },
    to: [
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' }
    ],
    config: { duration: 2000 }
  });

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Left Panel */}
      <div className="w-full md:w-80 p-6 border-r border-slate-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-2 text-slate-100">{GAME_TITLE}</h2>
          <p className="text-sm text-slate-400 mb-6">{GAME_INTRO}</p>
        </motion.div>

        <Tabs defaultValue="suspects" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="suspects" className="w-1/2">
              <FaUserSecret className="mr-2" /> Suspects
            </TabsTrigger>
            <TabsTrigger value="notes" className="w-1/2">
              <FaScroll className="mr-2" /> Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suspects">
            <div className="space-y-3">
              {characterList.map(character => (
                <Tilt
                  key={character}
                  options={{ 
                    max: 15,
                    scale: 1.05,
                    speed: 1000,
                    glare: true,
                    "max-glare": 0.5
                  }}
                >
                  <animated.div style={fadeIn}>
                    <div className="relative">
                      <CharacterCard
                        name={character}
                        isSelected={selectedCharacters.has(character)}
                        onSelect={() => {
                          setSelectedCharacters(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(character)) {
                              newSet.delete(character);
                              if (activeCharacter === character) {
                                setActiveCharacter(newSet.size > 0 ? Array.from(newSet)[0] : null);
                              }
                            } else {
                              newSet.add(character);
                              if (!activeCharacter) {
                                setActiveCharacter(character);
                              }
                            }
                            return newSet;
                          });
                        }}
                      />
                      {selectedCharacters.has(character) && (
                        <Badge 
                          className={`absolute top-2 right-2 ${
                            activeCharacter === character ? 'bg-primary' : 'bg-slate-600'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCharacter(character);
                          }}
                        >
                          {activeCharacter === character ? 'Speaking' : 'Selected'}
                        </Badge>
                      )}
                    </div>
                  </animated.div>
                </Tilt>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <ScrollArea className="h-[calc(100vh-300px)] rounded-md border border-slate-700 p-4">
              {Object.entries(notes).map(([character, characterNotes]) => (
                <motion.div
                  key={character}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4"
                >
                  <h4 className="text-sm font-bold text-slate-200 flex items-center">
                    <FaUserSecret className="mr-2 text-primary" />
                    {character}
                  </h4>
                  {characterNotes.map((note, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <p className="text-sm text-slate-400 ml-6 my-2 flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {note}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <animated.div style={pulseAnimation}>
                  <Button 
                    className="w-full relative overflow-hidden group"
                    onClick={handleMakeAccusation}
                    disabled={gameEnded || guessesLeft <= 0}
                    variant={gameEnded ? "secondary" : "default"}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <FaSkull className="mr-2" />
                      Make Accusation
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-purple-500/20 transform -skew-x-12" />
                    <Progress 
                      value={((3 - guessesLeft) / 3) * 100} 
                      className="absolute bottom-0 left-0 h-1 bg-primary/20"
                    />
                  </Button>
                </animated.div>
                <p className="text-xs text-center mt-2 text-slate-400">
                  {guessesLeft} {guessesLeft === 1 ? 'guess' : 'guesses'} remaining
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Choose carefully! You have {guessesLeft} {guessesLeft === 1 ? 'guess' : 'guesses'} left</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-900/50">
        <div className="border-b border-slate-700 p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-300">Investigation Room</h3>
            <div className="flex gap-2">
              {Array.from(selectedCharacters).map(char => (
                <Badge
                  key={char}
                  variant={activeCharacter === char ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setActiveCharacter(char)}
                >
                  {char}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.timestamp}
                initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: message.role === 'user' ? -20 : 20 }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  duration: 0.3 
                }}
                className={`mb-4 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {message.role === 'assistant' && (
                  <Badge variant="outline" className="mb-1">
                    {message.character}
                  </Badge>
                )}
                <div
                  className={`inline-block rounded-lg px-4 py-2 max-w-[80%] backdrop-blur-sm ${
                    message.role === 'user'
                      ? 'bg-primary/90 text-primary-foreground shadow-lg'
                      : 'bg-slate-800/90 text-slate-100 shadow-lg'
                  }`}
                >
                  {message.content}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>

        <form onSubmit={handleInputSubmit} className="p-6 border-t border-slate-700">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={
                selectedCharacters.size > 0
                  ? `Ask a question (speaking to ${activeCharacter})...`
                  : "Select suspects to begin interrogation..."
              }
              disabled={!activeCharacter || isLoading || gameEnded}
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
            <Button 
              type="submit" 
              disabled={!activeCharacter || isLoading || gameEnded}
              className="relative"
            >
              {isLoading ? (
                <FaHourglassHalf className="animate-spin" />
              ) : (
                "Ask"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Accusation Dialog */}
      <Dialog open={accusationOpen} onOpenChange={setAccusationOpen}>
        <DialogContent className="bg-slate-900 text-slate-100 border-slate-700">
          <DialogHeader>
            <DialogTitle>Make Your Accusation</DialogTitle>
            <DialogDescription className="text-slate-400">
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

          <RadioGroup 
            value={accusedCharacter} 
            onValueChange={(value) => {
              setAccusedCharacter(value);
              // Reset last guess result when making a new selection
              setLastGuessResult(null);
            }}
          >
            <div className="space-y-3">
              {characterList.map(character => (
                <div 
                  key={character} 
                  className={`
                    flex items-center space-x-3 p-2 rounded-lg 
                    transition-colors duration-200
                    ${accusedCharacter === character ? 'bg-primary/20' : 'hover:bg-slate-800'}
                  `}
                >
                  <RadioGroupItem value={character} id={character} />
                  <Label 
                    htmlFor={character} 
                    className="flex items-center w-full cursor-pointer"
                  >
                    <FaUserSecret className="mr-2" />
                    {character}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
          
          <DialogFooter className="flex flex-col gap-4">
            <Button 
              onClick={handleAccusationSubmit} 
              disabled={!accusedCharacter}
              className="w-full"
              variant="destructive"
            >
              <FaSkull className="mr-2" />
              Submit Final Accusation
            </Button>
            <p className="text-xs text-center text-slate-400">
              This action cannot be undone. Choose wisely.
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Game Dialog */}
      <Dialog open={gameEnded} onOpenChange={setGameEnded}>
        <DialogContent className="bg-slate-900 text-slate-100 border-slate-700">
          <DialogHeader>
            <DialogTitle>
              {lastGuessResult?.correct ? "Congratulations!" : "Game Over"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 whitespace-pre-line">
              {endGameMessage}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={resetGame} className="w-full">
            Play Again
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
} 