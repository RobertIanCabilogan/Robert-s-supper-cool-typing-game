import WordSpawner from '../systems/wordspawner.js';
import Turret from '../systems/turret.js';
import ScoringSystem from '../systems/scoringsystem.js';

export class MainGame extends Phaser.Scene {
  constructor() {
    super('MainGame');
  }

  preload() {
    this.load.json('words', 'assets/words.json');
    this.load.spritesheet('turret', 'assets/Sprites/Sprite-0001.png', {
      frameWidth: 512,
      frameHeight: 512
    });
  }

  create() {
    // --- State ---
    this.currentInput = '';
    this.currentDifficulty = 'extreme';
    this.speedMultiplier = 1;

    this.scoringSystem = new ScoringSystem();

    // --- Word data ---
    this.wordData = this.cache.json.get('words');
    this.currentPool = this.wordData[this.currentDifficulty];

    // --- UI ---
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.typedText = this.add.text(640, 360, '', {
      fontSize: '48px',
      fill: '#00ff00'
    }).setOrigin(0.5);

    this.speedMult = this.add.text(20, 50, 'Speed: x1', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // --- Animation ---
    if (!this.anims.exists('turret-fire')) {
      this.anims.create({
        key: 'turret-fire',
        frames: this.anims.generateFrameNumbers('turret', {
          start: 0,
          end: 6
        }),
        frameRate: 20,
        repeat: 0
      });
    }

    // --- Gameplay ---
    this.turret = new Turret(this, 640, 660);
    this.wordSpawner = new WordSpawner(this, this.currentPool, 2);

    // --- Events ---
    this.events.on('word-hit', (word) => {
      this.wordSpawner.removeWord(word);
      const score = this.scoringSystem.add(word.score);
      this.scoreText.setText('Score: ' + score);
    });

    // --- Input ---
    this.input.keyboard.on('keydown', this.handleKey, this);
  }

  update(_, delta) {
    this.wordSpawner.update(delta);
    this.turret.update();
  }

  handleKey(event) {
    if (/^[a-z]$/i.test(event.key)) {
      this.currentInput += event.key.toLowerCase();
      this.typedText.setText(this.currentInput);
      this.updateTurretTarget();
      return;
    }

    if (event.key === 'Backspace') {
      this.currentInput = this.currentInput.slice(0, -1);
      this.typedText.setText(this.currentInput);
      this.updateTurretTarget();
      return;
    }

    if (event.key === 'Enter') {
      this.turret.fire();
      this.currentInput = '';
      this.typedText.setText('');
      this.turret.clearTarget();
    }
  }

  updateTurretTarget() {
    if (!this.currentInput) {
      this.turret.clearTarget();
      return;
    }

    const match = this.wordSpawner.words.find(word =>
      word.wordText.startsWith(this.currentInput)
    );

    match ? this.turret.setTarget(match) : this.turret.clearTarget();
  }
}