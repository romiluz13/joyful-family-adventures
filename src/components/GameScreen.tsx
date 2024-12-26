import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { getCharacterResponse, gameState, timeline, type ChatMessage } from "@/lib/openai";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { useGame } from "@/contexts/GameContext";
import { CharacterCard } from "./CharacterCard";
import { ChatBubble } from "./ChatBubble";
import { FiClock, FiMessageCircle, FiSearch, FiCalendar } from "react-icons/fi";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface Message extends ChatMessage {
  timestamp: Date;
  timelineReference?: string;
}

function GameScreen() {
  const { elapsedTime } = useGame();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [showFinalAccusation, setShowFinalAccusation] = useState(false);
  const [finalSuspect, setFinalSuspect] = useState("");
  const [gameEnded, setGameEnded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState<string>("dayBefore");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<{[key: string]: string[]}>({
    "Rachel": [],
    "Rom": [],
    "Ilan": [],
    "Michal": [],
    "Neta": []
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCharacterSelect = async (character: string) => {
    setSelectedCharacter(character);
    
    // Get character-specific initial message
    let initialMessage = "";
    switch (character) {
      case "Rachel":
        initialMessage = "Oh sweetie, come sit with me and my dogs. Shawn and Louie are excellent judges of character, you know!";
        break;
      case "Rom":
        initialMessage = "Finally, someone who might appreciate how my AI expertise could help solve this case!";
        break;
      case "Ilan":
        initialMessage = "Hmm... like a tractor with a loose bolt, something's not quite right here...";
        break;
      case "Michal":
        initialMessage = "Oh... yes, please, let's talk. Though maybe we could discuss something less... distressing?";
        break;
      case "Neta":
        initialMessage = "*touching belly nervously* The baby's been keeping me up, so I've noticed quite a few things...";
        break;
    }

    const initialSystemMessage: Message = {
      role: "assistant",
      content: initialMessage,
      timestamp: new Date(),
      timelineReference: "introduction"
    };

    setMessages([initialSystemMessage]);
    setIsMobileMenuOpen(false);
  };

  const handleAddNote = (character: string, content: string) => {
    setNotes(prev => {
      // Clean up the content
      const cleanContent = content
        .replace(/\*/g, '')           // Remove asterisks
        .replace(/\s+/g, ' ')         // Normalize whitespace
        .replace(/^[- ]+/, '')        // Remove leading dashes and spaces
        .trim();

      // Extract timeline and note content
      const [timeline, ...noteParts] = cleanContent.split(' - ');
      const noteContent = noteParts.join(' - ').trim();
      
      // Function to normalize text for comparison
      const normalizeText = (text: string) => {
        return text
          .toLowerCase()
          .replace(/[.,!?]/g, '')     // Remove punctuation
          .replace(/\s+/g, ' ')       // Normalize spaces
          .trim();
      };

      // Function to check if two notes are similar
      const areSimilar = (note1: string, note2: string) => {
        const n1 = normalizeText(note1);
        const n2 = normalizeText(note2);
        
        // Check for exact match
        if (n1 === n2) return true;
        
        // Check if one contains the other
        if (n1.includes(n2) || n2.includes(n1)) return true;
        
        // Check for high similarity (shared words)
        const words1 = new Set(n1.split(' '));
        const words2 = new Set(n2.split(' '));
        const sharedWords = [...words1].filter(word => words2.has(word));
        const similarityScore = sharedWords.length / Math.max(words1.size, words2.size);
        
        return similarityScore > 0.7; // 70% similarity threshold
      };

      // Check for duplicates across all characters
      let isDuplicate = false;
      Object.values(prev).forEach(characterNotes => {
        characterNotes.forEach(existingNote => {
          // Extract content from existing note (remove timeline prefix if present)
          const existingContent = existingNote.includes(' - ') 
            ? existingNote.split(' - ').slice(1).join(' - ') 
            : existingNote;
          
          if (areSimilar(noteContent, existingContent)) {
            isDuplicate = true;
          }
        });
      });

      if (!isDuplicate) {
        return {
          ...prev,
          [character]: [...(prev[character] || []), cleanContent]
        };
      }
      
      return prev;
    });
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedCharacter || isLoading || !message.trim()) return;

    setIsLoading(true);
    const newMessage: Message = { 
      role: "user", 
      content: message,
      timestamp: new Date(),
      timelineReference: selectedTimeline
    };

    setMessages(prev => [...prev, newMessage]);
    setQuestion("");

    try {
      const chatHistory = messages.map(({ role, content }) => ({
        role,
        content
      }));

      const response = await getCharacterResponse(
        selectedCharacter as any,
        message,
        chatHistory,
        {
          revealedClues: [],
          accusationMade: false,
          currentPhase: 'investigation',
          timelineProgress: {
            dayBefore: messages.some(m => m.timelineReference === "dayBefore"),
            murderNight: messages.some(m => m.timelineReference === "murderNight"),
            dayAfter: messages.some(m => m.timelineReference === "dayAfter")
          }
        }
      );

      const assistantMessage: Message = { 
        role: "assistant", 
        content: response,
        timestamp: new Date(),
        timelineReference: selectedTimeline
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Extract information marked with asterisks
      if (selectedCharacter && response.includes('*')) {
        const matches = response.match(/\*(.*?)\*/g);
        if (matches) {
          matches.forEach(match => {
            // Clean up the note text by removing asterisks and extra whitespace
            const info = match.replace(/\*/g, '').trim();
            if (info) {
              // Add the timeline context
              const timelineContext = {
                'dayBefore': 'Day Before',
                'murderNight': 'Murder Night',
                'dayAfter': 'Day After'
              }[selectedTimeline] || '';
              
              handleAddNote(selectedCharacter, `${timelineContext} - ${info}`);
            }
          });
        }
      }
    } catch (error) {
      console.error("Error getting response:", error);
      toast.error("Failed to get character response");
      setMessages(prev => prev.slice(0, -1));
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
        `Congratulations! You've solved the case in ${Math.floor(elapsedTime / 60)}m ${elapsedTime % 60}s!\n
        ${gameState.murderer} killed ${gameState.victimName} because ${gameState.motive}.`
      );
      setGameEnded(true);
    } else {
      toast.error(
        `Wrong accusation! The investigation continues...`
      );
    }
    setShowFinalAccusation(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimelineEvents = (timelineKey: string) => {
    const events = timeline[timelineKey as keyof typeof timeline];
    return Object.entries(events).map(([time, event]) => ({
      time,
      ...event
    }));
  };

  const renderTimelineQuestions = () => {
    const events = getTimelineEvents(selectedTimeline);
    return events.map((event, index) => {
      // Create more natural questions based on the timeline
      let questionText = "";
      let question = "";
      
      switch(selectedTimeline) {
        case "dayBefore":
          switch(event.time) {
            case "afternoon":
              questionText = "Ask about the argument";
              question = "Can you tell me about what happened in the afternoon? I heard there was some tension.";
              break;
            case "evening":
              questionText = "Ask about evening activities";
              question = "What were you doing in the evening? Did you notice anything unusual?";
              break;
          }
          break;
        case "murderNight":
          switch(event.time) {
            case "lateEvening":
              questionText = "Ask about late evening";
              question = "Where were you in the late evening? Did you interact with Omri?";
              break;
            case "midnight":
              questionText = "Ask about midnight events";
              question = "Can you tell me what happened around midnight? Did you hear or see anything?";
              break;
            case "afterMidnight":
              questionText = "Ask about the discovery";
              question = "What do you know about when Omri was found?";
              break;
          }
          break;
        case "dayAfter":
          switch(event.time) {
            case "earlyMorning":
              questionText = "Ask about early morning";
              question = "Did you notice anything unusual early in the morning after?";
              break;
          }
          break;
      }

      return (
        <Button
          key={index}
          onClick={() => handleSendMessage(question)}
          disabled={!selectedCharacter || isLoading}
          className="text-left flex items-center gap-2"
        >
          <FiMessageCircle className="h-4 w-4" />
          {questionText}
        </Button>
      );
    });
  };

  // Quick questions that encourage natural dialogue
  const QuickQuestions = () => (
    <div className="grid grid-cols-3 gap-2">
      <Button
        onClick={() => handleSendMessage("What's your honest opinion about what happened to Omri?")}
        disabled={!selectedCharacter || isLoading}
      >
        Personal Thoughts
      </Button>
      <Button
        onClick={() => handleSendMessage("How well did you know Omri? What was your relationship like?")}
        disabled={!selectedCharacter || isLoading}
      >
        Relationship
      </Button>
      <Button
        onClick={() => handleSendMessage("Have you noticed anyone acting strangely since this happened?")}
        disabled={!selectedCharacter || isLoading}
      >
        Suspicions
      </Button>
    </div>
  );

  // Remove ClueCounter component
  const Header = () => (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold">Suspects</h2>
      <div className="flex items-center gap-2">
        <FiClock className="h-4 w-4" />
        <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>
      </div>
    </div>
  );

  const Notepad = () => {
    const timelineSections = {
      "Day Before": [] as { character: string; note: string }[],
      "Murder Night": [] as { character: string; note: string }[],
      "Day After": [] as { character: string; note: string }[],
      "Other": [] as { character: string; note: string }[]
    };

    // Organize notes by timeline
    Object.entries(notes).forEach(([character, characterNotes]) => {
      characterNotes.forEach(note => {
        const lowerNote = note.toLowerCase();
        // Extract the timeline and clean note content
        let timelineKey = "Other";
        let cleanNote = note;

        if (note.startsWith("Day Before -")) {
          timelineKey = "Day Before";
          cleanNote = note.replace("Day Before -", "").trim();
        } else if (note.startsWith("Murder Night -")) {
          timelineKey = "Murder Night";
          cleanNote = note.replace("Murder Night -", "").trim();
        } else if (note.startsWith("Day After -")) {
          timelineKey = "Day After";
          cleanNote = note.replace("Day After -", "").trim();
        }

        timelineSections[timelineKey].push({ 
          character, 
          note: cleanNote
        });
      });
    });

    return (
      <div className="mt-2 border-t pt-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold">Investigation Notes</h3>
        </div>
        <ScrollArea className="h-[200px]">
          {Object.entries(timelineSections).map(([timeline, timelineNotes]) => (
            timelineNotes.length > 0 && (
              <div key={timeline} className="mb-3">
                <h4 className="text-sm font-semibold text-primary mb-1">{timeline}</h4>
                <ul className="space-y-2">
                  {timelineNotes.map(({ character, note }, index) => (
                    <li 
                      key={index} 
                      className="text-sm pl-2 border-l-2 border-primary/20 hover:border-primary/50 transition-colors"
                    >
                      <span className="font-medium">{character}:</span> {note}
                    </li>
                  ))}
                </ul>
              </div>
            )
          ))}
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-2 h-screen max-h-screen overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 h-full">
        {/* Mobile Header - More compact */}
        <div className="md:hidden flex justify-between items-center mb-2 px-2">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <FiSearch className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%] sm:w-[380px]">
              <div className="space-y-2 mt-2">
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

          <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowFinalAccusation(true)}
            disabled={gameEnded}
          >
            Accuse
          </Button>
        </div>

        {/* Character Selection - Desktop - Now with Notepad */}
        <Card className="hidden md:block md:col-span-3 p-2 overflow-auto max-h-screen">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">Suspects</h2>
              <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>
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
              className="w-full mt-2"
              variant="destructive"
              size="sm"
              onClick={() => setShowFinalAccusation(true)}
              disabled={gameEnded}
            >
              Make Accusation
            </Button>

            <Notepad />
          </div>
        </Card>

        {/* Chat Area - More compact */}
        <div className="col-span-1 md:col-span-9 flex flex-col h-full max-h-screen">
          <Card className="flex-1 p-2">
            {/* Messages Area */}
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="space-y-2 px-2">
                {messages.map((message, index) => (
                  <ChatBubble
                    key={index}
                    content={message.content}
                    isUser={message.role === "user"}
                    timestamp={message.timestamp}
                    timelineReference={message.timelineReference}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area - More compact */}
            <div className="mt-2 space-y-2">
              <Tabs value={selectedTimeline} onValueChange={setSelectedTimeline} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-8">
                  <TabsTrigger value="dayBefore" className="text-xs">Day Before</TabsTrigger>
                  <TabsTrigger value="murderNight" className="text-xs">Murder Night</TabsTrigger>
                  <TabsTrigger value="dayAfter" className="text-xs">Day After</TabsTrigger>
                </TabsList>
                <TabsContent value={selectedTimeline} className="mt-1">
                  <div className="grid grid-cols-2 gap-1">
                    {renderTimelineQuestions()}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-1">
                <Input
                  placeholder="Ask your own question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!selectedCharacter || isLoading}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  onClick={() => handleSendMessage(question)}
                  disabled={!question.trim() || !selectedCharacter || isLoading}
                >
                  <FiMessageCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendMessage("What's your opinion about what happened?")}
                  disabled={!selectedCharacter || isLoading}
                  className="text-xs"
                >
                  Thoughts
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendMessage("What was your relationship with Omri?")}
                  disabled={!selectedCharacter || isLoading}
                  className="text-xs"
                >
                  Relations
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendMessage("Notice anything suspicious?")}
                  disabled={!selectedCharacter || isLoading}
                  className="text-xs"
                >
                  Suspicions
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Final Accusation Dialog - More compact */}
        <Dialog open={showFinalAccusation} onOpenChange={setShowFinalAccusation}>
          <DialogContent className="max-w-[350px]">
            <DialogHeader>
              <DialogTitle>Make Your Accusation</DialogTitle>
              <DialogDescription className="text-sm">
                Who killed {gameState.victimName}?
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-2">
              <RadioGroup value={finalSuspect} onValueChange={setFinalSuspect}>
                {["Rachel", "Rom", "Ilan", "Michal", "Neta"].map((character) => (
                  <div key={character} className="flex items-center space-x-2">
                    <RadioGroupItem value={character} id={character} />
                    <Label htmlFor={character}>{character}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <DialogFooter>
              <Button size="sm" onClick={handleFinalAccusation} disabled={!finalSuspect}>
                Accuse
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default GameScreen; 