import Phaser from 'phaser';
import { STAT_MAX } from '../config/stats';

export class StatBar {
  private fill: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private width: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    labelText: string,
    color: string,
  ) {
    this.width = width;
    scene.add.rectangle(x, y, width, 14, 0x222222).setOrigin(0, 0.5).setStrokeStyle(1, 0x444444);
    this.fill = scene.add.rectangle(x, y, width, 14, Phaser.Display.Color.HexStringToColor(color).color).setOrigin(0, 0.5);
    this.label = scene.add.text(x, y - 10, labelText, {
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0, 1);
  }

  setValue(value: number): void {
    const ratio = Math.max(0, Math.min(1, value / STAT_MAX));
    this.fill.width = this.width * ratio;
    this.label.setText(`${this.label.text.split(':')[0]}: ${Math.round(value)}`);
  }

  setLabel(text: string): void {
    this.label.setText(text);
  }
}
