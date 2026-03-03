export class Start extends Phaser.Scene {

  constructor() {
    super("Start");
  }

  create() {

    this.add.text(640, 200, "ROBERT'S SUPER COOL TYPING GAME!!!", {
      fontSize: "48px",
      fill: "#ffffff"
    }).setOrigin(0.5);

    // Start Game Button
    this.createButton(640, 350, 300, 70, "START GAME", () => {
      this.scene.start("MainGame");
    });

    // Credits Button
    this.createButton(640, 440, 300, 70, "CREDITS", () => {
      this.showCredits();
    });
  }

  /* ---------------- BUTTON ---------------- */

  createButton(x, y, width, height, label, callback) {

    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, width, height, 0x222222)
      .setStrokeStyle(3, 0xffffff)
      .setOrigin(0.5);

    const text = this.add.text(0, 0, label, {
      fontSize: "28px",
      fill: "#ffffff"
    }).setOrigin(0.5);

    button.add([bg, text]);

    bg.setInteractive({ useHandCursor: true });

    bg.on("pointerover", () => {
      bg.setFillStyle(0x444444);
      button.setScale(1.05);
    });

    bg.on("pointerout", () => {
      bg.setFillStyle(0x222222);
      button.setScale(1);
    });

    bg.on("pointerdown", () => {
      bg.setFillStyle(0x666666);
    });

    bg.on("pointerup", () => {
      bg.setFillStyle(0x444444);
      callback();
    });

    return button;
  }

  /* ---------------- CREDITS PANEL ---------------- */

  showCredits() {

    // Dark overlay
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);

    const panel = this.add.rectangle(640, 360, 640, 440, 0x111111)
      .setStrokeStyle(3, 0xffffff);

    const title = this.add.text(640, 180, "CREDITS", {
      fontSize: "40px",
      fill: "#ffff00"
    }).setOrigin(0.5);

    const content = this.add.text(640, 340,
      "Game Design & Programming:\nRobert Ian\n\nSound:\nLazer Sound Effect - CHACKONG \nRetro hurt 2 - Driken5482\n\n Music:\nPowerup! - Jeremy Blake",
      {
        fontSize: "24px",
        fill: "#ffffff",
        align: "center"
      }
    ).setOrigin(0.5);

    const closeButton = this.createButton(640, 500, 200, 60, "CLOSE", () => {
      overlay.destroy();
      panel.destroy();
      title.destroy();
      content.destroy();
      closeButton.destroy();
    });
  }
}