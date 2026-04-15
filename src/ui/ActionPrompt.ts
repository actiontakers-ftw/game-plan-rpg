import Phaser from 'phaser';

export class ActionPrompt {
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(0, 0, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 1).setDepth(100).setVisible(false);
  }

  show(x: number, y: number, prompt: string): void {
    this.text.setText(prompt);
    this.text.setPosition(x, y);
    this.text.setVisible(true);
  }

  hide(): void {
    this.text.setVisible(false);
  }
}

/**
 * confirmDialog — a plain browser confirm(), deliberately. The Dundee rule
 * requires a moment of honesty: a flashy in-game dialog is easy to click past;
 * the native confirm pops you out of the game momentarily, which is the point.
 */
export function confirmDialog(message: string): boolean {
  return window.confirm(message);
}
