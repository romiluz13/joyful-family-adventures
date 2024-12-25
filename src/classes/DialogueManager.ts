export interface DialogueResponse {
  text: string;
  tone: string;
  stressIndicators: string[];
  revealedClues: string[];
}

export class DialogueManager {
  private characters: Map<string, Character> = new Map();
  
  public generateResponse(character: Character, topic: string, pressure: number): DialogueResponse {
    const stressLevel = character.stressLevel + pressure;
    const isStressed = stressLevel > 70;
    
    // Personality-based response generation
    let response = this.getBaseResponse(character, topic);
    response = this.applyPersonalityTraits(response, character.personality);
    response = this.applyStressResponse(response, character, isStressed);
    
    return {
      text: response,
      tone: this.determineTone(character, isStressed),
      stressIndicators: this.getStressIndicators(character, stressLevel),
      revealedClues: this.checkForRevealedClues(character, stressLevel)
    };
  }

  private applyPersonalityTraits(response: string, personality: CharacterPersonality): string {
    if (personality.primaryTraits.includes(PersonalityTrait.HUMOROUS)) {
      response += this.addHumorousElement(personality.quirks);
    }
    // Add more trait-based modifications...
    return response;
  }

  private getStressIndicators(character: Character, stressLevel: number): string[] {
    const indicators: string[] = [];
    if (stressLevel > 60) {
      switch (character.personality.primaryTraits[0]) {
        case PersonalityTrait.LOUD:
          indicators.push("Speaking louder than usual");
          indicators.push("Making more dog references");
          break;
        case PersonalityTrait.COMPETITIVE:
          indicators.push("Becoming more accusatory");
          indicators.push("Frequently mentioning past successes");
          break;
        // Add more personality-specific stress indicators
      }
    }
    return indicators;
  }

  public handleConfrontation(character: Character, evidence: Evidence): DialogueResponse {
    const stressIncrease = this.calculateStressIncrease(character, evidence);
    character.stressLevel += stressIncrease;
    
    if (character.stressLevel > 85) {
      return this.generateBreakdownResponse(character);
    }
    
    return this.generateDeflectionResponse(character, evidence);
  }

  private getBaseResponse(character: Character, topic: string): string {
    const baseResponses = {
      'whereabouts': {
        'rachel_01': "I was walking my dogs, they're my alibi! *laughs* But seriously...",
        'rom_01': "I was in a very important business call. Check my phone records if you don't believe me.",
        'ilan_01': "In the barn. Tools don't maintain themselves.",
        'michal_01': "Just getting some fresh air in the garden. Is that so strange?",
        'neta_01': "I was trying to sleep, but the baby was quite active that night..."
      },
      'victim': {
        'rachel_01': "Poor Omri, he always loved playing with Shawn and Louie...",
        'rom_01': "We had our disagreements about AI ethics, but I respected him.",
        'ilan_01': "He was fair to me. Appreciated good work.",
        'michal_01': "We... had our differences about the kitchen modernization.",
        'neta_01': "He was so excited about becoming an uncle..."
      }
    };

    return baseResponses[topic]?.[character.id] || "I'd rather not discuss that.";
  }

  private determineTone(character: Character, isStressed: boolean): string {
    if (isStressed) {
      return character.personality.stressResponse;
    }
    return character.personality.defaultTone;
  }

  private addHumorousElement(quirks: string[]): string {
    const randomQuirk = quirks[Math.floor(Math.random() * quirks.length)];
    return ` *${randomQuirk}*`;
  }

  private calculateStressIncrease(character: Character, evidence: Evidence): number {
    let increase = 20; // Base stress increase
    if (character.knownSecrets.some(secret => evidence.contradicts.includes(secret))) {
      increase += 15;
    }
    return increase;
  }

  private generateBreakdownResponse(character: Character): DialogueResponse {
    const breakdowns = {
      'rachel_01': "Fine! I was cleaning a knife, but it was for Shawn's birthday cake!",
      'rom_01': "Okay, yes! We fought about the AI project, but I didn't kill him!",
      'ilan_01': "The shovel... it wasn't for gardening that night...",
      'michal_01': "I buried the modernization plans! Is that what you wanted to hear?",
      'neta_01': "I saw something... but I was afraid to tell anyone..."
    };

    return {
      text: breakdowns[character.id] || "I can't take this anymore!",
      tone: "Breaking down",
      stressIndicators: ["Voice cracking", "Physical agitation", "Tears forming"],
      revealedClues: [character.knownSecrets[0]]
    };
  }

  private generateDeflectionResponse(character: Character, evidence: Evidence): DialogueResponse {
    return {
      text: `I don't know anything about ${evidence.name}...`,
      tone: "Defensive",
      stressIndicators: ["Avoiding eye contact", "Changing subject"],
      revealedClues: []
    };
  }

  private checkForRevealedClues(character: Character, stressLevel: number): string[] {
    if (stressLevel > 75) {
      return [character.knownSecrets[0]];
    }
    return [];
  }

  public startDialogue(characterId: string): { text: string; options: DialogueOption[] } | null {
    const character = this.characters.get(characterId);
    if (!character) return null;

    return {
      text: `${character.name}: ${this.getBaseResponse(character, 'greeting')}`,
      options: [
        { text: "Ask about whereabouts", nextId: "whereabouts" },
        { text: "Ask about the victim", nextId: "victim" },
        { text: "Show evidence", nextId: "evidence" }
      ]
    };
  }
} 