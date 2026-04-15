import type { ActionDef, SaveState } from '../types';

/**
 * StreakSystem — increments per-action streaks, detects back-to-back (SS)
 * deep-work chains on the same day, and breaks streaks on negative actions.
 *
 * Note per the blueprint: "SS only for B2B Deep Work" — the SS bonus is
 * exclusively for deep-work repeated on the same day.
 */
export interface LogResult {
  streak: number;
  bonusApplied: boolean;
}

export class StreakSystem {
  constructor(private state: SaveState) {}

  log(action: ActionDef): LogResult {
    const s = this.state;
    const prevCount = s.todayCounts[action.id] ?? 0;
    s.todayCounts[action.id] = prevCount + 1;

    let bonusApplied = false;

    if (action.kind === 'input') {
      s.streaks[action.id] = (s.streaks[action.id] ?? 0) + 1;
      if (
        action.backToBackBonus &&
        s.lastActionToday === action.id &&
        prevCount >= 1
      ) {
        bonusApplied = true;
      }
    } else if (action.kind === 'negative') {
      // Negative actions break all positive streaks — honesty matters.
      for (const key of Object.keys(s.streaks)) {
        s.streaks[key] = 0;
      }
    }

    s.lastActionToday = action.id;
    return { streak: s.streaks[action.id] ?? 0, bonusApplied };
  }
}
