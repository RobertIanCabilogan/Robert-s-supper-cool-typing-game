export class Start extends Phaser.Scene {
  constructor() {
    super('Start');
  }

  preload() {
    this.load.json('words', 'assets/words.json');
  }

  create() {
    this.speedMultiplier = 1.5;
    this.words = [];
    this.currentInput = '';
    this.score = 0;

    this.wordData = this.cache.json.get('words');
    this.currentDifficulty = 'medium';
    this.currentPool = this.wordData[this.currentDifficulty];

    // Score display
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // Typed text display in the middle
    this.typedText = this.add.text(
      640,  
      360,  
      '',
      { fontSize: '48px', fill: '#00ff00' }
    ).setOrigin(0.5);

    // Keyboard input
    this.input.keyboard.on('keydown', this.handleKey, this);
    
    this.spawnSeconds = 1.25;
    this.spawnInterval = this.spawnSeconds * 1000;

    // Word spawn loop
    this.time.addEvent({
      delay: this.spawnInterval,
      callback: this.spawnWord,
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    this.words.forEach(word => {
      word.y += word.speed * this.speedMultiplier * (delta / 1000);

      if (word.y > 720) {
        word.destroy();
      }
    });

    this.words = this.words.filter(w => w.active);
  }

  spawnWord() {
    const text = Phaser.Utils.Array.GetRandom(this.currentPool);

    const word = this.add.text(
      Phaser.Math.Between(100, 1100),
      0,
      text,
      { fontSize: '32px', fill: '#ffffff' }
    );

    word.speed = Phaser.Math.Between(40, 80);
    this.words.push(word);
  }

  handleKey(event) {
    if (event.key.length === 1 && event.key !== ' ') {
      this.currentInput += event.key.toLowerCase();
      this.typedText.setText(this.currentInput); 
    }

    if (event.key === 'Backspace') {
      this.currentInput = this.currentInput.slice(0, -1);
      this.typedText.setText(this.currentInput); 
    }

    if (event.key === 'Enter') {
      this.checkWords();
    }
  }

  checkWords() {
    let matched = false;

    this.words.forEach(word => {
      if (word.text === this.currentInput) {
        word.destroy();
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        matched = true;
      }
    });

    if (matched) {
      this.currentInput = '';
      this.typedText.setText('');
    }
  }
}