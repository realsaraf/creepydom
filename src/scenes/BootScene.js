class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        console.log('BootScene preload started');
        
        // Create loading bar
        this.createLoadingBar();
        
        // Add a simple progress simulation since we don't have real assets
        this.simulateLoading();
    }

    simulateLoading() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 0.1;
            this.updateProgress(progress);
            
            if (progress >= 1) {
                clearInterval(interval);
                console.log('Simulated loading complete, starting menu...');
                this.time.delayedCall(500, () => {
                    this.scene.start('MenuScene');
                });
            }
        }, 100);
    }

    updateProgress(value) {
        if (this.loadingBar) {
            this.loadingBar.width = 396 * value;
        }
        if (this.loadingText) {
            this.loadingText.setText(`Loading... ${Math.round(value * 100)}%`);
        }
        console.log('Loading progress:', Math.round(value * 100) + '%');
    }

    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

        // Title
        this.add.text(width / 2, height / 2 - 100, 'CreepyDom', {
            fontSize: '48px',
            fill: '#7474b4',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, height / 2 - 50, 'Evolution Game', {
            fontSize: '24px',
            fill: '#9494d4'
        }).setOrigin(0.5);

        // Loading bar background
        const loadingBarBg = this.add.rectangle(width / 2, height / 2 + 50, 400, 20, 0x2a2a4a);
        loadingBarBg.setStrokeStyle(2, 0x4a4a6a);

        // Loading bar fill
        this.loadingBar = this.add.rectangle(width / 2 - 198, height / 2 + 50, 4, 16, 0x7474b4);
        this.loadingBar.setOrigin(0, 0.5);

        // Loading text
        this.loadingText = this.add.text(width / 2, height / 2 + 100, 'Loading... 0%', {
            fontSize: '18px',
            fill: '#cccccc'
        }).setOrigin(0.5);
        
        // Click instruction
        this.add.text(width / 2, height / 2 + 130, 'Click anywhere to skip', {
            fontSize: '14px',
            fill: '#7474b4'
        }).setOrigin(0.5);
    }

    create() {
        console.log('BootScene create() called');
        // Initialize sound manager
        this.soundManager = new SoundManager(this);
        this.soundManager.preload();
        
        // Set global reference for other scenes
        this.registry.set('soundManager', this.soundManager);
        console.log('BootScene setup complete');
        
        // Add click to skip functionality
        this.input.on('pointerdown', () => {
            console.log('Click detected, skipping to menu');
            this.scene.start('MenuScene');
        });
        
        // Also add automatic fallback after 5 seconds
        this.time.delayedCall(5000, () => {
            console.log('Fallback: starting MenuScene after 5 seconds');
            this.scene.start('MenuScene');
        });
    }
}
