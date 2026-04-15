import type { SaveState } from '../types';

/**
 * DayCycle — advances the in-game day (triggered by Sleep) and resets daily
 * action counts. Does not mutate stats or streaks directly.
 */
export class DayCycle {
  constructor(private state: SaveState) {}

  advance(): number {
    this.state.day += 1;
    this.state.todayCounts = {};
    this.state.lastActionToday = null;
    return this.state.day;
  }
}
