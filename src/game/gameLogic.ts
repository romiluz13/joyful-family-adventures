import { CharacterBase, GameState, characters } from '../models/characters';

export class GameLogic {
  private characters: Record<string, CharacterBase>;
  private gameState: GameState;

  private readonly weapons = [
    "kitchen knife",
    "heavy book",
    "garden shears",
    "old trophy",
    "poisoned tea"
  ];

  private readonly locations = [
    "kitchen",
    "garden",
    "study room",
    "living room",
    "backyard"
  ];

  private readonly timeSlots = [
    "just after dinner",
    "late at night",
    "early morning",
    "during afternoon tea",
    "before breakfast"
  ];

  private readonly motives: Record<string, string[]> = {
    Rachel: [
      "Omri threatened to send her dogs to a shelter",
      "Omri was planning to sell the family house",
      "Omri discovered her gambling debts"
    ],
    Rom: [
      "Omri was going to expose his failed startup",
      "Omri refused to invest in his new tech venture",
      "Omri threatened to reveal his internet scam"
    ],
    Ilan: [
      "Omri discovered his secret second family",
      "Omri was going to change the will",
      "Omri found evidence of his past crimes"
    ],
    Michal: [
      "Omri was about to reveal her affair",
      "Omri threatened to take away her inheritance",
      "Omri discovered her stolen family heirlooms"
    ],
    Neta: [
      "Omri knew about her fake pregnancy",
      "Omri was going to expose her true identity",
      "Omri discovered she was stealing from the family"
    ]
  };

  constructor() {
    this.characters = { ...characters };
    this.gameState = this.initializeGameState();
  }

  private selectRandomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  private getLastKiller(): string | null {
    return localStorage.getItem('lastKiller');
  }

  private setLastKiller(killer: string): void {
    localStorage.setItem('lastKiller', killer);
  }

  private selectKiller(possibleKillers: string[]): string {
    const lastKiller = this.getLastKiller();
    const availableKillers = lastKiller 
      ? possibleKillers.filter(k => k !== lastKiller)
      : possibleKillers;
    
    const newKiller = this.selectRandomItem(availableKillers);
    this.setLastKiller(newKiller);
    return newKiller;
  }

  private initializeGameState(): GameState {
    const possibleKillers = Object.keys(this.characters).filter(name => name !== "Omri");
    const killer = this.selectKiller(possibleKillers);

    // Update character murderer status
    Object.entries(this.characters).forEach(([name, character]) => {
      character.isMurderer = name === killer;
    });

    return {
      currentKiller: killer,
      weapon: this.selectRandomItem(this.weapons),
      location: this.selectRandomItem(this.locations),
      timeOfDeath: this.selectRandomItem(this.timeSlots),
      motive: this.selectRandomItem(this.motives[killer]),
      cluesRevealed: [],
      attemptsRemaining: 3
    };
  }

  public getCharacterResponse(characterName: string, userMessage: string): string {
    const character = this.characters[characterName];
    if (!character) {
      return "Character not found.";
    }

    return character.isMurderer 
      ? this.generateKillerResponse(character, userMessage)
      : this.generateInnocentResponse(character, userMessage);
  }

  private generateKillerResponse(character: CharacterBase, userMessage: string): string {
    const messageLower = userMessage.toLowerCase();
    const triggerWords = ["murder", "kill", "weapon", this.gameState.weapon.toLowerCase()];
    
    if (triggerWords.some(word => messageLower.includes(word))) {
      return `${this.selectRandomItem(character.typicalPhrases)} ${character.defenseMechanisms}`;
    }
    
    return this.selectRandomItem(character.typicalPhrases);
  }

  private generateInnocentResponse(character: CharacterBase, userMessage: string): string {
    return `${this.selectRandomItem(character.typicalPhrases)} ${character.behavior}`;
  }

  public makeAccusation(accusedCharacter: string): { correct: boolean; message: string } {
    if (this.gameState.attemptsRemaining <= 0) {
      return { correct: false, message: "No more attempts remaining." };
    }

    this.gameState.attemptsRemaining--;
    const isCorrect = accusedCharacter === this.gameState.currentKiller;

    if (isCorrect) {
      return {
        correct: true,
        message: `Correct! ${accusedCharacter} killed Omri using the ${this.gameState.weapon} in the ${this.gameState.location} ${this.gameState.timeOfDeath} because ${this.gameState.motive}.`
      };
    }

    return {
      correct: false,
      message: `Wrong! You have ${this.gameState.attemptsRemaining} attempts remaining.`
    };
  }

  public addClue(clue: string): void {
    if (!this.gameState.cluesRevealed.includes(clue)) {
      this.gameState.cluesRevealed.push(clue);
    }
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }
} 