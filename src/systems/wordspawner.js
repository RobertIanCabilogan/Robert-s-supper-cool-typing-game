// systems/WordSpawner.js
export default class WordSpawner {
  constructor(scene, wordPool, spawnSeconds ) {
    this.scene = scene;
    this.wordPool = wordPool;

    this.words = [];
    this.activeWordTexts = [];

    this.spawnSeconds = spawnSeconds;
    this.spawnInterval = this.spawnSeconds * 1000;

    this.timer = scene.time.addEvent({
      delay: this.spawnInterval,
      callback: this.spawnWord,
      callbackScope: this,
      loop: true
    });
  }

  spawnWord() {
    let text;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      text = Phaser.Utils.Array.GetRandom(this.wordPool);
      attempts++;
    } while (this.activeWordTexts.includes(text) && attempts < maxAttempts);

    if (this.activeWordTexts.includes(text)) return;

    const word = this.scene.add.text(
      Phaser.Math.Between(100, 1100),
      0,
      text,
      { fontSize: '32px', fill: '#ffffff' }
    );

    word.speed = Phaser.Math.Between(40, 80);
    word.wordText = text;

    this.words.push(word);
    this.activeWordTexts.push(text);
  }

  update(delta) {
    this.words.forEach(word => {
      word.y += word.speed * this.scene.speedMultiplier * (delta / 1000);

      if (word.y > 720) {
        this.removeWord(word);
      }
    });

    this.words = this.words.filter(w => w.active);
  }

  removeWord(word) {
    Phaser.Utils.Array.Remove(this.activeWordTexts, word.wordText);
    Phaser.Utils.Array.Remove(this.words, word);
    word.destroy();
  }

  checkMatch(input) {
    let matched = false;

    this.words.forEach(word => {
      if (word.text === input) {
        this.removeWord(word);
        matched = true;
      }
    });

    return matched;
  }
}