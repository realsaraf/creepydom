class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Get sound manager
        this.soundManager = this.registry.get('soundManager');

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

        // Title
        this.add.text(width / 2, 50, 'Select Level', {
            fontSize: '36px',
            fill: '#7474b4',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Back button
        this.createBackButton();

        // Get progress
        this.progress = GameData.getProgress();

        // Create level grid
        this.createLevelGrid();

        // Progress text
        this.add.text(width / 2, height - 50, `Progress: ${this.progress.unlockedLevels - 1} / 20 levels completed`, {
            fontSize: '16px',
            fill: '#cccccc'
        }).setOrigin(0.5);
    }

    createBackButton() {
        const backButton = this.add.container(50, 50);
        
        const bg = this.add.rectangle(0, 0, 80, 40, 0x2a2a4a);
        bg.setStrokeStyle(2, 0x4a4a6a);
        bg.setInteractive();

        const text = this.add.text(0, 0, 'BACK', {
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        backButton.add([bg, text]);

        bg.on('pointerover', () => {
            bg.setFillStyle(0x3a3a5a);
            this.input.setDefaultCursor('pointer');
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x2a2a4a);
            this.input.setDefaultCursor('default');
        });

        bg.on('pointerdown', () => {
            this.soundManager.playClickSound();
            this.scene.start('MenuScene');
        });
    }

    createLevelGrid() {
        const startX = 150;
        const startY = 120;
        const buttonSize = 80;
        const spacingX = 100;
        const spacingY = 100;
        const columns = 5;

        for (let level = 1; level <= 20; level++) {
            const row = Math.floor((level - 1) / columns);
            const col = (level - 1) % columns;
            
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;

            this.createLevelButton(x, y, level, buttonSize);
        }
    }

    createLevelButton(x, y, level, size) {
        const isUnlocked = level <= this.progress.unlockedLevels;
        const levelData = GameData.getLevelData(level);
        
        const button = this.add.container(x, y);

        // Button background
        const bg = this.add.rectangle(0, 0, size, size, isUnlocked ? 0x2a2a4a : 0x1a1a1a);
        bg.setStrokeStyle(2, isUnlocked ? 0x4a4a6a : 0x2a2a2a);
        
        if (isUnlocked) {
            bg.setInteractive();
        }

        // Level number
        const levelText = this.add.text(0, -10, level.toString(), {
            fontSize: '24px',
            fill: isUnlocked ? '#ffffff' : '#444444',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Start and target insects
        const startType = GameData.getInsectType(levelData.startType);
        const targetType = GameData.getInsectType(levelData.targetType);

        const startIcon = this.add.circle(-15, 15, 8, startType.color);
        const arrow = this.add.text(0, 15, '→', {
            fontSize: '12px',
            fill: isUnlocked ? '#cccccc' : '#333333'
        }).setOrigin(0.5);
        const targetIcon = this.add.circle(15, 15, 8, targetType.color);

        if (!isUnlocked) {
            startIcon.setAlpha(0.3);
            targetIcon.setAlpha(0.3);
        }

        button.add([bg, levelText, startIcon, arrow, targetIcon]);

        // Lock icon for locked levels
        if (!isUnlocked) {
            const lockIcon = this.add.text(0, 0, '🔒', {
                fontSize: '20px'
            }).setOrigin(0.5);
            button.add(lockIcon);
        }

        // Hover and click effects
        if (isUnlocked) {
            bg.on('pointerover', () => {
                bg.setFillStyle(0x3a3a5a);
                bg.setStrokeStyle(3, 0x6a6a8a);
                this.input.setDefaultCursor('pointer');
                
                // Show level info
                this.showLevelInfo(level, levelData);
            });

            bg.on('pointerout', () => {
                bg.setFillStyle(0x2a2a4a);
                bg.setStrokeStyle(2, 0x4a4a6a);
                this.input.setDefaultCursor('default');
                
                // Hide level info
                this.hideLevelInfo();
            });

            bg.on('pointerdown', () => {
                this.soundManager.playClickSound();
                this.startLevel(level);
            });
        }

        // Completion indicator
        if (level < this.progress.unlockedLevels) {
            const star = this.add.text(size/2 - 10, -size/2 + 10, '★', {
                fontSize: '16px',
                fill: '#FFD700'
            });
            button.add(star);
        }
    }

    showLevelInfo(level, levelData) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.levelInfoPanel = this.add.container(width - 200, height / 2);

        const bg = this.add.rectangle(0, 0, 180, 150, 0x1a1a2a, 0.9);
        bg.setStrokeStyle(2, 0x4a4a6a);

        const title = this.add.text(0, -60, `Level ${level}`, {
            fontSize: '18px',
            fill: '#7474b4',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const startType = GameData.getInsectType(levelData.startType);
        const targetType = GameData.getInsectType(levelData.targetType);

        const info = [
            `Start: ${startType.name}`,
            `Target: ${targetType.name}`,
            `Grid: ${levelData.gridSize}x${levelData.gridSize}`,
            `Special: ${Math.round(levelData.specialChance * 100)}%`
        ];

        let yOffset = -20;
        info.forEach(text => {
            this.add.text(0, yOffset, text, {
                fontSize: '12px',
                fill: '#cccccc'
            }).setOrigin(0.5);
            yOffset += 20;
        });

        this.levelInfoPanel.add([bg, title, ...this.children.list.slice(-info.length)]);
    }

    hideLevelInfo() {
        if (this.levelInfoPanel) {
            this.levelInfoPanel.destroy();
            this.levelInfoPanel = null;
        }
    }

    startLevel(level) {
        this.hideLevelInfo();
        this.registry.set('currentLevel', level);
        this.scene.start('GameScene');
    }
}
