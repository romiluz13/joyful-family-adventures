import { NotebookEntry } from '../types/GameState';

export class NotebookManager {
  private entries: NotebookEntry[] = [];

  public addEntry(entry: NotebookEntry): void {
    this.entries.push(entry);
  }

  public getEntriesByTag(tag: string): NotebookEntry[] {
    return this.entries.filter(entry => entry.tags.includes(tag));
  }

  public getAllEntries(): NotebookEntry[] {
    return this.entries;
  }
} 