import { Location } from './Character';

export interface Evidence {
  id: string;
  name: string;
  description: string;
  location: Location;
  type: 'DOCUMENT' | 'PHYSICAL' | 'TESTIMONY';
  relatedCharacters: string[];
  contradicts: string[];
} 