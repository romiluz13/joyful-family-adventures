interface TimeState {
  day: number;
  period: TimePeriod;
  timestamp: string;  // Format: "HH:MM"
}

enum TimePeriod {
  EARLY_MORNING = 'early_morning',  // 6:00-9:00
  MORNING = 'morning',              // 9:00-12:00
  AFTERNOON = 'afternoon',          // 12:00-17:00
  EVENING = 'evening',              // 17:00-21:00
  NIGHT = 'night'                   // 21:00-6:00
}

interface Timeline {
  events: TimelineEvent[];
  characterMovements: CharacterMovement[];
}

interface TimelineEvent {
  timestamp: string;
  location: Location;
  description: string;
  witnesses: string[];  // Character IDs
  isHidden: boolean;    // Some events are discovered during investigation
} 