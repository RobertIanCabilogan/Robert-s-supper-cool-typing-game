export default class Turret {
  constructor(scene, x, y) {
    this.scene = scene;

    this.sprite = scene.add.sprite(x, y, 'turret', 1).setOrigin(0.5).setScale(0.3).setDepth(10);
    this.sprite.setOrigin(0.5, 0.5);

    this.target = null;
  }

  setTarget(word) {
    this.target = word;
  }

  clearTarget() {
    this.target = null;
  }

  update() {
    if (!this.target || !this.target.active) return;

    const angle = Phaser.Math.Angle.Between(
    this.sprite.x,
    this.sprite.y,
    this.target.x,
    this.target.y
    );

    this.sprite.setRotation(angle);

    this.sprite.setRotation(angle + this.rotationOffset);
    this.rotationOffset = Math.PI / 2;
  }

  fire() {
    if (!this.target || !this.target.active) return;

    this.sprite.play('turret-fire');

    this.createLaser(this.target);
    this.scene.events.emit('word-hit', this.target);
    
    this.scene.wordSpawner.removeWord(this.target);
    this.clearTarget();
  }

  createLaser(target) {
    const laser = this.scene.add.line(
      0,
      0,
      this.sprite.x,
      this.sprite.y,
      target.x,
      target.y,
      0xffffff
    ).setOrigin(0, 0).setLineWidth(6).setDepth(1);

    this.scene.time.delayedCall(100, () => {
      laser.destroy();
    });
  }
}