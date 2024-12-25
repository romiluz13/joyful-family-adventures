import { Evidence } from '../types/Evidence';
import { Location } from '../types/Character';

export class EvidenceManager {
  private discoveredEvidence: Evidence[] = [];
  private evidenceByLocation: Map<Location, Evidence[]> = new Map();

  constructor() {
    this.initializeEvidence();
  }

  private initializeEvidence(): void {
    // Initialize evidence for each location
    this.evidenceByLocation.set(Location.STUDY, [
      {
        id: 'evidence_001',
        name: 'Threatening Letter',
        description: 'A crumpled letter with threatening content',
        location: Location.STUDY,
        type: 'DOCUMENT',
        relatedCharacters: ['rom_01'],
        contradicts: ['Had a good relationship with the victim']
      }
    ]);
    // Add more evidence for other locations...
  }

  public searchLocation(location: Location): Evidence[] {
    const evidence = this.evidenceByLocation.get(location) || [];
    const newEvidence = evidence.filter(e => !this.discoveredEvidence.includes(e));
    this.discoveredEvidence.push(...newEvidence);
    return newEvidence;
  }

  public getDiscoveredEvidence(): Evidence[] {
    return this.discoveredEvidence;
  }
} 