import WordSpawner from '../systems/wordspawner.js';
import Turret from '../systems/turret.js';
import GameState from '../systems/gamestate.js';
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

    this.load.spritesheet('explosion', 'assets/Sprites/Booms.png', {
      frameWidth: 250,
      frameHeight: 141
    });

    this.load.audio('explosionSound', 'assets/Audio/Boom.mp3');
    this.load.audio('lazerSound', 'assets/Audio/lazerPew.mp3');
    this.load.audio('typing', 'assets/Audio/New_Project.mp3');
    this.load.audio('bgMusic', 'assets/Audio/Jeremy Blake - Powerup ♫ NO COPYRIGHT 8-bit Music.mp3');
    this.load.audio('hurt', 'assets/Audio/driken5482-retro-hurt-2-236675.mp3');
  }

  create() {

    this.state = new GameState(this.cache.json.get('words'));
    this.scoringSystem = new ScoringSystem();

    this.createUI();
    this.createAnimations();
    this.createAudio();
    this.createGameplay();
    this.registerEvents();
  }

  /* ------------------- SETUP ------------------- */

  createUI() {

    this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '24px', fill: '#fff' });
    this.livesText = this.add.text(20, 60, `Lives: ${this.state.lives}`, { fontSize: '24px', fill: '#ff4444' });
    this.wordsText = this.add.text(20, 100, `Completed: ${this.state.wordsCompleted}`, { fontSize: '24px', fill: '#44ff44' });

    this.timerText = this.add.text(640, 20, "00:00", { fontSize: '28px', fill: '#fff' })
      .setOrigin(0.5, 0);

    this.difficultyText = this.add.text(1240, 20,
      `Difficulty: ${this.state.currentDifficulty}`,
      { fontSize: '24px', fill: '#ffff00' }
    ).setOrigin(1, 0);

    this.speedText = this.add.text(1240, 60,
      `Speed: ${this.state.speedMultiplier.toFixed(1)}`,
      { fontSize: '24px', fill: '#00ffff' }
    ).setOrigin(1, 0);

    this.typedText = this.add.text(640, 360, '',
      { fontSize: '48px', fill: '#00ff00' }
    ).setOrigin(0.5);
  }

  createAnimations() {

    if (!this.anims.exists('turret-fire')) {
      this.anims.create({
        key: 'turret-fire',
        frames: this.anims.generateFrameNumbers('turret', { start: 0, end: 6 }),
        frameRate: 20
      });
    }

    if (!this.anims.exists('explode')) {
      this.anims.create({
        key: 'explode',
        frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 6 }),
        frameRate: 30
      });
    }
  }

  createAudio() {
    this.lazerSound = this.sound.add('lazerSound', { volume: 0.3 });
    this.typingSound = this.sound.add('typing');
    this.bgMusic = this.sound.add('bgMusic', { volume: 0.5, loop: true });
    this.hurt = this.sound.add('hurt');
    this.bgMusic.play();
  }

  createGameplay() {
    this.turret = new Turret(this, 640, 660);
    this.wordSpawner = new WordSpawner(this, this.state.currentPool, 2);
  }

  registerEvents() {
    this.events.on('word-hit', this.onWordHit, this);
    this.events.on('word-missed', this.onWordMissed, this);
    this.input.keyboard.on('keydown', this.handleKey, this);
  }

  /* ------------------- UPDATE ------------------- */

  update(_, delta) {

    this.wordSpawner.update(delta);
    this.turret.update();

    this.difficultyText.setText(`Difficulty: ${this.state.currentDifficulty}`);
    this.speedText.setText(`Speed: ${this.state.speedMultiplier.toFixed(1)}`);

    this.handleGameEvents(delta);

    this.timerText.setText(this.state.updateTimer(delta));
  }

  handleGameEvents(delta) {

    const events = this.state.gameEvents(delta);

    events.forEach(event => {

      if (event === "spawnHealth") {
        this.wordSpawner.spawnSpecialWord("health");
      }

      if (event === "increaseSpeed") {
        this.state.speedMultiplier += 0.1;
      }

      if (event === "increaseDifficulty") {
        this.state.increaseDifficultyLevel();
        this.wordSpawner.setWordPool(this.state.currentPool);
      }

    });
  }

  /* ------------------- INPUT ------------------- */

  handleKey(event) {

    const key = event.key;

    if (/^[a-z]$/i.test(key)) {
      this.typingSound.play();
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

    if (key === 'Enter') {

      const match = this.wordSpawner.words.find(
        word => word.wordText === this.state.currentInput
      );

      if (match) {
        this.lazerSound.play();
        this.turret.fire(match);
      }

      this.state.resetInput();
      this.typedText.setText('');
      this.turret.clearTarget();
    }
  }

  updateTurretTarget() {

    const input = this.state.currentInput;

    if (!input) {
      this.turret.clearTarget();
      return;
    }

    const match = this.wordSpawner.words.find(
      word => word.wordText.startsWith(input)
    );

    match ? this.turret.setTarget(match) : this.turret.clearTarget();
  }

  /* ------------------- GAME EVENTS ------------------- */

  onWordHit(word) {

    this.playExplosion(word.x, word.y);
    this.wordSpawner.removeWord(word);

    if (word.special === "health") {
      this.livesText.setText('Lives: ' + this.state.gainLife(1));
    } else {
      const scoreGain = Math.floor(word.score * this.state.speedMultiplier);
      this.scoreText.setText('Score: ' + this.scoringSystem.add(scoreGain));
    }

    this.state.resetInput();
    this.typedText.setText('');
    this.turret.clearTarget();

    this.wordsText.setText(
      'Completed: ' + this.state.theWordsCompleted()
    );
  }

  onWordMissed(word) {
     
    this.wordSpawner.removeWord(word);
    this.hurt.play()
    this.livesText.setText('Lives: ' + this.state.loseLife());

    this.state.resetInput();
    this.typedText.setText('');
    this.turret.clearTarget();

    if (this.state.isGameOver()) {
      this.gameOver();
    }
  }

  playExplosion(x, y) {

    const explosion = this.add.sprite(x, y, 'explosion');
    explosion.play('explode');
    this.sound.play('explosionSound', { volume: 0.2 });

    explosion.once('animationcomplete', () => explosion.destroy());
  }

  gameOver() {
    this.bgMusic.stop();
    this.input.keyboard.removeAllListeners();
    this.wordSpawner.words.forEach(word => word.destroy());

    this.scene.start("EndScreen", {
      difficulty: this.state.currentDifficulty,
      speed: this.state.speedMultiplier.toFixed(1),
      score: this.scoringSystem.score,
      wordsCompleted: this.state.wordsCompleted
    });
  }
}