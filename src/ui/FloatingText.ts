import Phaser from 'phaser';

export function floatingText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  color = '#ffffff',
): void {
  const t = scene.add.text(x, y, text, {
    fontSize: '16px',
    fontStyle: 'bold',
    color,
    stroke: '#000000',
    strokeThickness: 3,
  }).setOrigin(0.5);
  scene.tweens.add({
    targets: t,
    y: y - 40,
    alpha: 0,
    duration: 900,
    onComplete: () => t.destroy(),
  });
}
