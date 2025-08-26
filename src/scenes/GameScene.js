class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Get current level and sound manager
        this.currentLevel = this.registry.get('currentLevel') || 1;
        this.soundManager = this.registry.get('soundManager');
        this.levelData = GameData.getLevelData(this.currentLevel);

        // Initialize game state
        this.gridSize = this.levelData.gridSize;
        this.cellSize = 60;
        
        // Reserve space for stats panel on the right (200px)
        const gameAreaWidth = this.cameras.main.width - 220;
        this.startX = (gameAreaWidth - (this.gridSize * this.cellSize)) / 2;
        this.startY = 100;
        
        this.insects = [];
        this.player = null;
        this.gameOver = false;
        this.levelComplete = false;
        this.moveHighlights = [];

        // Timer system
        this.timeLimit = this.getTimeLimitForLevel(this.currentLevel);
        this.timeRemaining = this.timeLimit;
        this.timerStarted = false;

        // Create UI
        this.createUI();
        
        // Create game grid
        this.createGrid();
        
        // Generate insects
        this.generateInsects();
        
        // Create player
        this.createPlayer();
        
        // Setup keyboard controls
        this.setupKeyboardControls();
    }

    setupKeyboardControls() {
        // Create cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Add WASD keys as alternative
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // Handle key presses
        this.input.keyboard.on('keydown', (event) => {
            if (this.gameOver || this.levelComplete || !this.player || !this.player.canMove) {
                return;
            }

            let deltaX = 0;
            let deltaY = 0;

            // Check for movement keys
            if (event.code === 'ArrowUp' || event.code === 'KeyW') {
                deltaY = -1;
            } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
                deltaY = 1;
            } else if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
                deltaX = -1;
            } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
                deltaX = 1;
            } else {
                return; // Not a movement key
            }
            
            // Calculate target position
            const targetX = this.player.gridX + deltaX;
            const targetY = this.player.gridY + deltaY;
            
            // Check bounds
            if (targetX < 0 || targetX >= this.gridSize || targetY < 0 || targetY >= this.gridSize) {
                return;
            }
            
            // Move to target position
            this.onCellClicked(targetX, targetY);
        });
    }

    createUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Jungle-themed background
        this.add.rectangle(width / 2, height / 2, width, height, 0xF5DEB3);
        
        // Add jungle background elements
        this.createJungleBackground();

        // Top sports-style header bar
        const headerBar = this.add.rectangle((width - 200) / 2, 40, width - 200, 70, 0x228B22);
        headerBar.setStrokeStyle(4, 0x8B4513);
        
        // Level info with jungle theme
        this.add.text(30, 25, `🌴 LEVEL ${this.currentLevel}`, {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif',
            stroke: '#8B4513',
            strokeThickness: 3
        }).setOrigin(0, 0.5);

        // Target info with sports styling
        const targetType = GameData.getInsectType(this.levelData.targetType);
        this.add.text((width - 200) / 2, 25, `🏆 TARGET: ${targetType.name.toUpperCase()}`, {
            fontSize: '16px',
            fill: '#FFFF00',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif',
            stroke: '#8B4513',
            strokeThickness: 2
        }).setOrigin(0.5, 0.5);

        // Timer display in header
        this.timerBg = this.add.rectangle((width - 200) - 80, 25, 120, 35, 0x8B4513);
        this.timerBg.setStrokeStyle(3, 0xFFD700);
        
        this.timerText = this.add.text((width - 200) - 80, 25, this.formatTime(this.timeRemaining), {
            fontSize: '18px',
            fill: '#FFFF00',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif'
        }).setOrigin(0.5, 0.5);

        // Timer icon
        this.add.text((width - 200) - 130, 25, '⏱️', {
            fontSize: '20px'
        }).setOrigin(0.5, 0.5);

        // Sports-style action buttons in header
        this.createSportsButton((width - 200) - 80, 55, 'MENU', 60, 20, 0x32CD32, () => {
            this.soundManager.playClickSound();
            this.scene.start('MenuScene');
        });

        this.createSportsButton((width - 200) - 150, 55, 'RETRY', 60, 20, 0xFF6347, () => {
            this.soundManager.playClickSound();
            this.scene.restart();
        });

        // Create sidebar stats panel (non-overlapping)
        this.createSidebarStatsPanel();
    }

    createJungleBackground() {
        // Add jungle vines and leaves (avoid sidebar area)
        const gameAreaWidth = this.cameras.main.width - 200; // Avoid sidebar
        for (let i = 0; i < 12; i++) {
            const x = Phaser.Math.Between(0, gameAreaWidth);
            const y = Phaser.Math.Between(80, this.cameras.main.height - 80);
            const jungleElements = ['🌿', '🍃', '🌱', '🦋', '🐛', '🌳'];
            const element = jungleElements[Math.floor(Math.random() * jungleElements.length)];
            
            const decoration = this.add.text(x, y, element, {
                fontSize: '16px',
                alpha: 0.4
            });
            
            // Gentle swaying animation like jungle breeze
            this.tweens.add({
                targets: decoration,
                x: x + Phaser.Math.Between(-20, 20),
                alpha: 0.7,
                duration: 4000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createSportsButton(x, y, text, width, height, color, callback) {
        const button = this.add.rectangle(x, y, width, height, color);
        button.setStrokeStyle(3, 0x8B4513);
        button.setInteractive();
        
        const buttonText = this.add.text(x, y, text, {
            fontSize: '12px',
            fill: '#FFFFFF',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif'
        }).setOrigin(0.5);

        // Sports-style hover effects
        button.on('pointerover', () => {
            button.setScale(1.1);
            button.setFillStyle(Phaser.Display.Color.GetColor32(
                Phaser.Display.Color.Lighten(Phaser.Display.Color.ValueToColor(color), 20)
            ));
        });

        button.on('pointerout', () => {
            button.setScale(1);
            button.setFillStyle(color);
        });

        button.on('pointerdown', callback);
        
        return { button, text: buttonText };
    }

    createSidebarStatsPanel() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const sidebarX = width - 100; // Right edge sidebar
        const sidebarWidth = 180;
        
        // Sidebar background - full height panel
        this.sidebarBg = this.add.rectangle(sidebarX, height / 2, sidebarWidth, height - 20, 0x228B22, 0.9);
        this.sidebarBg.setStrokeStyle(4, 0x8B4513);
        
        // Sidebar header
        this.add.text(sidebarX, 100, '📊 GAME STATS', {
            fontSize: '16px',
            fill: '#FFFF00',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif',
            stroke: '#8B4513',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Divider line
        const dividerY = 130;
        this.add.rectangle(sidebarX, dividerY, 140, 3, 0x8B4513);

        // Current Player Section
        this.add.text(sidebarX, 150, '🦗 CURRENT', {
            fontSize: '14px',
            fill: '#90EE90',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif'
        }).setOrigin(0.5);

        this.playerTypeText = this.add.text(sidebarX, 175, '', {
            fontSize: '13px',
            fill: '#FFFFFF',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif'
        }).setOrigin(0.5);

        // Points Section
        this.add.text(sidebarX, 210, '⚡ SCORE', {
            fontSize: '14px',
            fill: '#90EE90',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif'
        }).setOrigin(0.5);

        this.playerPointsText = this.add.text(sidebarX, 235, '', {
            fontSize: '13px',
            fill: '#FFFF00',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif'
        }).setOrigin(0.5);

        // Target Section
        this.add.text(sidebarX, 270, '🎯 TARGET', {
            fontSize: '14px',
            fill: '#90EE90',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif'
        }).setOrigin(0.5);

        this.playerProgressText = this.add.text(sidebarX, 295, '', {
            fontSize: '12px',
            fill: '#FFD700',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif'
        }).setOrigin(0.5);

        // Progress bar background
        this.progressBarBg = this.add.rectangle(sidebarX, 325, 120, 15, 0x8B4513);
        this.progressBarBg.setStrokeStyle(2, 0xFFD700);
        
        // Progress bar fill
        this.progressBarFill = this.add.rectangle(sidebarX - 60, 325, 0, 11, 0x32CD32);
        this.progressBarFill.setOrigin(0, 0.5);

        // Controls Section
        this.add.text(sidebarX, height - 120, '🎮 CONTROLS', {
            fontSize: '12px',
            fill: '#90EE90',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif'
        }).setOrigin(0.5);
        
        this.add.text(sidebarX, height - 95, '↑↓←→', {
            fontSize: '20px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.add.text(sidebarX, height - 70, 'or WASD', {
            fontSize: '11px',
            fill: '#FFFFFF',
            fontFamily: 'Impact, Arial Black, sans-serif'
        }).setOrigin(0.5);

        // Tips section
        this.add.text(sidebarX, height - 40, '💡 EAT SMALLER BUGS', {
            fontSize: '10px',
            fill: '#FFD700',
            fontFamily: 'Impact, Arial Black, sans-serif'
        }).setOrigin(0.5);
        
        this.add.text(sidebarX, height - 25, 'AVOID BIGGER ONES!', {
            fontSize: '10px',
            fill: '#FFD700',
            fontFamily: 'Impact, Arial Black, sans-serif'
        }).setOrigin(0.5);
    }

    updatePlayerInfo() {
        if (!this.player) return;

        const currentType = GameData.getInsectType(this.player.getCurrentTypeId());
        const targetType = GameData.getInsectType(this.levelData.targetType);

        this.playerTypeText.setText(currentType.name.toUpperCase());
        this.playerPointsText.setText(this.player.getScore().toString());
        this.playerProgressText.setText(targetType.name.toUpperCase());
        
        // Update progress bar
        if (this.progressBarFill) {
            const progress = Math.min(this.player.getScore() / targetType.points, 1);
            const maxWidth = 120;
            const currentWidth = progress * maxWidth;
            this.progressBarFill.displayWidth = currentWidth;
            
            // Change color based on progress
            if (progress >= 1) {
                this.progressBarFill.setFillStyle(0xFFD700); // Gold when complete
            } else if (progress >= 0.7) {
                this.progressBarFill.setFillStyle(0x90EE90); // Light green when close
            } else {
                this.progressBarFill.setFillStyle(0x32CD32); // Regular green
            }
        }
    }

    // Continue with simplified version to get the game working...
    // I'll include essential methods only

    createGrid() {
        this.grid = [];
        for (let x = 0; x < this.gridSize; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.gridSize; y++) {
                this.grid[x][y] = null;
            }
        }
    }

    generateInsects() {
        // Simple insect generation for now
        const numInsects = this.gridSize * this.gridSize * 0.6;
        
        for (let i = 0; i < numInsects; i++) {
            let x, y;
            do {
                x = Phaser.Math.Between(0, this.gridSize - 1);
                y = Phaser.Math.Between(0, this.gridSize - 1);
            } while (this.grid[x][y] !== null);

            const insectType = Phaser.Math.Between(0, Math.min(8, GameData.INSECT_TYPES.length - 1));
            const isSpecial = Math.random() < this.levelData.specialChance;
            const specialType = isSpecial ? GameData.getRandomSpecialType() : null;
            
            const worldPos = this.gridToWorld(x, y);
            const insect = new Insect(this, worldPos.x, worldPos.y, insectType, isSpecial, specialType);
            insect.setGridPosition(x, y);
            
            this.grid[x][y] = insect;
            this.insects.push(insect);
        }
    }

    createPlayer() {
        // Find empty spot for player
        let playerX, playerY;
        do {
            playerX = Phaser.Math.Between(0, this.gridSize - 1);
            playerY = Phaser.Math.Between(0, this.gridSize - 1);
        } while (this.grid[playerX][playerY] !== null);

        const worldPos = this.gridToWorld(playerX, playerY);
        this.player = new Player(this, worldPos.x, worldPos.y, this.levelData.startType);
        this.player.setGridPosition(playerX, playerY);
        this.grid[playerX][playerY] = this.player;
        
        this.updatePlayerInfo();
    }

    gridToWorld(gridX, gridY) {
        return {
            x: this.startX + gridX * this.cellSize + this.cellSize / 2,
            y: this.startY + gridY * this.cellSize + this.cellSize / 2
        };
    }

    worldToGrid(worldX, worldY) {
        return {
            x: Math.floor((worldX - this.startX) / this.cellSize),
            y: Math.floor((worldY - this.startY) / this.cellSize)
        };
    }

    onCellClicked(gridX, gridY) {
        if (this.gameOver || this.levelComplete || !this.player) return;

        const target = this.grid[gridX][gridY];
        
        if (target === null) {
            this.movePlayerToEmptyCell(gridX, gridY);
        } else if (target instanceof Insect || target instanceof MysteryBox) {
            this.onInsectClicked(target);
        }
    }

    movePlayerToEmptyCell(gridX, gridY) {
        // Check if adjacent
        const dx = Math.abs(gridX - this.player.gridX);
        const dy = Math.abs(gridY - this.player.gridY);
        
        if (dx + dy !== 1) return; // Must be adjacent
        
        // Move player
        this.grid[this.player.gridX][this.player.gridY] = null;
        this.grid[gridX][gridY] = this.player;
        this.player.setGridPosition(gridX, gridY);
        
        const worldPos = this.gridToWorld(gridX, gridY);
        this.player.setPosition(worldPos.x, worldPos.y);
    }

    onInsectClicked(insect) {
        // Check if player can eat this insect
        if (!this.player.canEatInsect(insect)) {
            // Player gets eaten!
            this.soundManager.playGameOverSound();
            this.gameOver = true;
            this.time.delayedCall(1000, () => {
                this.scene.start('GameOverScene', { level: this.currentLevel });
            });
            return;
        }

        // Check if adjacent
        const dx = Math.abs(insect.gridX - this.player.gridX);
        const dy = Math.abs(insect.gridY - this.player.gridY);
        
        if (dx + dy !== 1) return;

        // Eat the insect
        this.player.eatInsect(insect);
        
        // Remove from grid and arrays
        this.grid[insect.gridX][insect.gridY] = null;
        const index = this.insects.indexOf(insect);
        if (index > -1) {
            this.insects.splice(index, 1);
        }
        
        // Move player to insect position
        this.grid[this.player.gridX][this.player.gridY] = null;
        this.grid[insect.gridX][insect.gridY] = this.player;
        this.player.setGridPosition(insect.gridX, insect.gridY);
        
        const worldPos = this.gridToWorld(insect.gridX, insect.gridY);
        this.player.setPosition(worldPos.x, worldPos.y);
        
        // Destroy insect
        insect.destroy();
        
        this.updatePlayerInfo();
        this.checkLevelComplete();
    }

    checkLevelComplete() {
        if (this.gameOver || this.levelComplete) return;

        if (this.player.getCurrentTypeId() >= this.levelData.targetType) {
            this.levelComplete = true;
            this.soundManager.playLevelCompleteSound();
            
            // Save progress
            GameData.saveProgress(this.currentLevel);
            
            this.time.delayedCall(1000, () => {
                this.scene.start('LevelCompleteScene', { 
                    level: this.currentLevel,
                    score: this.player.getScore()
                });
            });
        }
    }

    getTimeLimitForLevel(level) {
        // Medium difficulty time limits (in seconds)
        if (level <= 3) return 90;      // 1.5 minutes for beginner levels
        if (level <= 6) return 75;      // 1.25 minutes for easy levels  
        if (level <= 10) return 60;     // 1 minute for medium levels
        if (level <= 15) return 50;     // 50 seconds for hard levels
        return 40;                      // 40 seconds for expert levels
    }

    startTimer() {
        if (this.timerStarted) return;
        
        this.timerStarted = true;
        this.timerEvent = this.time.addEvent({
            delay: 1000, // 1 second
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    updateTimer() {
        if (this.gameOver || this.levelComplete) {
            if (this.timerEvent) {
                this.timerEvent.remove();
            }
            return;
        }

        this.timeRemaining--;
        this.timerText.setText(this.formatTime(this.timeRemaining));

        // Change color based on remaining time - jungle sports theme
        if (this.timeRemaining <= 10) {
            this.timerText.setFill('#FF4500'); // Orange-red for urgency
            this.timerBg.setFillStyle(0x8B0000); // Dark red background
            this.timerText.setScale(1.2);
            // Urgent pulsing animation
            this.tweens.add({
                targets: [this.timerText, this.timerBg],
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 200,
                yoyo: true,
                ease: 'Power2'
            });
        } else if (this.timeRemaining <= 20) {
            this.timerText.setFill('#FFD700'); // Gold for warning
            this.timerBg.setFillStyle(0xB8860B); // Dark goldenrod background
            this.timerText.setScale(1.1);
        }

        // Time up!
        if (this.timeRemaining <= 0) {
            this.onTimeUp();
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    onTimeUp() {
        if (this.gameOver || this.levelComplete) return;
        
        this.gameOver = true;
        this.soundManager.playGameOverSound();
        
        // Flash the timer
        this.tweens.add({
            targets: this.timerText,
            alpha: 0.3,
            duration: 200,
            yoyo: true,
            repeat: 3
        });

        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', { 
                level: this.currentLevel,
                reason: 'Time\'s up!'
            });
        });
    }

    update() {
        // Start timer on first move
        if (!this.timerStarted && this.player && this.player.moveHistory.length > 0) {
            this.startTimer();
        }
    }
}
