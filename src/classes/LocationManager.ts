export interface RoomDescription {
  description: string;
  searchableAreas: SearchableArea[];
  availableCharacters: string[];
  connectedRooms: Location[];
}

export interface SearchableArea {
  id: string;
  name: string;
  description: string;
  searched: boolean;
  requiresItem?: string;
}

export class LocationManager {
  private locations: Map<Location, RoomDescription> = new Map();
  private currentLocation: Location;

  constructor() {
    this.initializeLocations();
    this.currentLocation = Location.DINING_ROOM;
  }

  private initializeLocations(): void {
    this.locations.set(Location.STUDY, {
      description: "A well-appointed study with mahogany furniture. Books line the walls, and a large desk dominates the room.",
      searchableAreas: [
        {
          id: 'study_desk',
          name: 'Desk',
          description: 'A large mahogany desk with several drawers',
          searched: false
        },
        {
          id: 'study_safe',
          name: 'Wall Safe',
          description: 'A hidden safe behind a painting',
          searched: false,
          requiresItem: 'safe_combination'
        }
      ],
      availableCharacters: [],
      connectedRooms: [Location.LIBRARY, Location.HALLWAY]
    });

    // Library
    this.locations.set(Location.LIBRARY, {
      description: "Rows of leather-bound books fill floor-to-ceiling shelves. A reading area with comfortable chairs sits near a fireplace.",
      searchableAreas: [
        {
          id: 'library_fireplace',
          name: 'Fireplace',
          description: 'A large stone fireplace with fresh ashes',
          searched: false
        },
        {
          id: 'library_desk',
          name: 'Reading Desk',
          description: 'A small desk where the victim was often seen reading',
          searched: false
        }
      ],
      availableCharacters: ['maid_01'],
      connectedRooms: [Location.STUDY, Location.HALLWAY]
    });

    // Dining Room
    this.locations.set(Location.DINING_ROOM, {
      description: "An elegant dining room with a long table that seats twelve. Crystal chandelier casts dancing shadows.",
      searchableAreas: [
        {
          id: 'dining_cabinet',
          name: 'China Cabinet',
          description: 'A cabinet containing fine china and silverware',
          searched: false
        },
        {
          id: 'dining_table',
          name: 'Dining Table',
          description: 'The large dining table where the last meal was served',
          searched: false
        }
      ],
      availableCharacters: ['butler_01'],
      connectedRooms: [Location.KITCHEN, Location.HALLWAY]
    });
  }

  public getCurrentLocation(): Location {
    return this.currentLocation;
  }

  public getLocationDescription(): RoomDescription | undefined {
    return this.locations.get(this.currentLocation);
  }

  public moveToLocation(newLocation: Location): boolean {
    const currentRoom = this.locations.get(this.currentLocation);
    if (currentRoom?.connectedRooms.includes(newLocation)) {
      this.currentLocation = newLocation;
      return true;
    }
    return false;
  }

  public searchArea(areaId: string): SearchResult {
    const room = this.locations.get(this.currentLocation);
    const area = room?.searchableAreas.find(a => a.id === areaId);

    if (!area) {
      return { success: false, message: "Area not found" };
    }

    if (area.searched) {
      return { success: false, message: "This area has already been searched" };
    }

    if (area.requiresItem) {
      // Check if player has required item
      return { success: false, message: `You need ${area.requiresItem} to search this area` };
    }

    area.searched = true;
    return { 
      success: true, 
      message: "Area searched successfully",
      areaDescription: area.description
    };
  }
} 