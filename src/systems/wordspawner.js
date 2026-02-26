export default class WordSpawner {
  constructor(scene, wordPool, spawnSeconds) {
    this.scene = scene;
    this.wordPool = wordPool;

    this.words = [];
    this.activeWordTexts = [];

    this.spawnInterval = spawnSeconds * 1000;

    scene.time.addEvent({
      delay: this.spawnInterval,
      callback: this.spawnWord,
      callbackScope: this,
      loop: true
    });
  }

  spawnWord() {
    console.log('spawnWord called'); // Debug: check if spawning runs
    let text;
    let attempts = 0;
    const maxAttempts = 10;

    // Pick a non-duplicate word
    do {
      text = Phaser.Utils.Array.GetRandom(this.wordPool.words);
      attempts++;
    } while (this.activeWordTexts.includes(text) && attempts < maxAttempts);

    if (!text || this.activeWordTexts.includes(text)) return;

    const word = this.scene.add.text(
      Phaser.Math.Between(100, 1100),
      0,
      text,
      { fontSize: '32px', fill: '#ffffff' }
    );

    // Movement speed
    word.speed = Phaser.Math.Between(40, 80);

    // Metadata
    word.wordText = text;
    word.score = this.wordPool.score;

    this.words.push(word);
    this.activeWordTexts.push(text);
  }

  update(delta) {
    this.words.forEach(word => {
      // ✅ Use GameState speedMultiplier
      word.y += word.speed * this.scene.state.speedMultiplier * (delta / 1000);

      // Word reached bottom
      if (word.y > 720) {
        this.scene.events.emit('word-missed', word);
        this.removeWord(word);
      }
    });
  }

  removeWord(word) {
    Phaser.Utils.Array.Remove(this.activeWordTexts, word.wordText);
    Phaser.Utils.Array.Remove(this.words, word);
    word.destroy();
  }
}