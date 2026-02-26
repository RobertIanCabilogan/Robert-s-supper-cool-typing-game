export class Start extends Phaser.Scene {
  constructor() {
    super('Start');
  }

create() {
    this.cameras.main.setBackgroundColor('#1C1D23');

    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 150, 'Robert\'s Supper Cool Typing Gaming', {
    fontSize: '32px',
    fill: '#ffffff'
    }).setOrigin(0.5);

    const button = this.add.container(width / 2, height / 2);

    const bg = this.add.rectangle(0, 0, 300, 70, 0x000000)
    .setStrokeStyle(3, 0x000000);

    const label = this.add.text(0, 0, 'START GAME', {
    fontSize: '28px',
    fill: '#ffffff'
    }).setOrigin(0.5);

    button.add([bg, label]);

    bg.setInteractive({ useHandCursor: true });

    bg
      .on('pointerover', () => {
      bg.setFillStyle(0x333333);
      button.setScale(1.05);
      })
      .on('pointerout', () => {
      bg.setFillStyle(0x000000);
      button.setScale(1);
      })
      .on('pointerdown', () => {
        this.scene.start('MainGame');
    });
  }
}