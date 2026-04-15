import type { SaveState, Stats } from '../types';
import { STARTING_STATS } from '../config/stats';

/**
 * SaveSystem — persists game state to localStorage with schema versioning.
 *
 * Upgrade guarantee: when the game gains new fields in a later version, we add
 * a migration here that upgrades old saves in-place. Saves are NEVER wiped on
 * version bumps. The player's streaks and history survive all updates.
 *
 * Export/Import lets the player keep a portable backup file immune to browser
 * cache clears, device switches, and incognito mode.
 */

export const STORAGE_KEY = 'gamePlanRPG.save.v1';
export const CURRENT_SCHEMA = 2;

export function freshSave(): SaveState {
  return {
    schemaVersion: CURRENT_SCHEMA,
    day: 1,
    stats: { ...STARTING_STATS },
    streaks: {},
    todayCounts: {},
    lastActionToday: null,
    history: [],
  };
}

/**
 * Run forward migrations on an older save object. Each case falls through so a
 * v0 save walks through every bump on its way to CURRENT_SCHEMA.
 */
export function migrate(raw: unknown): SaveState {
  // Any is unavoidable here — we're reading untyped persisted data.
  const data = (raw ?? {}) as Record<string, unknown> & Partial<SaveState>;
  let version = typeof data.schemaVersion === 'number' ? data.schemaVersion : 1;

  // v1 -> v2: ensure todayCounts + lastActionToday exist (added for B2B tracking).
  if (version < 2) {
    if (!data.todayCounts || typeof data.todayCounts !== 'object') {
      data.todayCounts = {};
    }
    if (data.lastActionToday === undefined) {
      data.lastActionToday = null;
    }
    version = 2;
  }

  // Always patch missing top-level fields defensively, so malformed saves still
  // load rather than wiping the player's progress.
  const fresh = freshSave();
  const merged: SaveState = {
    schemaVersion: CURRENT_SCHEMA,
    day: typeof data.day === 'number' ? data.day : fresh.day,
    stats: mergeStats(data.stats as Partial<Stats> | undefined, fresh.stats),
    streaks: (data.streaks as Record<string, number> | undefined) ?? {},
    todayCounts: (data.todayCounts as Record<string, number> | undefined) ?? {},
    lastActionToday: (data.lastActionToday as string | null | undefined) ?? null,
    history: Array.isArray(data.history) ? data.history : [],
  };
  merged.schemaVersion = CURRENT_SCHEMA;
  return merged;

  function mergeStats(partial: Partial<Stats> | undefined, base: Stats): Stats {
    return {
      health: partial?.health ?? base.health,
      wealth: partial?.wealth ?? base.wealth,
      relationships: partial?.relationships ?? base.relationships,
    };
  }
}

export class SaveSystem {
  load(): SaveState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshSave();
      return migrate(JSON.parse(raw));
    } catch (err) {
      console.warn('[SaveSystem] load failed, using fresh save', err);
      return freshSave();
    }
  }

  save(state: SaveState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('[SaveSystem] save failed', err);
    }
  }

  reset(): SaveState {
    const s = freshSave();
    this.save(s);
    return s;
  }

  /** Returns a JSON string for download as a backup file. */
  export(state: SaveState): string {
    return JSON.stringify(state, null, 2);
  }

  /** Parses and migrates an imported backup, then persists it. Returns the new state. */
  import(json: string): SaveState {
    const parsed = JSON.parse(json);
    const migrated = migrate(parsed);
    this.save(migrated);
    return migrated;
  }
}
