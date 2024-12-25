import { Character } from '../types/Character';
import { RACHEL, ROM, ILAN, MICHAL, NETA } from '../data/characters';

export class CharacterManager {
  private characters: Map<string, Character>;

  constructor() {
    this.characters = new Map([
      [RACHEL.id, RACHEL],
      [ROM.id, ROM],
      [ILAN.id, ILAN],
      [MICHAL.id, MICHAL],
      [NETA.id, NETA]
    ]);
  }

  public getCharacter(id: string): Character | undefined {
    return this.characters.get(id);
  }

  public getAllCharacters(): Character[] {
    return Array.from(this.characters.values());
  }

  public updateCharacterLocation(characterId: string, newLocation: string): void {
    const character = this.characters.get(characterId);
    if (character) {
      // Update character location logic here
    }
  }
} 