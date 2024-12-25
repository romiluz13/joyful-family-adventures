import { Location, Character } from './Character';
import { Evidence } from './Evidence';

export enum GamePhase {
  INTRODUCTION = 'introduction',
  INVESTIGATION = 'investigation',
  ACCUSATION = 'accusation',
  CONCLUSION = 'conclusion'
}

export enum TimePeriod {
  EARLY_MORNING = 'early_morning',
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  NIGHT = 'night'
}

export interface TimeState {
  day: number;
  period: TimePeriod;
  timestamp: string;
}

export interface GameState {
  currentTime: TimeState;
  phase: GamePhase;
  evidenceDiscovered: Evidence[];
  playerActions: number;
  daysRemaining: number;
  suspectStatus: Map<string, boolean>;
}

export interface RoomDescription {
  description: string;
  connectedRooms: Location[];
  searchableAreas: SearchableArea[];
  availableCharacters: string[];
}

export interface SearchableArea {
  id: string;
  name: string;
  description: string;
  searched: boolean;
}

export interface TimelineEvent {
  timestamp: string;
  description: string;
  location: Location;
  witnesses: string[];
}

export interface NotebookEntry {
  id: string;
  type: 'CLUE' | 'TESTIMONY' | 'DEDUCTION';
  content: string;
  timestamp: string;
  tags: string[];
}

export interface DeductionChain {
  id: string;
  conclusion: string;
  nodes: DeductionNode[];
  connections: DeductionConnection[];
  status: 'IN_PROGRESS' | 'PROVEN' | 'DISPROVEN';
}

export interface DeductionNode {
  id: string;
  type: 'EVIDENCE' | 'TESTIMONY' | 'DEDUCTION';
  content: string;
  confidence: number;
  isProven: boolean;
  relatedEntries: string[];
}

export interface DeductionConnection {
  fromId: string;
  toId: string;
  type: 'SUPPORTS' | 'CONTRADICTS';
  strength: number;
} 