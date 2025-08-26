class Game {
    constructor() {
        console.log('Initializing CreepyDom game...');
        this.config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: 'game-container',
            backgroundColor: '#0a0a1a',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: [
                BootScene,
                MenuScene,
                LevelSelectScene,
                GameScene,
                GameOverScene,
                LevelCompleteScene
            ],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };

        console.log('Creating Phaser game instance...');
        this.game = new Phaser.Game(this.config);
        
        // Hide loading text once game starts
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        console.log('Game initialized successfully');
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new Game();
});
