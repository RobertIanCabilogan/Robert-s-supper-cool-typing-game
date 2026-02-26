export default class GameState {
  constructor(wordData) {
    this.wordData = wordData;

    this.currentDifficulty = 'easy';
    this.currentInput = '';
    this.speedMultiplier = 2;

    this.lives = 5;
    this.wordsCompleted = 0;

    this.currentPool = this.wordData[this.currentDifficulty];
  }

  setDifficulty(difficulty) {
    if (!this.wordData[difficulty]) return;

    this.currentDifficulty = difficulty;
    this.currentPool = this.wordData[difficulty];
  }

  loseLife() {
    this.lives--;
    return this.lives;
  }

  gainLife(amount = 1) {
    this.lives += amount;
    return this.lives;
  }

  isGameOver() {
    return this.lives <= 0;
  }

  theWordsCompleted() {
    this.wordsCompleted++;
    return this.wordsCompleted;
  }

  resetWordsCompleted() {
    this.wordsCompleted = 0;
  }

  appendInput(letter) {
    this.currentInput += letter;
  }

  removeLastLetter() {
    this.currentInput = this.currentInput.slice(0, -1);
  }

  resetInput() {
    this.currentInput = '';
  }

  // ----------------
  // Full Reset (for restart)
  // ----------------
  reset() {
    this.currentInput = '';
    this.lives = 5;
    this.wordsCompleted = 0;
    this.speedMultiplier = 1;
    this.currentDifficulty = 'easy';
    this.currentPool = this.wordData[this.currentDifficulty];
  }
}