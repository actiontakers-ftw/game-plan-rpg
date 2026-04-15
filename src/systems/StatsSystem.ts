import type { SaveState, StatDelta, Stats, StatKey } from '../types';
import { STAT_MAX, STAT_MIN } from '../config/stats';

/**
 * StatsSystem — the only path for stat changes. Enforces the Dundee rule:
 * only action-driven deltas mutate stats. No threshold-based "achievement"
 * rewards exist; outputs are rewarded in real life, not here.
 */
export class StatsSystem {
  constructor(private state: SaveState) {}

  get stats(): Stats {
    return this.state.stats;
  }

  applyDelta(delta: StatDelta): StatDelta {
    const applied: StatDelta = {};
    for (const key of Object.keys(delta) as StatKey[]) {
      const change = delta[key] ?? 0;
      if (change === 0) continue;
      const next = clamp(this.state.stats[key] + change);
      const actual = next - this.state.stats[key];
      this.state.stats[key] = next;
      applied[key] = actual;
    }
    return applied;
  }
}

export function clamp(v: number): number {
  if (v < STAT_MIN) return STAT_MIN;
  if (v > STAT_MAX) return STAT_MAX;
  return v;
}
