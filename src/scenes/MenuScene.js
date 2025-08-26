class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        console.log('MenuScene create() called');
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Get sound manager
        this.soundManager = this.registry.get('soundManager');
        if (!this.soundManager) {
            console.warn('SoundManager not found, creating new one');
            this.soundManager = new SoundManager(this);
            this.registry.set('soundManager', this.soundManager);
        }

        // Background - jungle sports theme
        this.add.rectangle(width / 2, height / 2, width, height, 0xF5DEB3);
        
        // Add jungle gradient effect
        const gradient = this.add.graphics();
        gradient.fillGradientStyle(0x228B22, 0x32CD32, 0x8B4513, 0x2E8B57, 1);
        gradient.fillRect(0, 0, width, height);
        gradient.setAlpha(0.4);

        // Animated background elements
        this.createAnimatedBackground();

        // Game title - jungle sports style
        const title = this.add.text(width / 2, height / 2 - 150, '� CREEPYDOM 🏆', {
            fontSize: '64px',
            fill: '#8B4513',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif',
            stroke: '#FFFF00',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Add powerful sports glow effect to title
        this.tweens.add({
            targets: title,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Power2.easeInOut'
        });

        // Sports subtitle with jungle theme
        this.add.text(width / 2, height / 2 - 100, '� JUNGLE SURVIVAL CHAMPIONSHIP! 🦗', {
            fontSize: '24px',
            fill: '#228B22',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif',
            stroke: '#FFFFFF',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Game description
        this.add.text(width / 2, height / 2 - 50, 'Evolve from tiny insects to mighty T-Rex!', {
            fontSize: '16px',
            fill: '#cccccc'
        }).setOrigin(0.5);

        // Play button
        this.createButton(width / 2, height / 2 + 20, 'PLAY', () => {
            this.soundManager.playClickSound();
            this.scene.start('LevelSelectScene');
        });

        // Continue button (if progress exists)
        const progress = GameData.getProgress();
        if (progress.unlockedLevels > 1) {
            this.createButton(width / 2, height / 2 + 80, 'CONTINUE', () => {
                this.soundManager.playClickSound();
                this.scene.start('LevelSelectScene');
            });
        }

        // Instructions button
        this.createButton(width / 2, height / 2 + 140, 'HOW TO PLAY', () => {
            this.soundManager.playClickSound();
            this.showInstructions();
        });

        // Sound toggle button
        this.createSoundToggle(width - 50, 50);

        // Version text
        this.add.text(width - 10, height - 10, 'v1.0', {
            fontSize: '12px',
            fill: '#666666'
        }).setOrigin(1, 1);
    }

    createAnimatedBackground() {
        // Create floating insect silhouettes
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(10, 30);
            const alpha = Phaser.Math.FloatBetween(0.1, 0.3);
            
            const insect = this.add.circle(x, y, size, 0x4a4a6a, alpha);
            
            // Floating animation
            this.tweens.add({
                targets: insect,
                y: y + Phaser.Math.Between(-50, 50),
                x: x + Phaser.Math.Between(-30, 30),
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createButton(x, y, text, callback) {
        const button = this.add.container(x, y);

        // Button background
        const bg = this.add.rectangle(0, 0, 200, 50, 0x2a2a4a);
        bg.setStrokeStyle(2, 0x4a4a6a);
        bg.setInteractive();

        // Button text
        const buttonText = this.add.text(0, 0, text, {
            fontSize: '18px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        button.add([bg, buttonText]);

        // Hover effects
        bg.on('pointerover', () => {
            bg.setFillStyle(0x3a3a5a);
            bg.setStrokeStyle(3, 0x6a6a8a);
            this.input.setDefaultCursor('pointer');
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x2a2a4a);
            bg.setStrokeStyle(2, 0x4a4a6a);
            this.input.setDefaultCursor('default');
        });

        bg.on('pointerdown', callback);

        return button;
    }

    createSoundToggle(x, y) {
        const soundButton = this.add.container(x, y);
        
        const bg = this.add.circle(0, 0, 20, 0x2a2a4a);
        bg.setStrokeStyle(2, 0x4a4a6a);
        bg.setInteractive();

        this.soundIcon = this.add.text(0, 0, '♪', {
            fontSize: '20px',
            fill: this.soundManager.enabled ? '#ffffff' : '#666666'
        }).setOrigin(0.5);

        soundButton.add([bg, this.soundIcon]);

        bg.on('pointerdown', () => {
            const enabled = this.soundManager.toggleSound();
            this.soundIcon.setFill(enabled ? '#ffffff' : '#666666');
            this.soundManager.playClickSound();
        });

        bg.on('pointerover', () => {
            bg.setFillStyle(0x3a3a5a);
            this.input.setDefaultCursor('pointer');
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x2a2a4a);
            this.input.setDefaultCursor('default');
        });
    }

    showInstructions() {
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.8
        ).setInteractive();

        const panel = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            600,
            400,
            0x1a1a2a
        );
        panel.setStrokeStyle(3, 0x4a4a6a);

        const title = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 160, 'How to Play', {
            fontSize: '32px',
            fill: '#7474b4',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const instructions = [
            '• Use Arrow Keys or WASD to move your creature',
            '• Or click on insects/empty cells to move',
            '• Eat smaller insects to grow and evolve',
            '• Avoid larger insects - they will eat you!',
            '• Special insects give bonus effects:',
            '  ◦ Green: Double points (x2)',
            '  ◦ Blue: Triple points (x3)',
            '  ◦ Red: Half points (÷2)',
            '  ◦ Purple: Lose 50 points',
            '• Reach the target evolution to complete each level',
            '• 20 levels from tiny mites to T-Rex!'
        ];

        let yOffset = -80;
        instructions.forEach(instruction => {
            this.add.text(this.cameras.main.width / 2 - 250, this.cameras.main.height / 2 + yOffset, instruction, {
                fontSize: '14px',
                fill: '#cccccc',
                wordWrap: { width: 500 }
            });
            yOffset += 25;
        });

        const closeButton = this.createButton(this.cameras.main.width / 2, this.cameras.main.height / 2 + 150, 'CLOSE', () => {
            overlay.destroy();
            panel.destroy();
            title.destroy();
            closeButton.destroy();
            this.children.list.filter(child => child.type === 'Text' && instructions.some(inst => child.text === inst))
                .forEach(child => child.destroy());
        });

        overlay.on('pointerdown', () => {
            // Close when clicking outside
            closeButton.list[0].emit('pointerdown');
        });
    }
}
