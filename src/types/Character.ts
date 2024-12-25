export enum PersonalityTrait {
  LOUD = 'loud',
  HUMOROUS = 'humorous',
  PROTECTIVE = 'protective',
  COMPETITIVE = 'competitive',
  DEFENSIVE = 'defensive',
  RESERVED = 'reserved',
  OBSERVANT = 'observant',
  WITTY = 'witty',
  WARM = 'warm',
  GENTLE = 'gentle',
  HONEST = 'honest'
}

export interface CharacterPersonality {
  primaryTraits: PersonalityTrait[];
  stressResponse: string;
  quirks: string[];
  defaultTone: string;
}

export interface Character {
  id: string;
  name: string;
  personality: CharacterPersonality;
  backstory: string;
  relationships: Map<string, Relationship>;
  knownSecrets: string[];
  observations: Map<string, string>;  // Time -> Observation
  stressLevel: number;  // 0-100
  trustLevel: number;   // 0-100
  isLying: boolean;     // Current conversation state
}

interface Relationship {
  type: 'friend' | 'enemy' | 'neutral' | 'family';
  details: string;
  trustLevel: number;  // 0-100
}

export enum Location {
  DINING_ROOM = 'dining_room',
  LIBRARY = 'library',
  GARDEN = 'garden',
  KITCHEN = 'kitchen',
  BEDROOM = 'bedroom',
  STUDY = 'study'
} 