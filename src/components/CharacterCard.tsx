import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { characters } from '@/models/characters';

interface CharacterCardProps {
  name: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function CharacterCard({ name, isSelected, onSelect }: CharacterCardProps) {
  const profile = characters[name];

  return (
    <Card className={`cursor-pointer transition-colors ${
      isSelected ? 'bg-primary text-primary-foreground' : ''
    }`}>
      <CardContent className="p-3">
        <Button
          variant={isSelected ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={onSelect}
        >
          {name}
        </Button>
      </CardContent>
    </Card>
  );
}