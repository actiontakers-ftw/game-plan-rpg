import type { StatKey, Stats } from '../types';

export const STAT_ORDER: StatKey[] = ['health', 'wealth', 'relationships'];

export const STAT_META: Record<StatKey, { label: string; color: string; hint: string }> = {
  health: { label: 'Health', color: '#4ade80', hint: 'Action for physical body' },
  wealth: { label: 'Wealth', color: '#60a5fa', hint: 'Mental performance' },
  relationships: { label: 'Relationships', color: '#f472b6', hint: 'Heart & soul' },
};

export const STAT_MIN = 0;
export const STAT_MAX = 100;

export const STARTING_STATS: Stats = {
  health: 40,
  wealth: 40,
  relationships: 40,
};
