import { GameState, PlayerAction, ActionResult } from '../types';
import { CharacterManager } from './CharacterManager';
import { EvidenceManager } from './EvidenceManager';
import { TimeManager } from './TimeManager';
import { LocationManager } from './LocationManager';
import { DialogueManager } from './DialogueManager';
import { NotebookManager } from './NotebookManager';
import { DeductionBoard } from './DeductionBoard';

export class GameStateManager {
  private gameState: GameState;
  private characterManager: CharacterManager;
  private evidenceManager: EvidenceManager;
  private timeManager: TimeManager;
  private locationManager: LocationManager;
  private dialogueManager: DialogueManager;
  private notebookManager: NotebookManager;
  private deductionBoard: DeductionBoard;

  constructor() {
    this.gameState = this.initializeGameState();
    this.characterManager = new CharacterManager();
    this.evidenceManager = new EvidenceManager();
    this.timeManager = new TimeManager();
    this.locationManager = new LocationManager();
    this.dialogueManager = new DialogueManager();
    this.notebookManager = new NotebookManager();
    this.deductionBoard = new DeductionBoard();
  }

  private initializeGameState(): GameState {
    return {
      currentTime: {
        day: 1,
        period: TimePeriod.MORNING,
        timestamp: "09:00"
      },
      phase: GamePhase.INVESTIGATION,
      evidenceDiscovered: [],
      playerActions: 3,
      daysRemaining: 5,
      suspectStatus: new Map()
    };
  }

  public performAction(action: PlayerAction): ActionResult {
    if (this.gameState.playerActions <= 0) {
      return { success: false, message: "No actions remaining today" };
    }

    // Handle action and update game state
    this.gameState.playerActions--;
    return this.executeAction(action);
  }

  public advanceTime(): void {
    // Advance time and trigger relevant events
    this.timeManager.advance();
    this.updateCharacterLocations();
    this.checkTimeBasedEvents();
  }

  public executeAction(action: PlayerAction): ActionResult {
    switch (action.type) {
      case 'move':
        return this.handleMovement(action.target as Location);
      case 'search':
        return this.handleSearch(action.target);
      case 'talk':
        return this.handleConversation(action.target);
      case 'examine':
        return this.handleExamination(action.target);
      default:
        return { success: false, message: "Invalid action" };
    }
  }

  private handleMovement(newLocation: Location): ActionResult {
    const success = this.locationManager.moveToLocation(newLocation);
    if (success) {
      const description = this.locationManager.getLocationDescription();
      return {
        success: true,
        message: `Moved to ${newLocation}. ${description?.description}`
      };
    }
    return {
      success: false,
      message: "You cannot move there from your current location."
    };
  }

  private handleSearch(areaId: string): ActionResult {
    const searchResult = this.locationManager.searchArea(areaId);
    if (searchResult.success) {
      const evidence = this.evidenceManager.searchLocation(this.locationManager.getCurrentLocation());
      if (evidence.length > 0) {
        return {
          success: true,
          message: `${searchResult.message}. You found something interesting!`,
          discoveries: evidence
        };
      }
    }
    return searchResult;
  }

  private handleConversation(characterId: string): ActionResult {
    const dialogue = this.dialogueManager.startDialogue(characterId);
    if (!dialogue) {
      return {
        success: false,
        message: "This character is not available for conversation."
      };
    }

    return {
      success: true,
      message: dialogue.text,
      dialogueOptions: dialogue.options
    };
  }

  private handleExamination(evidenceId: string): ActionResult {
    const evidence = this.evidenceManager.getDiscoveredEvidence()
      .find(e => e.id === evidenceId);

    if (!evidence) {
      return {
        success: false,
        message: "You haven't discovered this evidence yet."
      };
    }

    return {
      success: true,
      message: `Examining ${evidence.name}: ${evidence.description}`,
      evidence: evidence
    };
  }

  public addNotebookEntry(entry: NotebookEntry): void {
    this.notebookManager.addEntry(entry);
    this.checkForNewDeductions(entry);
  }

  private checkForNewDeductions(entry: NotebookEntry): void {
    // Check if this entry enables any new deductions
    if (entry.type === 'CLUE') {
      const relatedEntries = this.notebookManager
        .getEntriesByTag(entry.tags[0]); // Simplified example

      if (relatedEntries.length >= 3) {
        // Suggest a possible deduction
        this.suggestDeduction(relatedEntries);
      }
    }
  }

  private suggestDeduction(entries: NotebookEntry[]): void {
    const deductionChain: DeductionChain = {
      id: `deduction_${Date.now()}`,
      conclusion: "These clues might be related...",
      nodes: entries.map(entry => ({
        id: `node_${entry.id}`,
        type: 'EVIDENCE',
        content: entry.content,
        confidence: 50,
        isProven: false,
        relatedEntries: [entry.id]
      })),
      connections: [],
      status: 'IN_PROGRESS'
    };

    this.deductionBoard.createTheory(deductionChain);
  }

  public isGameActive(): boolean {
    return this.gameState.daysRemaining > 0;
  }

  public getCurrentLocation(): Location {
    return this.locationManager.getCurrentLocation();
  }

  public getLocationDescription(): RoomDescription | undefined {
    return this.locationManager.getLocationDescription();
  }

  public getAvailableRooms(): Location[] {
    const currentRoom = this.locationManager.getLocationDescription();
    return currentRoom?.connectedRooms || [];
  }

  public getSearchableAreas(): SearchableArea[] {
    const currentRoom = this.locationManager.getLocationDescription();
    return currentRoom?.searchableAreas.filter(area => !area.searched) || [];
  }

  public getAvailableCharacters(): Character[] {
    const currentRoom = this.locationManager.getLocationDescription();
    return currentRoom?.availableCharacters.map(id => 
      this.characterManager.getCharacter(id)
    ).filter((char): char is Character => char !== undefined) || [];
  }

  public getDiscoveredEvidence(): Evidence[] {
    return this.evidenceManager.getDiscoveredEvidence();
  }

  public handleDialogueChoice(choiceIndex: number): ActionResult {
    // Implement dialogue choice handling
    return {
      success: true,
      message: "Response noted.",
    };
  }
} 