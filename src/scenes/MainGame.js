import WordSpawner from '../systems/wordspawner.js';
import Turret from '../systems/turret.js';
import GameState from '../systems/GameState.js';
import ScoringSystem from '../systems/ScoringSystem.js';

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
    // --- Load word data and create GameState ---
    const wordData = this.cache.json.get('words');
    this.state = new GameState(wordData);

    // --- Scoring system ---
    this.scoringSystem = new ScoringSystem();

    // --- UI ---
    this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '24px', fill: '#ffffff' });
    this.livesText = this.add.text(20, 60, `Lives: ${this.state.lives}`, { fontSize: '24px', fill: '#ff4444' });
    this.wordsText = this.add.text(20, 100, `Completed: ${this.state.wordsCompleted}`, { fontSize: '24px', fill: '#44ff44' });
    this.difficultyText = this.add.text(1240, 20, `Difficulty: ${this.state.currentDifficulty}`, {fontSize: '24px',fill: '#ffff00'}).setOrigin(1, 0);
    this.speedText = this.add.text(1240, 60, `Speed: ${this.state.speedMultiplier.toFixed(1)}`, {fontSize: '24px',fill: '#00ffff'}).setOrigin(1, 0);
    this.typedText = this.add.text(640, 360, '', { fontSize: '48px', fill: '#00ff00' }).setOrigin(0.5);

    // --- Animation ---
    if (!this.anims.exists('turret-fire')) {
      this.anims.create({
        key: 'turret-fire',
        frames: this.anims.generateFrameNumbers('turret', { start: 0, end: 6 }),
        frameRate: 20,
        repeat: 0
      });
    }

    // --- Gameplay ---
    this.turret = new Turret(this, 640, 660);
    this.wordSpawner = new WordSpawner(this, this.state.currentPool, 2);

    // --- Events ---
    this.events.on('word-hit', this.onWordHit, this);
    this.events.on('word-missed', this.onWordMissed, this);

    // --- Input ---
    this.input.keyboard.on('keydown', this.handleKey, this);
  }

  update(_, delta) {
    this.wordSpawner.update(delta);
    this.turret.update();

      this.difficultyText.setText(`Difficulty: ${this.state.currentDifficulty}`);
  this.speedText.setText(`Speed: ${this.state.speedMultiplier.toFixed(1)}`);
  }

  handleKey(event) {
    const key = event.key;

    if (/^[a-z]$/i.test(key)) {
    this.state.appendInput(key.toLowerCase());
    this.typedText.setText(this.state.currentInput);
    this.updateTurretTarget();
    return;
  }

  if (key === 'Backspace') {
    this.state.removeLastLetter();
    this.typedText.setText(this.state.currentInput);
    this.updateTurretTarget();
    return;
  }

  if (key === 'Enter' || key === ' ') {   // <--- Add space here
    this.turret.fire();
    this.state.resetInput();
    this.typedText.setText('');
    this.turret.clearTarget();
    return;
  }
}

  updateTurretTarget() {
    const input = this.state.currentInput;

    if (!input) {
      this.turret.clearTarget();
      return;
    }

    const match = this.wordSpawner.words.find(word =>
      word.wordText.startsWith(input)
    );

    match ? this.turret.setTarget(match) : this.turret.clearTarget();
  }

  onWordHit(word) {
    this.wordSpawner.removeWord(word);

    // Update score
    const speedScore = Math.floor(word.score * this.state.speedMultiplier);
    const score = this.scoringSystem.add(speedScore);
    this.scoreText.setText('Score: ' + score);
    
    this.state.resetInput();
    this.typedText.setText('');
    this.turret.clearTarget();
    // Update words completed
    const completed = this.state.theWordsCompleted();
    this.wordsText.setText('Completed: ' + completed);
  }

  onWordMissed(word) {
    this.wordSpawner.removeWord(word);

    // Lose a life
    const livesLeft = this.state.loseLife();
    this.livesText.setText('Lives: ' + livesLeft);

    this.state.resetInput();
    this.typedText.setText('');
    this.turret.clearTarget();

    if (this.state.isGameOver()) {
      this.gameOver();
    }
}

  gameOver() {
    this.add.text(640, 360, 'GAME OVER', { fontSize: '64px', fill: '#ff0000' }).setOrigin(0.5);

    this.input.keyboard.removeAllListeners();
    this.wordSpawner.words.forEach(word => word.destroy());
  }
}