import WordSpawner from '../systems/wordspawner.js';
import Turret from '../systems/turret.js';

export class Start extends Phaser.Scene {
  constructor() {
    super('Start');
  }

  preload() {
    this.load.json('words', 'assets/words.json');
    this.load.spritesheet('turret', 'assets/Sprites/Sprite-0001.png',{
          frameWidth: 512,
        frameHeight: 512
    });
  }

  create() {
    this.speedMultiplier = 1;
    this.currentInput = '';
    this.score = 0;

    this.wordData = this.cache.json.get('words');
    this.currentDifficulty = 'easy';
    this.currentPool = this.wordData[this.currentDifficulty];

    // Score display
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

        // Turret 
    this.turret = new Turret(this, 640, 660);
    this.anims.create({
        key: 'turret-fire',
        frames: this.anims.generateFrameNumbers('turret', {
            start: 0,
            end: 6
        }),
        frameRate: 20,
        repeat: 0
    });

    // Typed text display
    this.typedText = this.add.text(
      640,
      360,
      '',
      { fontSize: '48px', fill: '#00ff00' }
    ).setOrigin(0.5);


    // Keyboard input
    this.input.keyboard.on('keydown', this.handleKey, this);

    // Word spawner
    this.wordSpawner = new WordSpawner(this, this.currentPool, 2);

    this.events.on('word-hit', word => {
    this.wordSpawner.removeWord(word);
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
    });
  }

  update(time, delta) {
    this.wordSpawner.update(delta);
    this.turret.update();
  }

  handleKey(event) {
    if (event.key.length === 1 && event.key !== ' ') {
      this.currentInput += event.key.toLowerCase();
      this.typedText.setText(this.currentInput);
      this.updateTurretTarget();
    }

    if (event.key === 'Backspace') {
      this.currentInput = this.currentInput.slice(0, -1);
      this.typedText.setText(this.currentInput);
      this.updateTurretTarget();
    }

    if (event.key === 'Enter') {
        this.turret.fire();
        this.currentInput = '';
        this.typedText.setText('');
    }
  }
    updateTurretTarget() {
        if (!this.currentInput) {
            this.turret.clearTarget();
            return;
        }

        const match = this.wordSpawner.words.find(word =>
            word.text.startsWith(this.currentInput)
        );

        if (match) {
            this.turret.setTarget(match);
        } else {
            this.turret.clearTarget();
        }
    }
}