class LevelCompleteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelCompleteScene' });
    }

    init(data) {
        this.level = data.level || 1;
        this.score = data.score || 0;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Get sound manager
        this.soundManager = this.registry.get('soundManager');

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a, 0.9);

        // Success animation
        this.createSuccessAnimation();

        // Level Complete text
        const completeText = this.add.text(width / 2, height / 2 - 120, 'LEVEL COMPLETE!', {
            fontSize: '48px',
            fill: '#44ff44',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Animate text
        completeText.setScale(0);
        this.tweens.add({
            targets: completeText,
            scaleX: 1,
            scaleY: 1,
            duration: 800,
            ease: 'Bounce.easeOut'
        });

        // Level info
        this.add.text(width / 2, height / 2 - 60, `Level ${this.level} Completed!`, {
            fontSize: '24px',
            fill: '#cccccc'
        }).setOrigin(0.5);

        // Score
        this.add.text(width / 2, height / 2 - 20, `Final Score: ${this.score.toLocaleString()}`, {
            fontSize: '20px',
            fill: '#ffdd44'
        }).setOrigin(0.5);

        // Evolution info
        this.showEvolutionInfo();

        // Buttons
        if (this.level < 20) {
            this.createButton(width / 2 - 100, height / 2 + 100, 'NEXT LEVEL', () => {
                this.soundManager.playClickSound();
                this.registry.set('currentLevel', this.level + 1);
                this.scene.start('GameScene');
            });
        } else {
            // Game completed!
            this.showGameCompleteMessage();
        }

        this.createButton(width / 2 + 100, height / 2 + 100, 'MENU', () => {
            this.soundManager.playClickSound();
            this.scene.start('MenuScene');
        });

        this.createButton(width / 2, height / 2 + 160, 'LEVEL SELECT', () => {
            this.soundManager.playClickSound();
            this.scene.start('LevelSelectScene');
        });

        // Show progress
        this.showProgress();
    }

    createSuccessAnimation() {
        // Create celebration particles
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = this.cameras.main.height + 50;
            const size = Phaser.Math.Between(3, 8);
            const colors = [0xffff00, 0xff6600, 0x44ff44, 0x4444ff, 0xff44ff];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const particle = this.add.circle(x, y, size, color);
            
            this.tweens.add({
                targets: particle,
                y: y - Phaser.Math.Between(300, 600),
                x: x + Phaser.Math.Between(-100, 100),
                alpha: 0,
                duration: Phaser.Math.Between(1500, 3000),
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }

        // Fireworks effect
        this.time.delayedCall(500, () => this.createFirework(200, 150));
        this.time.delayedCall(800, () => this.createFirework(600, 180));
        this.time.delayedCall(1200, () => this.createFirework(400, 120));
    }

    createFirework(x, y) {
        const colors = [0xffff00, 0xff6600, 0x44ff44, 0x4444ff, 0xff44ff];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 50;
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;
            
            const spark = this.add.circle(x, y, 3, color);
            
            this.tweens.add({
                targets: spark,
                x: endX,
                y: endY,
                alpha: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => spark.destroy()
            });
        }
    }

    showEvolutionInfo() {
        const levelData = GameData.getLevelData(this.level);
        const targetType = GameData.getInsectType(levelData.targetType);
        
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 20, 
            `You evolved into: ${targetType.name}!`, {
            fontSize: '18px',
            fill: '#aaffaa'
        }).setOrigin(0.5);

        // Show evolution path for this level
        const startType = GameData.getInsectType(levelData.startType);
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 45, 
            `${startType.name} → ${targetType.name}`, {
            fontSize: '14px',
            fill: '#cccccc'
        }).setOrigin(0.5);
    }

    showGameCompleteMessage() {
        if (this.level === 20) {
            const congratsText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 80, 
                '🎉 GAME COMPLETED! 🎉\nYou reached T-Rex!', {
                fontSize: '24px',
                fill: '#ffaa00',
                fontWeight: 'bold',
                align: 'center'
            }).setOrigin(0.5);

            // Special T-Rex animation
            this.tweens.add({
                targets: congratsText,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    showProgress() {
        const progress = GameData.getProgress();
        const progressText = `Progress: ${progress.unlockedLevels - 1} / 20 levels completed`;
        
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, progressText, {
            fontSize: '14px',
            fill: '#7474b4'
        }).setOrigin(0.5);

        // Progress bar
        const barWidth = 300;
        const barHeight = 10;
        const barX = this.cameras.main.width / 2 - barWidth / 2;
        const barY = this.cameras.main.height - 25;
        
        const progressBg = this.add.rectangle(barX + barWidth / 2, barY, barWidth, barHeight, 0x2a2a4a);
        progressBg.setStrokeStyle(1, 0x4a4a6a);
        
        const progressFill = this.add.rectangle(barX, barY, (barWidth * (progress.unlockedLevels - 1)) / 20, barHeight, 0x44ff44);
        progressFill.setOrigin(0, 0.5);
    }

    createButton(x, y, text, callback) {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 150, 50, 0x2a2a4a);
        bg.setStrokeStyle(2, 0x4a4a6a);
        bg.setInteractive();

        const buttonText = this.add.text(0, 0, text, {
            fontSize: '16px',
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
}
