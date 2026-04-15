import { describe, it, expect } from 'vitest';
import { migrate, freshSave, CURRENT_SCHEMA } from '../src/systems/SaveSystem';

describe('SaveSystem migrations', () => {
  it('fresh save has current schema', () => {
    expect(freshSave().schemaVersion).toBe(CURRENT_SCHEMA);
  });

  it('upgrades a v1 save to current schema without wiping stats/streaks', () => {
    const v1 = {
      schemaVersion: 1,
      day: 7,
      stats: { health: 55, wealth: 62, relationships: 48 },
      streaks: { deep_work: 3, gym: 2 },
      history: [{ day: 1, actionId: 'gym', at: 1000 }],
    };
    const out = migrate(v1);
    expect(out.schemaVersion).toBe(CURRENT_SCHEMA);
    expect(out.day).toBe(7);
    expect(out.stats).toEqual({ health: 55, wealth: 62, relationships: 48 });
    expect(out.streaks).toEqual({ deep_work: 3, gym: 2 });
    expect(out.todayCounts).toEqual({});
    expect(out.lastActionToday).toBeNull();
    expect(out.history).toHaveLength(1);
  });

  it('patches partially malformed saves instead of wiping them', () => {
    const broken = { day: 12, stats: { wealth: 70 } };
    const out = migrate(broken);
    expect(out.day).toBe(12);
    expect(out.stats.wealth).toBe(70);
    // Missing stat keys fall back to starting defaults, not zero.
    expect(out.stats.health).toBeGreaterThan(0);
    expect(out.streaks).toEqual({});
  });

  it('treats null/undefined as a fresh save without throwing', () => {
    expect(() => migrate(null)).not.toThrow();
    expect(() => migrate(undefined)).not.toThrow();
  });
});
