class Game {
    constructor() {
        console.log('Initializing CreepyDom game...');
        
        // Calculate responsive dimensions
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        
        let gameWidth, gameHeight;
        
        if (isMobile) {
            // Mobile: use full screen with proper aspect ratio
            gameWidth = Math.min(window.innerWidth, 375);
            gameHeight = Math.min(window.innerHeight, 812);
        } else if (isTablet) {
            // Tablet: Candy Crush-like portrait ratio
            gameWidth = 500;
            gameHeight = 800;
        } else {
            // Desktop: Portrait mobile-like ratio for consistency
            gameWidth = 400;
            gameHeight = 700;
        }
        
        this.config = {
            type: Phaser.AUTO,
            width: gameWidth,
            height: gameHeight,
            parent: 'game-container',
            backgroundColor: '#FFFFFF',
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
                mode: isMobile ? Phaser.Scale.RESIZE : Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                expandParent: isMobile,
                fullscreenTarget: isMobile ? 'game-container' : null
            },
            render: {
                antialias: true,
                pixelArt: false,
                roundPixels: false
            }
        };

        console.log('Creating Phaser game instance...');
        this.game = new Phaser.Game(this.config);
        
        // Make game accessible globally for debugging
        window.game = this.game;
        
        // Handle window resize for responsive behavior
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Hide loading text once game starts
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            setTimeout(() => {
                loadingElement.style.display = 'none';
            }, 1000);
        }
        console.log('Game initialized successfully');
    }
    
    handleResize() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile && this.game) {
            this.game.scale.resize(window.innerWidth, window.innerHeight);
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    const gameInstance = new Game();
    window.gameInstance = gameInstance;
});
