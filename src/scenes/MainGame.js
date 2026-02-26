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

    this.load.spritesheet('explosion', 'assets/Sprites/Booms.png', {
      frameWidth: 250,
      frameHeight: 141
    });

    this.load.audio('explosionSound', 'assets/Audio/Boom.mp3');
    this.load.audio('lazerSound', 'assets/Audio/lazerPew.mp3');
  }

  create() {

    const state = new GameState(this.cache.json.get('words'));
    const scoring = new ScoringSystem();

    this.state = state;
    this.scoringSystem = scoring;

    // UI
    const scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '24px', fill: '#ffffff' });
    const livesText = this.add.text(20, 60, `Lives: ${state.lives}`, { fontSize: '24px', fill: '#ff4444' });
    const wordsText = this.add.text(20, 100, `Completed: ${state.wordsCompleted}`, { fontSize: '24px', fill: '#44ff44' });
    this.timerText = this.add.text(640, 20, "00:00", { fontSize: '28px', fill: '#ffffff' }).setOrigin(0.5, 0);

    const difficultyText = this.add.text(
      1240,
      20,
      `Difficulty: ${state.currentDifficulty}`,
      { fontSize: '24px', fill: '#ffff00' }
    ).setOrigin(1, 0);

    const speedText = this.add.text(
      1240,
      60,
      `Speed: ${state.speedMultiplier.toFixed(1)}`,
      { fontSize: '24px', fill: '#00ffff' }
    ).setOrigin(1, 0);

    const typedText = this.add.text(
      640,
      360,
      '',
      { fontSize: '48px', fill: '#00ff00' }
    ).setOrigin(0.5);

    Object.assign(this, {
      scoreText,
      livesText,
      wordsText,
      difficultyText,
      speedText,
      typedText
    });

    // Animations

    if (!this.anims.exists('turret-fire')) {
      this.anims.create({
        key: 'turret-fire',
        frames: this.anims.generateFrameNumbers('turret', { start: 0, end: 6 }),
        frameRate: 20,
        repeat: 0
      });
    }

    if (!this.anims.exists('explode')) {
      this.anims.create({
        key: 'explode',
        frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 6 }),
        frameRate: 30,
        repeat: 0
      });
    }

    // Audio

    this.explosionSound = this.sound.add('explosionSound', { volume: 0.4 });
    this.lazerSound = this.sound.add('lazerSound', { volume: 0.6 });

    // Gameplay

    const turret = new Turret(this, 640, 660);
    const wordSpawner = new WordSpawner(this, state.currentPool, 2);

    this.turret = turret;
    this.wordSpawner = wordSpawner;

    // Events

    this.events.on('word-hit', this.onWordHit, this);
    this.events.on('word-missed', this.onWordMissed, this);

    // Input

    this.input.keyboard.on('keydown', this.handleKey, this);
  }

  update(_, delta) {

    const { wordSpawner, turret, state, difficultyText, speedText } = this;

    wordSpawner.update(delta);
    turret.update();

    difficultyText.setText(`Difficulty: ${state.currentDifficulty}`);
    speedText.setText(`Speed: ${state.speedMultiplier.toFixed(1)}`);

    const events = this.state.gameEvents(delta);

    events.forEach(event => {
      if (event === "spawnHealth")
      this.wordSpawner.spawnSpecialWord("health");
      if (event === "increaseSpeed")
      this.state.speedMultiplier += 0.1;
      if (event === "increaseDifficulty"){
          this.wordSpawner.setWordPool(this.state.currentPool);
          this.state.increaseDifficultyLevel();
        }
      });

    const timeString = this.state.updateTimer(delta);
    this.timerText.setText(timeString); 
  }

  handleKey(event) {

    const { state, turret, wordSpawner, typedText, lazerSound } = this;
    const key = event.key;

    if (/^[a-z]$/i.test(key)) {

      state.appendInput(key.toLowerCase());
      typedText.setText(state.currentInput);

      this.updateTurretTarget();
      return;
    }

    if (key === 'Backspace') {

      state.removeLastLetter();
      typedText.setText(state.currentInput);

      this.updateTurretTarget();
      return;
    }

    if (key === 'Enter') {

      const input = state.currentInput;

      const match = wordSpawner.words.find(word =>
        word.wordText === input
      );

      if (match) {
        lazerSound.play();
        turret.fire(match);
      }

      state.resetInput();
      typedText.setText('');
      turret.clearTarget();

      return;
    }
  }

  updateTurretTarget() {

    const { state, turret, wordSpawner } = this;
    const input = state.currentInput;

    if (!input) {
      turret.clearTarget();
      return;
    }

    const match = wordSpawner.words.find(word =>
      word.wordText.startsWith(input)
    );

    match ? turret.setTarget(match) : turret.clearTarget();
  }

  playExplosion(x, y) {

    const explosion = this.add.sprite(x, y, 'explosion');

    explosion.play('explode');
    this.explosionSound.play();

    explosion.once('animationcomplete', () => {
      explosion.destroy();
    });
  }

  onWordHit(word) {

    const { state, scoringSystem, scoreText, wordsText, turret, typedText, wordSpawner } = this;

    this.playExplosion(word.x, word.y);
    wordSpawner.removeWord(word);

    const speedScore = Math.floor(word.score * state.speedMultiplier);
    const score = scoringSystem.add(speedScore);
    if (word.special === "health") {
      const lives = this.state.gainLife(1);
      this.livesText.setText('Lives: ' + lives);
    }
    scoreText.setText('Score: ' + score);

    state.resetInput();
    typedText.setText('');
    turret.clearTarget();

    const completed = state.theWordsCompleted();
    wordsText.setText('Completed: ' + completed);
  }

  onWordMissed(word) {

    const { state, livesText, turret, typedText, wordSpawner } = this;

    wordSpawner.removeWord(word);

    const livesLeft = state.loseLife();
    livesText.setText('Lives: ' + livesLeft);

    state.resetInput();
    typedText.setText('');
    turret.clearTarget();

    if (state.isGameOver()) {
      this.gameOver();
    }
  }

  gameOver() {

    this.add.text(
      640,
      360,
      'GAME OVER',
      { fontSize: '64px', fill: '#ff0000' }
    ).setOrigin(0.5);

    this.input.keyboard.removeAllListeners();

    this.wordSpawner.words.forEach(word => word.destroy());
  }
}