import type { ActionDef } from '../types';

/**
 * MVP action set (8 of the 18 in the blueprint). Data-driven — adding actions
 * later means appending to this list; no engine code changes required.
 *
 * Reward Logic (Dundee rule): only `kind: 'input'` actions grant positive
 * stats. Negative actions are logged for honesty. System actions advance state.
 */
export const ACTIONS: ActionDef[] = [
  {
    id: 'deep_work',
    name: 'Deep Work',
    kind: 'input',
    location: 'desk',
    delta: { wealth: 6 },
    backToBackBonus: true,
    prompt: 'Press [E] — Deep Work',
    confirm: 'Did you actually do a focused deep-work block?',
    color: 0x2563eb,
  },
  {
    id: 'gym',
    name: 'Gym / Workout',
    kind: 'input',
    location: 'gym',
    delta: { health: 7 },
    perDayLimit: 2,
    prompt: 'Press [E] — Workout',
    confirm: 'Did you actually train today?',
    color: 0x16a34a,
  },
  {
    id: 'meditate',
    name: 'Meditate',
    kind: 'input',
    location: 'mat',
    delta: { health: 2, relationships: 2 },
    perDayLimit: 2,
    prompt: 'Press [E] — Meditate',
    confirm: 'Did you actually sit and meditate?',
    color: 0xa78bfa,
  },
  {
    id: 'cook',
    name: 'Cook',
    kind: 'input',
    location: 'kitchen',
    delta: { health: 3, wealth: 1 },
    perDayLimit: 3,
    prompt: 'Press [E] — Cook',
    confirm: 'Did you actually cook a real meal?',
    color: 0xf59e0b,
  },
  {
    id: 'talk_family',
    name: 'Talk to Family',
    kind: 'input',
    location: 'couch',
    delta: { relationships: 6 },
    perDayLimit: 1,
    prompt: 'Press [E] — Call family',
    confirm: 'Did you actually call or visit family?',
    color: 0xec4899,
  },
  {
    id: 'sleep',
    name: 'Sleep',
    kind: 'system',
    location: 'bed',
    delta: {},
    prompt: 'Press [E] — Sleep (end day)',
    confirm: 'End the day and sleep?',
    color: 0x64748b,
  },
  {
    id: 'smoke',
    name: 'Smoke',
    kind: 'negative',
    location: 'balcony',
    delta: { health: -5, wealth: -2 },
    prompt: 'Press [E] — Smoke',
    confirm: 'Be honest — are you logging a smoke?',
    color: 0x7f1d1d,
  },
  {
    id: 'doomscroll',
    name: 'Overthink / Doomscroll',
    kind: 'negative',
    location: 'phone',
    delta: { wealth: -3 },
    prompt: 'Press [E] — Doomscroll',
    confirm: 'Logging a doomscroll session?',
    color: 0x52525b,
  },
];

export const ACTION_BY_ID: Record<string, ActionDef> = Object.fromEntries(
  ACTIONS.map((a) => [a.id, a]),
);
