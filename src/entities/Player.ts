import Phaser from 'phaser';

export const TILE = 32;
const SPEED = 160;

export class Player {
  readonly sprite: Phaser.GameObjects.Rectangle;
  private body: Phaser.Physics.Arcade.Body;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.rectangle(x, y, TILE - 6, TILE - 6, 0xfde047);
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys('W,A,S,D') as typeof this.wasd;
  }

  update(): void {
    let vx = 0;
    let vy = 0;
    if (this.cursors.left?.isDown || this.wasd.A.isDown) vx -= SPEED;
    if (this.cursors.right?.isDown || this.wasd.D.isDown) vx += SPEED;
    if (this.cursors.up?.isDown || this.wasd.W.isDown) vy -= SPEED;
    if (this.cursors.down?.isDown || this.wasd.S.isDown) vy += SPEED;
    this.body.setVelocity(vx, vy);
  }

  get x(): number { return this.sprite.x; }
  get y(): number { return this.sprite.y; }
}
