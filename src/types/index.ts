export * from './Character';
export * from './Evidence';
export * from './GameState';
export * from './TimeSystem';
export * from './Interrogation';
export * from './SearchResult';

export interface PlayerAction {
  type: 'move' | 'search' | 'talk' | 'examine' | 'notebook';
  target: string;
  parameters?: any;
}

export interface ActionResult {
  success: boolean;
  message: string;
  discoveries?: (Evidence | TimelineEvent)[];
  dialogueOptions?: any[];
  evidence?: Evidence;
}

export interface DialogueOption {
  text: string;
  nextId: string;
  condition?: string;
  effect?: string;
} 