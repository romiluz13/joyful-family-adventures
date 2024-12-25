export class TimeManager {
  private currentTime: TimeState;

  constructor() {
    this.currentTime = {
      day: 1,
      period: TimePeriod.MORNING,
      timestamp: "09:00"
    };
  }

  public advance(): void {
    const periods = Object.values(TimePeriod);
    const currentIndex = periods.indexOf(this.currentTime.period);
    
    if (currentIndex === periods.length - 1) {
      this.currentTime.day++;
      this.currentTime.period = periods[0];
    } else {
      this.currentTime.period = periods[currentIndex + 1];
    }

    this.updateTimestamp();
  }

  private updateTimestamp(): void {
    const timeMap = {
      [TimePeriod.EARLY_MORNING]: "06:00",
      [TimePeriod.MORNING]: "09:00",
      [TimePeriod.AFTERNOON]: "14:00",
      [TimePeriod.EVENING]: "18:00",
      [TimePeriod.NIGHT]: "22:00"
    };

    this.currentTime.timestamp = timeMap[this.currentTime.period];
  }
} 