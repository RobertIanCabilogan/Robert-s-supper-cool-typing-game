export default class EndScreen extends Phaser.Scene {

  constructor() {
    super("EndScreen");
  }

  create(data) {

    const {
      difficulty = "N/A",
      speed = 1,
      score = 0,
      wordsCompleted = 0
    } = data || {};

    this.add.text(640, 120, "GAME OVER YOU SUCK!!!", {
      fontSize: "64px",
      fill: "#ff0000"
    }).setOrigin(0.5);

    this.add.text(640, 220, `Difficulty: ${difficulty}`, {
      fontSize: "32px",
      fill: "#ffffff"
    }).setOrigin(0.5);

    this.add.text(640, 270, `Speed Multiplier: ${speed}`, {
      fontSize: "32px",
      fill: "#ffffff"
    }).setOrigin(0.5);

    this.add.text(640, 320, `Score: ${score}`, {
      fontSize: "32px",
      fill: "#ffffff"
    }).setOrigin(0.5);

    this.add.text(640, 370, `Words Completed: ${wordsCompleted}`, {
      fontSize: "32px",
      fill: "#ffffff"
    }).setOrigin(0.5);

    // Buttons
    this.createButton(640, 480, 300, 70, "TRY AGAIN", () => {
      this.scene.start("MainGame");
    });

    this.createButton(640, 570, 300, 70, "BACK TO MENU", () => {
      this.scene.start("Start");
    });
  }

  createButton(x, y, width, height, label, callback) {

    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, width, height, 0x222222)
      .setStrokeStyle(3, 0xffffff)
      .setOrigin(0.5);

    const text = this.add.text(0, 0, label, {
      fontSize: "32px",
      fill: "#ffffff"
    }).setOrigin(0.5);

    button.add([bg, text]);

    bg.setInteractive({ useHandCursor: true });

    // Hover
    bg.on("pointerover", () => {
      bg.setFillStyle(0x444444);
      button.setScale(1.05);
    });

    bg.on("pointerout", () => {
      bg.setFillStyle(0x222222);
      button.setScale(1);
    });

    // Click
    bg.on("pointerdown", () => {
      bg.setFillStyle(0x666666);
    });

    bg.on("pointerup", () => {
      bg.setFillStyle(0x444444);
      callback();
    });

    return button;
  }
}