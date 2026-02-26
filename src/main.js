import { Start } from './scenes/Start.js';
import { MainGame } from './scenes/MainGame.js';

const config = {
    type: Phaser.AUTO,
    title: 'super cool typing gaming!!!',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: true,
    scene: [Start, MainGame],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            