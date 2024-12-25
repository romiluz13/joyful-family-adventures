import React from 'react';
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface Clue {
  text: string;
  source: string;
  timestamp: Date;
}

interface ClueTrackerProps {
  clues: Clue[];
  gamePhase: 'investigation' | 'accusation' | 'resolution';
  onMakeAccusation: () => void;
}

export function ClueTracker({ clues, gamePhase, onMakeAccusation }: ClueTrackerProps) {
  return (
    <Card className="p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Detective's Notebook</h2>
        <Badge variant="outline">{gamePhase}</Badge>
      </div>
      
      <ScrollArea className="h-[300px] mb-4">
        <div className="space-y-4">
          {clues.map((clue, index) => (
            <div key={index} className="border-l-2 border-primary pl-4">
              <p className="text-sm text-muted-foreground">
                From {clue.source} at {clue.timestamp.toLocaleTimeString()}
              </p>
              <p className="mt-1">{clue.text}</p>
            </div>
          ))}
        </div>
      </ScrollArea>

      {gamePhase === 'investigation' && clues.length >= 3 && (
        <Button 
          className="w-full" 
          variant="secondary"
          onClick={onMakeAccusation}
        >
          Make Accusation
        </Button>
      )}
    </Card>
  );
} 