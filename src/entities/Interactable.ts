import Phaser from 'phaser';
import type { ActionDef } from '../types';
import { TILE } from './Player';

/**
 * Interactable — a labelled colored rectangle in the world that, when the
 * player stands near it, surfaces an action prompt. Placeholder visuals per
 * MVP scope.
 */
export class Interactable {
  readonly action: ActionDef;
  readonly rect: Phaser.GameObjects.Rectangle;
  readonly label: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, action: ActionDef, x: number, y: number, w = TILE * 2, h = TILE * 2) {
    this.scene = scene;
    this.action = action;
    this.rect = scene.add.rectangle(x, y, w, h, action.color).setStrokeStyle(2, 0xffffff, 0.4);
    this.label = scene.add.text(x, y - h / 2 - 12, action.name, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5, 1);
  }

  get x(): number { return this.rect.x; }
  get y(): number { return this.rect.y; }

  distanceTo(px: number, py: number): number {
    return Phaser.Math.Distance.Between(px, py, this.x, this.y);
  }

  /** Small flash effect — placeholder for full animation (blueprint: "Animation of inf. actions"). */
  flash(): void {
    this.scene.tweens.add({
      targets: this.rect,
      alpha: { from: 1, to: 0.3 },
      duration: 120,
      yoyo: true,
      repeat: 2,
    });
  }
}
