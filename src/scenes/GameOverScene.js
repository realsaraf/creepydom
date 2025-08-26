class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.level = data.level || 1;
        this.reason = data.reason || null;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Get sound manager
        this.soundManager = this.registry.get('soundManager');

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0a, 0.9);

        // Game Over animation
        this.createGameOverAnimation();

        // Game Over text
        const gameOverText = this.add.text(width / 2, height / 2 - 100, 'GAME OVER', {
            fontSize: '48px',
            fill: '#ff4444',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Animate game over text
        gameOverText.setScale(0);
        this.tweens.add({
            targets: gameOverText,
            scaleX: 1,
            scaleY: 1,
            duration: 800,
            ease: 'Bounce.easeOut'
        });

        // Level failed text
        this.add.text(width / 2, height / 2 - 40, `Level ${this.level} Failed`, {
            fontSize: '24px',
            fill: '#cccccc'
        }).setOrigin(0.5);

        // Failure message
        let message;
        if (this.reason) {
            message = this.reason;
        } else {
            const messages = [
                'You were eaten by a larger insect!',
                'No valid moves available!',
                'Evolution is tough!',
                'Try a different strategy!'
            ];
            message = messages[Math.floor(Math.random() * messages.length)];
        }
        
        this.add.text(width / 2, height / 2, message, {
            fontSize: '18px',
            fill: this.reason ? '#ff8800' : '#999999'
        }).setOrigin(0.5);

        // Buttons
        this.createButton(width / 2 - 100, height / 2 + 80, 'RETRY', () => {
            this.soundManager.playClickSound();
            this.scene.start('GameScene');
        });

        this.createButton(width / 2 + 100, height / 2 + 80, 'MENU', () => {
            this.soundManager.playClickSound();
            this.scene.start('MenuScene');
        });

        this.createButton(width / 2, height / 2 + 140, 'LEVEL SELECT', () => {
            this.soundManager.playClickSound();
            this.scene.start('LevelSelectScene');
        });

        // Tips
        this.showTips();
    }

    createGameOverAnimation() {
        // Create floating skull or death particles
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(5, 15);
            
            const particle = this.add.circle(x, y, size, 0x660000, 0.3);
            
            this.tweens.add({
                targets: particle,
                y: y - 100,
                alpha: 0,
                duration: Phaser.Math.Between(2000, 4000),
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
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

    showTips() {
        const tips = [
            '💡 Tip: Look for smaller insects to eat first',
            '💡 Tip: Plan your path to avoid larger predators',
            '💡 Tip: Use special insects strategically',
            '💡 Tip: Sometimes you need to go around obstacles',
            '💡 Tip: Special insects can help you grow faster'
        ];

        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 80, randomTip, {
            fontSize: '14px',
            fill: '#7474b4',
            backgroundColor: '#1a1a2a',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5);
    }
}
