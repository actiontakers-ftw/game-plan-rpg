import { describe, it, expect } from 'vitest';
import { StatsSystem, clamp } from '../src/systems/StatsSystem';
import { freshSave } from '../src/systems/SaveSystem';

describe('StatsSystem', () => {
  it('clamps at upper bound', () => {
    expect(clamp(150)).toBe(100);
  });

  it('clamps at lower bound', () => {
    expect(clamp(-10)).toBe(0);
  });

  it('applies positive deltas and returns actual applied change', () => {
    const state = freshSave();
    const sys = new StatsSystem(state);
    const start = state.stats.wealth;
    const applied = sys.applyDelta({ wealth: 10 });
    expect(state.stats.wealth).toBe(start + 10);
    expect(applied.wealth).toBe(10);
  });

  it('reports partial application when hitting the cap', () => {
    const state = freshSave();
    state.stats.health = 95;
    const sys = new StatsSystem(state);
    const applied = sys.applyDelta({ health: 20 });
    expect(state.stats.health).toBe(100);
    expect(applied.health).toBe(5);
  });

  it('does not mutate stats when delta is zero', () => {
    const state = freshSave();
    const before = { ...state.stats };
    new StatsSystem(state).applyDelta({});
    expect(state.stats).toEqual(before);
  });
});
