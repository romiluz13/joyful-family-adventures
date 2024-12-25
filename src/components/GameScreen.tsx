import React from 'react';
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { getCharacterResponse, gameState } from "@/lib/openai";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";
import { Input } from "./ui/input";
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

interface Message {
  role: "user" | "assistant";
  content: string;
}

function GameScreen() {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [gameStartTime] = useState<Date>(new Date());
  const [showFinalAccusation, setShowFinalAccusation] = useState(false);
  const [finalSuspect, setFinalSuspect] = useState("");
  const [gameEnded, setGameEnded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCharacterSelect = (character: string) => {
    setSelectedCharacter(character);
    setMessages([]);
    handleSendMessage("Hello, can you tell me about yourself?");
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedCharacter || isLoading) return;

    setIsLoading(true);
    const newMessage: Message = { role: "user", content: message };
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

      const assistantMessage: Message = { role: "assistant", content: response };
      setMessages(prev => [...prev, assistantMessage]);
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
      const timeElapsed = Math.floor((new Date().getTime() - gameStartTime.getTime()) / 1000);
      const minutes = Math.floor(timeElapsed / 60);
      const seconds = timeElapsed % 60;
      
      toast.success(
        `Congratulations! You've solved the case in ${minutes}m ${seconds}s! 
        ${gameState.murderer} killed ${gameState.victimName} because ${gameState.motive}.`
      );
    } else {
      toast.error("Wrong accusation! The investigation continues...");
    }
    setShowFinalAccusation(false);
    setGameEnded(finalSuspect === gameState.murderer);
  };

  return (
    <div className="container mx-auto p-4 h-screen">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Character Selection */}
        <Card className="col-span-3 p-4">
          <h2 className="text-xl font-bold mb-4">Suspects</h2>
          <div className="space-y-2">
            {["Rachel", "Rom", "Ilan", "Michal", "Neta"].map((character) => (
              <Button
                key={character}
                variant={selectedCharacter === character ? "default" : "outline"}
                className="w-full"
                onClick={() => handleCharacterSelect(character)}
              >
                {character}
              </Button>
            ))}
          </div>
          
          <div className="mt-8">
            <Button
              className="w-full"
              variant="destructive"
              onClick={() => setShowFinalAccusation(true)}
              disabled={gameEnded}
            >
              Make Final Accusation
            </Button>
          </div>
        </Card>

        {/* Chat Area */}
        <div className="col-span-9 flex flex-col">
          <Card className="flex-1 p-4">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
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
                  Ask
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => handleSendMessage("What were you doing when the murder happened?")}
                  disabled={!selectedCharacter || isLoading}
                >
                  Ask About Alibi
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleSendMessage("Did you notice anything suspicious?")}
                  disabled={!selectedCharacter || isLoading}
                >
                  Ask About Clues
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleSendMessage("What do you think about the other family members?")}
                  disabled={!selectedCharacter || isLoading}
                >
                  Ask About Others
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