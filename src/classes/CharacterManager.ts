class CharacterManager {
  private characters: Map<string, Character> = new Map();

  addCharacter(character: Character): void {
    this.characters.set(character.id, character);
  }

  getCharacterTestimony(characterId: string): string[] {
    return this.characters.get(characterId)?.testimony || [];
  }

  checkTestimonyTruth(characterId: string, testimonyIndex: number): boolean {
    const character = this.characters.get(characterId);
    return character ? !character.isLying[testimonyIndex] : false;
  }

  getRelationship(character1Id: string, character2Id: string): Relationship | null {
    const character = this.characters.get(character1Id);
    return character?.relationships.get(character2Id) || null;
  }

  updateCharacterLocation(characterId: string, newLocation: Location): void {
    const character = this.characters.get(characterId);
    if (character) {
      character.location = newLocation;
    }
  }
} 