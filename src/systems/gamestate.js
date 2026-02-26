export default class GameState {
  constructor(wordData) {
    this.wordData = wordData;

    this.currentDifficulty = 'easy';
    this.currentInput = '';
    this.speedMultiplier = 1;
    this.elapsedTime = 0;
    this.seconds = 0;
    this.lives = 5;
    this.wordsCompleted = 0;
    this.lastHealthSpawn = 0;
    this.lastDifficultyIncrease = 0;
    this.lastSpeedIncrease = 0;

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
  
    updateTimer(delta) {
        this.elapsedTime += delta;
        this.seconds = Math.floor(this.elapsedTime / 1000);
        return this.getFormattedTime();
    }
    
    getFormattedTime() {
        const minutes = Math.floor(this.seconds / 60);
        const seconds = this.seconds % 60;

        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');

        return `${mm}:${ss}`;
    }

    gameEvents(delta) {
        const events = [];
        this.elapsedTime += delta;
        const minutes = Math.floor(this.elapsedTime / 60000);
        if (minutes > this.lastSpeedIncrease) {
        this.lastSpeedIncrease = minutes;
        events.push("increaseSpeed");
        }

        if (this.wordsCompleted >= this.lastHealthSpawn + 25) {
        this.lastHealthSpawn += 25;
        events.push("spawnHealth");
        }

        if (this.wordsCompleted >= this.lastDifficultyIncrease + 50) {
        this.lastDifficultyIncrease += 50;
        events.push("increaseDifficulty");
        }
        return events;
    }
    increaseDifficultyLevel() {
        const order = ["easy","medium","hard","extreme"];
        let index = order.indexOf(this.currentDifficulty);
        if (index < order.length - 1) {
        this.setDifficulty(order[index + 1]);
        }
    }

    reset() {
        this.currentInput = '';
        this.lives = 5;
        this.wordsCompleted = 0;
        this.speedMultiplier = 1;
        this.elapsedTime = 0;
        this.seconds = 0;
        this.lastHealthSpawn = 0;
        this.lastDifficultyIncrease = 0;
        this.lastSpeedIncrease = 0;
        this.currentDifficulty = 'easy';
        this.currentPool = this.wordData[this.currentDifficulty];
    }
}