interface Character {
  id: string;
  name: string;
  role: string;
  testimony: string[];
  secrets: string[];
  isLying: boolean[];  // Corresponds to each testimony
  relationships: Map<string, Relationship>;  // Character ID to relationship
  location: Location;
  alibi: string;
}

interface Relationship {
  type: 'friend' | 'enemy' | 'neutral' | 'family';
  details: string;
  trustLevel: number;  // 0-100
}

enum Location {
  DINING_ROOM = 'dining_room',
  LIBRARY = 'library',
  GARDEN = 'garden',
  KITCHEN = 'kitchen',
  BEDROOM = 'bedroom',
  STUDY = 'study'
} 