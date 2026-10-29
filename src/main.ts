import { ThreeRenderer } from './renderer/ThreeRenderer';
import { Room3D } from './renderer/Room3D';
import { Character3D } from './renderer/Character3D';
import { Interactable3D } from './renderer/Interactable3D';
import { HUDOverlay } from './ui/HUDOverlay';
import { SaveSystem } from './systems/SaveSystem';
import { StatsSystem } from './systems/StatsSystem';
import { StreakSystem } from './systems/StreakSystem';
import { DayCycle } from './systems/DayCycle';
import { ACTIONS } from './config/actions';
import type { ActionDef } from './types';

const saveSystem = new SaveSystem();
const state = saveSystem.load();
const statsSystem = new StatsSystem(state);
const streakSystem = new StreakSystem(state);
const dayCycle = new DayCycle(state);

const gameContainer = document.getElementById('game')!;
const hudContainer = document.getElementById('hud')!;

const renderer = new ThreeRenderer(gameContainer);
new Room3D(renderer.scene);
const character = new Character3D(renderer.scene);
const interactable = new Interactable3D(renderer.scene, ACTIONS);
const hud = new HUDOverlay(hudContainer, state);

function handleAction(action: ActionDef): void {
  if (action.perDayLimit !== undefined) {
    const count = state.todayCounts[action.id] ?? 0;
    if (count >= action.perDayLimit) {
      hud.showFloatingText(`Max ${action.perDayLimit}/day reached`, '#ff9966');
      return;
    }
  }

  const confirmed = window.confirm(action.confirm);
  if (!confirmed) return;

  if (action.id === 'sleep') {
    const newDay = dayCycle.advance();
    saveSystem.save(state);
    hud.update(state);
    hud.showFloatingText(`Day ${newDay} begins — rest well`, '#aaddff');
    return;
  }

  const { bonusApplied } = streakSystem.log(action);
  statsSystem.applyDelta(action.delta);
  if (bonusApplied) statsSystem.applyDelta({ wealth: 3 });

  state.history.push({ day: state.day, actionId: action.id, at: Date.now() });
  if (state.history.length > 500) state.history.splice(0, state.history.length - 500);

  saveSystem.save(state);
  hud.update(state);

  const parts: string[] = [];
  for (const [k, v] of Object.entries(action.delta) as [string, number][]) {
    if (v !== 0) parts.push(`${v > 0 ? '+' : ''}${v} ${k}`);
  }
  if (bonusApplied) parts.push('+3 wealth (B2B!)');
  const msg = parts.length ? parts.join('  ') : action.name;
  const color = action.kind === 'negative' ? '#ff6666' : '#66ff99';
  hud.showFloatingText(msg, color);
}

interactable.onTrigger = handleAction;
interactable.onProximity = (action) => hud.setPrompt(action);

renderer.setAnimationLoop((dt) => {
  character.update(dt);
  const pos = character.position;
  interactable.update(pos);
  renderer.followCharacter(pos.x, pos.z, dt);
});
