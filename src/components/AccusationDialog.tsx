import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { ScrollArea } from "./ui/scroll-area";
import { gameState } from '@/lib/openai';

interface AccusationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clues: Array<{ text: string; source: string }>;
  onAccuse: (suspect: string) => void;
}

export function AccusationDialog({ open, onOpenChange, clues, onAccuse }: AccusationDialogProps) {
  const [selectedSuspect, setSelectedSuspect] = React.useState<string>("");
  const suspects = ["Rachel", "Rom", "Ilan", "Michal", "Neta"];

  const handleAccusation = () => {
    if (selectedSuspect) {
      onAccuse(selectedSuspect);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Make Your Accusation</DialogTitle>
          <DialogDescription>
            Review your clues carefully before making an accusation. Choose wisely - you must justify your choice with evidence.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Collected Clues</Label>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              {clues.map((clue, index) => (
                <div key={index} className="mb-4">
                  <p className="text-sm text-muted-foreground">From {clue.source}:</p>
                  <p>{clue.text}</p>
                </div>
              ))}
            </ScrollArea>
          </div>

          <div className="grid gap-2">
            <Label>Select the Suspect</Label>
            <RadioGroup
              value={selectedSuspect}
              onValueChange={setSelectedSuspect}
              className="grid grid-cols-2 gap-4"
            >
              {suspects.map((suspect) => (
                <div key={suspect} className="flex items-center space-x-2">
                  <RadioGroupItem value={suspect} id={suspect} />
                  <Label htmlFor={suspect}>{suspect}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccusation}
            disabled={!selectedSuspect}
          >
            Make Accusation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 