import Phaser from 'phaser';
import type { SaveState, StatKey } from '../types';
import { STAT_META, STAT_ORDER } from '../config/stats';
import { StatBar } from '../ui/StatBar';

export class UIScene extends Phaser.Scene {
  private bars: Record<StatKey, StatBar> = {} as Record<StatKey, StatBar>;
  private dayText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private state!: SaveState;

  constructor() {
    super('UIScene');
  }

  init(data: { state: SaveState }): void {
    this.state = data.state;
  }

  create(): void {
    const panelX = 12;
    let y = 20;

    this.dayText = this.add.text(panelX, y, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    y += 26;

    for (const key of STAT_ORDER) {
      const meta = STAT_META[key];
      this.bars[key] = new StatBar(this, panelX, y + 4, 200, meta.label, meta.color);
      y += 26;
    }

    this.streakText = this.add.text(panelX, y + 4, '', {
      fontSize: '12px',
      color: '#fde047',
    });

    this.hintText = this.add.text(panelX, (this.scale.height - 28), 'WASD/arrows to move  •  [E] interact  •  [B] backup save  •  [L] load backup', {
      fontSize: '11px',
      color: '#94a3b8',
    });

    this.refresh();

    this.game.events.on('state-changed', () => this.refresh());
  }

  private refresh(): void {
    this.dayText.setText(`Day ${this.state.day}`);
    for (const key of STAT_ORDER) {
      this.bars[key].setValue(this.state.stats[key]);
    }
    const streaks = Object.entries(this.state.streaks)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([k, v]) => `${k}:${v}`)
      .join('  ');
    this.streakText.setText(streaks ? `Streaks  ${streaks}` : 'Streaks  —');
  }

  // Keep hintText pinned on resize.
  shutdown(): void {
    this.game.events.off('state-changed');
    this.hintText?.destroy();
  }
}
