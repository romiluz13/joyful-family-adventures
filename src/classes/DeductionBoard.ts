import { DeductionChain } from '../types/GameState';

export class DeductionBoard {
  private theories: DeductionChain[] = [];

  public createTheory(theory: DeductionChain): void {
    this.theories.push(theory);
  }

  public getTheories(): DeductionChain[] {
    return this.theories;
  }

  public updateTheory(theoryId: string, updates: Partial<DeductionChain>): void {
    const index = this.theories.findIndex(t => t.id === theoryId);
    if (index !== -1) {
      this.theories[index] = { ...this.theories[index], ...updates };
    }
  }
} 