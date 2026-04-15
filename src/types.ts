// Shared types for the life-sim RPG.

export type StatKey = 'health' | 'wealth' | 'relationships';

export type Stats = Record<StatKey, number>;

export type StatDelta = Partial<Stats>;

export type ActionKind = 'input' | 'negative' | 'system';

/**
 * An action that the player can log from the world.
 *
 * Dundee rule: only `input` actions grant positive stat deltas.
 * `negative` actions are logged for honesty and may reduce stats.
 * `system` actions (e.g., Sleep) advance game state without rewards.
 */
export interface ActionDef {
  id: string;
  name: string;
  kind: ActionKind;
  /** Where in the world this action is triggered. */
  location: string;
  /** Stat changes applied on confirm. */
  delta: StatDelta;
  /** Max times per in-game day. Omit for unlimited. */
  perDayLimit?: number;
  /** If true, back-to-back same-day repeats get an SS (super-streak) bonus. */
  backToBackBonus?: boolean;
  /** Prompt text shown to the player. */
  prompt: string;
  /** Confirm dialog copy — enforces the "did you actually do this" gate. */
  confirm: string;
  /** Display color for the interactable rectangle. */
  color: number;
}

export interface HistoryEntry {
  day: number;
  actionId: string;
  at: number; // ms timestamp
}

export interface SaveState {
  schemaVersion: number;
  day: number;
  stats: Stats;
  streaks: Record<string, number>;
  /** Counts of each action performed on the current day. */
  todayCounts: Record<string, number>;
  /** Most recent action id logged today (for B2B detection). */
  lastActionToday: string | null;
  history: HistoryEntry[];
}
