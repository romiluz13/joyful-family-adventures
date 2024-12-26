import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { getCharacterResponse, gameState } from "@/lib/openai";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { useGame } from "@/contexts/GameContext";
import { CharacterCard } from "./CharacterCard";
import { ChatBubble } from "./ChatBubble";
import { FiClock, FiMessageCircle, FiSearch } from "react-icons/fi";
import useSound from 'use-sound';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function GameScreen() {
  const { elapsedTime, addClue } = useGame();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [showFinalAccusation, setShowFinalAccusation] = useState(false);
  const [finalSuspect, setFinalSuspect] = useState("");
  const [gameEnded, setGameEnded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Sound effects - temporarily disabled until sound files are added
  // const [playSelect] = useSound('/sounds/select.mp3', { volume: 0.5 });
  // const [playSend] = useSound('/sounds/send.mp3', { volume: 0.5 });
  // const [playReceive] = useSound('/sounds/receive.mp3', { volume: 0.5 });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCharacterSelect = (character: string) => {
    // playSelect();
    setSelectedCharacter(character);
    setMessages([]);
    handleSendMessage("Hello, can you tell me about yourself?");
    setIsMobileMenuOpen(false);
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedCharacter || isLoading) return;

    // playSend();
    setIsLoading(true);
    const newMessage: Message = { 
      role: "user", 
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    setQuestion(""); // Clear input after sending

    try {
      const response = await getCharacterResponse(
        selectedCharacter as any,
        message,
        messages,
        {
          revealedClues: messages.map(m => m.content),
          accusationMade: false,
          currentPhase: 'investigation'
        }
      );

      // playReceive();
      const assistantMessage: Message = { 
        role: "assistant", 
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Check for potential clues
      if (response.toLowerCase().includes("clue") || 
          response.toLowerCase().includes("suspicious") ||
          response.toLowerCase().includes("noticed")) {
        addClue({
          text: response,
          source: selectedCharacter,
          isKey: false
        });
      }
    } catch (error) {
      console.error("Error getting response:", error);
      toast.error("Failed to get character response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && question.trim() && !isLoading) {
      handleSendMessage(question);
    }
  };

  const handleFinalAccusation = () => {
    if (finalSuspect === gameState.murderer) {
      toast.success(
        `Congratulations! You've solved the case in ${Math.floor(elapsedTime / 60)}m ${elapsedTime % 60}s! 
        ${gameState.murderer} killed ${gameState.victimName} because ${gameState.motive}.`
      );
    } else {
      toast.error("Wrong accusation! The investigation continues...");
    }
    setShowFinalAccusation(false);
    setGameEnded(finalSuspect === gameState.murderer);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto p-4 h-screen">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <FiSearch className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="space-y-4 mt-4">
                {["Rachel", "Rom", "Ilan", "Michal", "Neta"].map((character) => (
                  <CharacterCard
                    key={character}
                    name={character}
                    isSelected={selectedCharacter === character}
                    onSelect={() => handleCharacterSelect(character)}
                  />
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <FiClock className="h-4 w-4" />
            <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowFinalAccusation(true)}
            disabled={gameEnded}
          >
            Accuse
          </Button>
        </div>

        {/* Character Selection - Desktop */}
        <Card className="hidden md:block md:col-span-3 p-4 overflow-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Suspects</h2>
              <div className="flex items-center gap-2">
                <FiClock className="h-4 w-4" />
                <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>
              </div>
            </div>

            {["Rachel", "Rom", "Ilan", "Michal", "Neta"].map((character) => (
              <CharacterCard
                key={character}
                name={character}
                isSelected={selectedCharacter === character}
                onSelect={() => handleCharacterSelect(character)}
              />
            ))}

            <Button
              className="w-full mt-4"
              variant="destructive"
              onClick={() => setShowFinalAccusation(true)}
              disabled={gameEnded}
            >
              Make Final Accusation
            </Button>
          </div>
        </Card>

        {/* Chat Area */}
        <div className="col-span-1 md:col-span-9 flex flex-col h-full">
          <Card className="flex-1 p-4">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <AnimatePresence>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <ChatBubble
                      key={index}
                      content={message.content}
                      isUser={message.role === "user"}
                      timestamp={message.timestamp}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </AnimatePresence>
            </ScrollArea>

            <div className="mt-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!selectedCharacter || isLoading}
                />
                <Button
                  onClick={() => handleSendMessage(question)}
                  disabled={!question.trim() || !selectedCharacter || isLoading}
                >
                  <FiMessageCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => handleSendMessage("What were you doing when the murder happened?")}
                  disabled={!selectedCharacter || isLoading}
                >
                  Ask Alibi
                </Button>
                <Button
                  onClick={() => handleSendMessage("Did you notice anything suspicious?")}
                  disabled={!selectedCharacter || isLoading}
                >
                  Ask Clues
                </Button>
                <Button
                  onClick={() => handleSendMessage("What do you think about the other family members?")}
                  disabled={!selectedCharacter || isLoading}
                >
                  Ask Others
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Final Accusation Dialog */}
      <Dialog open={showFinalAccusation} onOpenChange={setShowFinalAccusation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Your Final Accusation</DialogTitle>
            <DialogDescription>
              Choose carefully! Who do you think murdered {gameState.victimName}?
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <RadioGroup
              value={finalSuspect}
              onValueChange={setFinalSuspect}
              className="grid grid-cols-2 gap-4"
            >
              {["Rachel", "Rom", "Ilan", "Michal", "Neta"].map((suspect) => (
                <div key={suspect} className="flex items-center space-x-2">
                  <RadioGroupItem value={suspect} id={suspect} />
                  <Label htmlFor={suspect}>{suspect}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowFinalAccusation(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFinalAccusation}
              disabled={!finalSuspect}
              variant="destructive"
            >
              Make Final Accusation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GameScreen; 