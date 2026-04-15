import { describe, it, expect } from 'vitest';
import { StreakSystem } from '../src/systems/StreakSystem';
import { freshSave } from '../src/systems/SaveSystem';
import { ACTION_BY_ID } from '../src/config/actions';

describe('StreakSystem', () => {
  it('increments streak on input action', () => {
    const state = freshSave();
    const s = new StreakSystem(state);
    const r = s.log(ACTION_BY_ID.deep_work);
    expect(r.streak).toBe(1);
    expect(r.bonusApplied).toBe(false);
  });

  it('awards B2B bonus only for consecutive same-day Deep Work', () => {
    const state = freshSave();
    const s = new StreakSystem(state);
    s.log(ACTION_BY_ID.deep_work);
    const r2 = s.log(ACTION_BY_ID.deep_work);
    expect(r2.bonusApplied).toBe(true);
  });

  it('does not award B2B if a different action is logged in between', () => {
    const state = freshSave();
    const s = new StreakSystem(state);
    s.log(ACTION_BY_ID.deep_work);
    s.log(ACTION_BY_ID.cook);
    const r3 = s.log(ACTION_BY_ID.deep_work);
    expect(r3.bonusApplied).toBe(false);
  });

  it('breaks all streaks on negative action (smoke)', () => {
    const state = freshSave();
    const s = new StreakSystem(state);
    s.log(ACTION_BY_ID.deep_work);
    s.log(ACTION_BY_ID.gym);
    s.log(ACTION_BY_ID.smoke);
    expect(state.streaks.deep_work).toBe(0);
    expect(state.streaks.gym).toBe(0);
  });
});
