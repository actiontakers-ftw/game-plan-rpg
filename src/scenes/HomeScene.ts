import Phaser from 'phaser';
import { Player, TILE } from '../entities/Player';
import { Interactable } from '../entities/Interactable';
import { ACTIONS, ACTION_BY_ID } from '../config/actions';
import type { ActionDef, SaveState } from '../types';
import { SaveSystem } from '../systems/SaveSystem';
import { StatsSystem } from '../systems/StatsSystem';
import { StreakSystem } from '../systems/StreakSystem';
import { DayCycle } from '../systems/DayCycle';
import { ActionPrompt, confirmDialog } from '../ui/ActionPrompt';
import { floatingText } from '../ui/FloatingText';
import { STAT_META } from '../config/stats';

const WORLD_W = 960;
const WORLD_H = 640;
const INTERACT_RADIUS = 48;

/**
 * HomeScene — single map with three rooms + a gym fast-travel tile. Walls are
 * static physics rectangles. Interactables are placeholder colored boxes.
 */
export class HomeScene extends Phaser.Scene {
  private player!: Player;
  private interactables: Interactable[] = [];
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private prompt!: ActionPrompt;
  private nearest: Interactable | null = null;
  private eKey!: Phaser.Input.Keyboard.Key;
  private bKey!: Phaser.Input.Keyboard.Key;
  private lKey!: Phaser.Input.Keyboard.Key;

  private save!: SaveSystem;
  private state!: SaveState;
  private stats!: StatsSystem;
  private streaks!: StreakSystem;
  private dayCycle!: DayCycle;

  constructor() {
    super('HomeScene');
  }

  create(): void {
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.add.rectangle(0, 0, WORLD_W, WORLD_H, 0x0f172a).setOrigin(0, 0);

    this.save = new SaveSystem();
    this.state = this.save.load();
    this.stats = new StatsSystem(this.state);
    this.streaks = new StreakSystem(this.state);
    this.dayCycle = new DayCycle(this.state);

    this.scene.launch('UIScene', { state: this.state });

    this.buildRooms();
    this.buildInteractables();

    this.player = new Player(this, 100, 100);
    this.physics.add.collider(this.player.sprite, this.walls);

    this.prompt = new ActionPrompt(this);
    this.eKey = this.input.keyboard!.addKey('E');
    this.bKey = this.input.keyboard!.addKey('B');
    this.lKey = this.input.keyboard!.addKey('L');
  }

  private buildRooms(): void {
    this.walls = this.physics.add.staticGroup();
    // Outer walls
    const addWall = (x: number, y: number, w: number, h: number) => {
      const r = this.add.rectangle(x, y, w, h, 0x1e293b).setOrigin(0, 0).setStrokeStyle(1, 0x334155);
      this.physics.add.existing(r, true);
      this.walls.add(r);
    };
    const T = 16;
    addWall(0, 0, WORLD_W, T);
    addWall(0, WORLD_H - T, WORLD_W, T);
    addWall(0, 0, T, WORLD_H);
    addWall(WORLD_W - T, 0, T, WORLD_H);

    // Vertical divider between Bedroom (left) and Living Room (middle), with door gap
    addWall(320, T, T, 220);
    addWall(320, 300, T, WORLD_H - 300 - T);

    // Vertical divider between Living Room and Kitchen, with door gap
    addWall(640, T, T, 220);
    addWall(640, 300, T, WORLD_H - 300 - T);

    // Horizontal strip to mark "Gym" tile on the bottom right
    addWall(660, 430, 280, T);

    // Room labels
    this.add.text(20, 24, 'Bedroom', { fontSize: '12px', color: '#94a3b8' });
    this.add.text(340, 24, 'Living Room', { fontSize: '12px', color: '#94a3b8' });
    this.add.text(660, 24, 'Kitchen', { fontSize: '12px', color: '#94a3b8' });
    this.add.text(680, 448, 'Gym (fast travel tile)', { fontSize: '12px', color: '#94a3b8' });
  }

  private buildInteractables(): void {
    // Bedroom: desk (deep work), bed (sleep), phone (doomscroll)
    this.place('deep_work', 80, 180, TILE * 2, TILE);
    this.place('sleep', 240, 180, TILE * 2, TILE * 1.5);
    this.place('doomscroll', 80, 340, TILE, TILE);

    // Living Room: couch (talk family), mat (meditate), balcony (smoke)
    this.place('talk_family', 400, 200, TILE * 2.5, TILE);
    this.place('meditate', 520, 380, TILE * 1.5, TILE * 1.5);
    this.place('smoke', 420, 540, TILE * 1.5, TILE);

    // Kitchen: cook
    this.place('cook', 760, 200, TILE * 2, TILE * 1.5);

    // Gym tile
    this.place('gym', 800, 520, TILE * 2.5, TILE * 1.5);
  }

  private place(id: string, x: number, y: number, w: number, h: number): void {
    const action = ACTION_BY_ID[id];
    if (!action) return;
    this.interactables.push(new Interactable(this, action, x, y, w, h));
  }

  update(): void {
    this.player.update();

    // Find nearest interactable within radius
    let best: Interactable | null = null;
    let bestDist = INTERACT_RADIUS;
    for (const obj of this.interactables) {
      const d = obj.distanceTo(this.player.x, this.player.y);
      if (d < bestDist) {
        bestDist = d;
        best = obj;
      }
    }
    this.nearest = best;

    if (this.nearest) {
      this.prompt.show(this.nearest.x, this.nearest.y - 38, this.nearest.action.prompt);
    } else {
      this.prompt.hide();
    }

    if (Phaser.Input.Keyboard.JustDown(this.eKey) && this.nearest) {
      this.tryAction(this.nearest);
    }

    if (Phaser.Input.Keyboard.JustDown(this.bKey)) {
      this.downloadBackup();
    }
    if (Phaser.Input.Keyboard.JustDown(this.lKey)) {
      this.uploadBackup();
    }
  }

  private tryAction(obj: Interactable): void {
    const action = obj.action;
    if (action.perDayLimit !== undefined) {
      const used = this.state.todayCounts[action.id] ?? 0;
      if (used >= action.perDayLimit) {
        floatingText(this, obj.x, obj.y, 'already done today', '#fca5a5');
        return;
      }
    }
    if (!confirmDialog(action.confirm)) return;

    obj.flash();

    if (action.id === 'sleep') {
      const day = this.dayCycle.advance();
      floatingText(this, obj.x, obj.y, `Day ${day}`, '#a5f3fc');
      this.save.save(this.state);
      this.game.events.emit('state-changed');
      return;
    }

    // Record the log first so B2B detection uses the prior lastActionToday.
    const streakResult = this.streaks.log(action);

    // Apply the delta — Dundee rule: only via this path.
    let delta = { ...action.delta };
    if (streakResult.bonusApplied) {
      // SS super-streak bonus for back-to-back Deep Work on the same day.
      delta = { ...delta, wealth: (delta.wealth ?? 0) + 3 };
    }
    const applied = this.stats.applyDelta(delta);

    // Log to history (trim to last 500 to keep save small).
    this.state.history.push({ day: this.state.day, actionId: action.id, at: Date.now() });
    if (this.state.history.length > 500) {
      this.state.history.splice(0, this.state.history.length - 500);
    }

    this.save.save(this.state);
    this.game.events.emit('state-changed');

    this.renderAppliedDeltas(obj, applied, streakResult.bonusApplied);
  }

  private renderAppliedDeltas(
    obj: Interactable,
    applied: Partial<Record<'health' | 'wealth' | 'relationships', number>>,
    ssBonus: boolean,
  ): void {
    let offset = 0;
    for (const [key, value] of Object.entries(applied)) {
      if (!value) continue;
      const meta = STAT_META[key as 'health' | 'wealth' | 'relationships'];
      const sign = value > 0 ? '+' : '';
      floatingText(this, obj.x, obj.y - offset, `${sign}${value} ${meta.label}`, meta.color);
      offset += 18;
    }
    if (ssBonus) {
      floatingText(this, obj.x, obj.y - offset - 8, 'SS! B2B Deep Work', '#fde047');
    }
  }

  private downloadBackup(): void {
    const json = this.save.export(this.state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `game-plan-rpg-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    floatingText(this, this.player.x, this.player.y, 'backup downloaded', '#a5f3fc');
  }

  private uploadBackup(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const migrated = this.save.import(text);
        // Replace state refs in-place so systems keep working.
        Object.assign(this.state, migrated);
        this.game.events.emit('state-changed');
        floatingText(this, this.player.x, this.player.y, 'backup loaded', '#a5f3fc');
      } catch (err) {
        console.warn('import failed', err);
        floatingText(this, this.player.x, this.player.y, 'import failed', '#fca5a5');
      }
    };
    input.click();
  }

  // Keep reference to silence unused import lint if ACTIONS becomes unused.
  protected _allActions(): ActionDef[] { return ACTIONS; }
}
