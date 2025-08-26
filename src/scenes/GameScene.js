class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Prevent accidental move at game start
        this.gameStartTime = Date.now();
        
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
        
        // Setup touch controls for mobile devices
        this.setupTouchControls();
    }

    setupKeyboardControls() {
        // Create cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Add WASD keys as alternative
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // Handle key presses
        this.input.keyboard.on('keydown', (event) => {
            // Ignore keydown events within 500ms of game start
            if (Date.now() - this.gameStartTime < 500) {
                return;
            }
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

    setupTouchControls() {
        // Variables for touch/swipe detection
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50; // minimum distance for a swipe

        // Add touch start event
        this.input.on('pointerdown', (pointer) => {
            if (this.gameOver || this.levelComplete || !this.player || !this.player.canMove) {
                return;
            }
            this.touchStartX = pointer.x;
            this.touchStartY = pointer.y;
        });

        // On touch end, decide if it's a swipe or tap-to-move
        this.input.on('pointerup', (pointer) => {
            // Ignore pointerup events within 500ms of game start
            if (Date.now() - this.gameStartTime < 500) {
                return;
            }
            if (this.gameOver || this.levelComplete || !this.player || !this.player.canMove) {
                return;
            }
            this.touchEndX = pointer.x;
            this.touchEndY = pointer.y;

            const deltaX = this.touchEndX - this.touchStartX;
            const deltaY = this.touchEndY - this.touchStartY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance >= this.minSwipeDistance) {
                // Handle swipe
                this.handleSwipe();
            } else {
                // Handle tap-to-move
                const gridPos = this.worldToGrid(pointer.x, pointer.y);
                if (gridPos.x >= 0 && gridPos.x < this.gridSize && 
                    gridPos.y >= 0 && gridPos.y < this.gridSize) {
                    const dx = Math.abs(gridPos.x - this.player.gridX);
                    const dy = Math.abs(gridPos.y - this.player.gridY);
                    if (dx + dy === 1) { // Adjacent cell
                        this.onCellClicked(gridPos.x, gridPos.y);
                        this.triggerHapticFeedback();
                    }
                }
            }
        });
    }

    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        
        // Check if swipe distance is sufficient
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance < this.minSwipeDistance) {
            return; // Not a swipe, just a tap
        }

        // Determine swipe direction
        let moveX = 0;
        let moveY = 0;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            moveX = deltaX > 0 ? 1 : -1;
        } else {
            // Vertical swipe
            moveY = deltaY > 0 ? 1 : -1;
        }

        // Calculate target position
        const targetX = this.player.gridX + moveX;
        const targetY = this.player.gridY + moveY;
        
        // Check bounds
        if (targetX < 0 || targetX >= this.gridSize || targetY < 0 || targetY >= this.gridSize) {
            return;
        }
        
        // Move to target position
        this.onCellClicked(targetX, targetY);
        
        // Add haptic feedback for mobile devices
        this.triggerHapticFeedback();
    }

    triggerHapticFeedback() {
        // Trigger haptic feedback if available (iOS/Android)
        if (navigator.vibrate) {
            navigator.vibrate(50); // Short vibration
        }
    }

    createUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create main game background (beige/cream color like in reference)
        this.add.rectangle(width / 2, height / 2, width, height, 0xF5DEB3);
        
        // Create game area background (left side, beige)
        const gameAreaWidth = width * 0.6; // 60% for game area
        this.add.rectangle(gameAreaWidth / 2, height / 2, gameAreaWidth, height, 0xF5DEB3);
        
        // Create stats panel background (right side, green)
        const statsWidth = width * 0.4; // 40% for stats
        const statsPanel = this.add.rectangle(gameAreaWidth + statsWidth / 2, height / 2, statsWidth, height, 0x228B22);
        
        // Top brown header bar with timer
        const headerHeight = 60;
        const headerBar = this.add.rectangle(width / 2, headerHeight / 2, width, headerHeight, 0x8B4513);
        
        // Timer in header (center)
        this.timerText = this.add.text(width / 2, headerHeight / 2, this.formatTime(this.timeRemaining), {
            fontSize: '24px',
            fill: '#FFFF00',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif'
        }).setOrigin(0.5);
        
        // Retry button (left side of header)
        this.createHeaderButton(100, headerHeight / 2, 'RETRY', 0xFF4444, () => {
            if (this.soundManager) this.soundManager.playClickSound();
            this.scene.restart();
        });
        
        // Menu button (right side of header)
        this.createHeaderButton(width - 100, headerHeight / 2, 'MENU', 0x44FF44, () => {
            if (this.soundManager) this.soundManager.playClickSound();
            this.scene.start('MenuScene');
        });

        // Update game area positioning
        this.startX = (gameAreaWidth - (this.gridSize * this.cellSize)) / 2;
        this.startY = headerHeight + 20;

        // Create stats panel content
        this.createStatsPanel(gameAreaWidth, statsWidth, height);
        
        // Add jungle decorations only in game area
        this.createJungleBackground(gameAreaWidth);
    }

    createHeaderButton(x, y, text, color, callback) {
        const button = this.add.rectangle(x, y, 80, 40, color);
        button.setStrokeStyle(2, 0x000000);
        button.setInteractive();
        
        const buttonText = this.add.text(x, y, text, {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif'
        }).setOrigin(0.5);

        button.on('pointerover', () => {
            button.setScale(1.1);
        });

        button.on('pointerout', () => {
            button.setScale(1);
        });

        button.on('pointerdown', () => {
            button.setScale(0.95);
            callback();
        });

        button.on('pointerup', () => {
            button.setScale(1.1);
        });
    }

    createStatsPanel(gameAreaWidth, statsWidth, height) {
        const panelX = gameAreaWidth + 20;
        const headerHeight = 60;
        
        // "GAME STATS" title
        this.add.text(panelX, headerHeight + 30, 'GAME STATS', {
            fontSize: '20px',
            fill: '#FFFF00',
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif'
        });
        
        // Current insect section
        let yPos = headerHeight + 80;
        this.add.text(panelX, yPos, 'CURRENT', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontWeight: 'bold'
        });
        
        // Current insect display (yellow circle like in reference)
        this.currentInsectDisplay = this.add.circle(panelX + 60, yPos + 30, 25, 0xFFFF00);
        this.currentInsectDisplay.setStrokeStyle(3, 0x000000);
        
        // Mite section
        yPos += 100;
        this.add.text(panelX, yPos, 'MITE', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontWeight: 'bold'
        });
        
        // Mite display (brown circle)
        this.add.circle(panelX + 60, yPos + 30, 25, 0x8B4513);
        this.add.circle(panelX + 60, yPos + 30, 25, 0x000000, 0).setStrokeStyle(3, 0x000000);
        
        // Score section
        yPos += 100;
        this.add.text(panelX, yPos, 'SCORE', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontWeight: 'bold'
        });
        
        this.scoreText = this.add.text(panelX, yPos + 30, '1', {
            fontSize: '18px',
            fill: '#FFFF00',
            fontWeight: 'bold'
        });
        
        // Target section
        yPos += 100;
        this.add.text(panelX, yPos, 'TARGET', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontWeight: 'bold'
        });
        
        // Target display (flea - gray circle)
        this.add.text(panelX, yPos + 25, 'FLEA', {
            fontSize: '14px',
            fill: '#FFFF00',
            fontWeight: 'bold'
        });
        
        this.add.circle(panelX + 60, yPos + 50, 25, 0x666666);
        this.add.circle(panelX + 60, yPos + 50, 25, 0x000000, 0).setStrokeStyle(3, 0x000000);
        
        // Controls section at bottom
        yPos = height - 120;
        this.add.text(panelX, yPos, 'CONTROLS', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontWeight: 'bold'
        });
        
        this.add.text(panelX, yPos + 25, '↑ ↓ ←', {
            fontSize: '16px',
            fill: '#FFFFFF'
        });
        
        this.add.text(panelX, yPos + 45, 'or WASD', {
            fontSize: '12px',
            fill: '#FFFFFF'
        });
        
        // Flavor text
        yPos += 80;
        this.add.text(panelX, yPos, 'EAT SMALLER BUGS', {
            fontSize: '12px',
            fill: '#FFFF00',
            fontWeight: 'bold'
        });
        
        this.add.text(panelX, yPos + 15, 'AVOID BIGGER ONES!', {
            fontSize: '12px',
            fill: '#FFFF00',
            fontWeight: 'bold'
        });
    }

    addMobileControlsInfo() {
        // Check if this is likely a touch device
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isTouchDevice) {
            const width = this.cameras.main.width;
            
            // Add touch controls info at the bottom
            this.add.text(20, this.cameras.main.height - 60, '📱 TOUCH CONTROLS:', {
                fontSize: '14px',
                fill: '#8B4513',
                fontWeight: 'bold'
            });
            
            this.add.text(20, this.cameras.main.height - 40, '👆 Tap adjacent cells to move', {
                fontSize: '12px',
                fill: '#654321'
            });
            
            this.add.text(20, this.cameras.main.height - 20, '👋 Swipe to move in that direction', {
                fontSize: '12px',
                fill: '#654321'
            });
        } else {
            // Show keyboard controls for desktop
            this.add.text(20, this.cameras.main.height - 40, '⌨️ Use Arrow Keys or WASD to move', {
                fontSize: '12px',
                fill: '#654321'
            });
        }
    }

    createJungleBackground(gameAreaWidth) {
        // Add jungle vines and leaves only in game area (left side)
        for (let i = 0; i < 8; i++) {
            const x = Phaser.Math.Between(0, gameAreaWidth - 20);
            const y = Phaser.Math.Between(100, this.cameras.main.height - 80);
            const jungleElements = ['🌿', '🍃', '🌱', '🦋'];
            const element = jungleElements[Math.floor(Math.random() * jungleElements.length)];
            
            const decoration = this.add.text(x, y, element, {
                fontSize: '16px',
                alpha: 0.3
            });
            
            // Gentle swaying animation like jungle breeze
            this.tweens.add({
                targets: decoration,
                x: x + Phaser.Math.Between(-15, 15),
                alpha: 0.6,
                duration: 4000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

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
        // Find a safe empty spot for player (not adjacent to dangerous insect)
        let safeSpots = [];
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                if (this.grid[x][y] !== null) continue;
                let safe = true;
                // Check adjacent cells
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        if (Math.abs(dx) + Math.abs(dy) !== 1) continue; // Only orthogonal
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) continue;
                        const neighbor = this.grid[nx][ny];
                        if (neighbor && neighbor instanceof Insect) {
                            // Only dangerous if player cannot eat
                            const playerTypeId = this.levelData.startType;
                            if (!GameData.canEat(playerTypeId, neighbor.getInsectTypeId())) {
                                safe = false;
                            }
                        }
                    }
                }
                if (safe) safeSpots.push({x, y});
            }
        }
        let playerX, playerY;
        if (safeSpots.length > 0) {
            const spot = safeSpots[Phaser.Math.Between(0, safeSpots.length - 1)];
            playerX = spot.x;
            playerY = spot.y;
        } else {
            // Fallback: any empty spot
            do {
                playerX = Phaser.Math.Between(0, this.gridSize - 1);
                playerY = Phaser.Math.Between(0, this.gridSize - 1);
            } while (this.grid[playerX][playerY] !== null);
        }
        const worldPos = this.gridToWorld(playerX, playerY);
        this.player = new Player(this, worldPos.x, worldPos.y, this.levelData.startType);
        this.player.setGridPosition(playerX, playerY);
        this.grid[playerX][playerY] = this.player;
        this.updateStatsDisplay();
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

        // Start timer on first move
        if (!this.timerStarted) {
            this.startTimer();
        }

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

        // Start timer on first move
        if (!this.timerStarted) {
            this.startTimer();
        }

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
        
        this.updateStatsDisplay();
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

    updateStatsDisplay() {
        if (this.scoreText && this.player) {
            this.scoreText.setText(this.player.getScore().toString());
        }
        
        if (this.currentInsectDisplay && this.player) {
            const currentType = GameData.getInsectType(this.player.getCurrentTypeId());
            // Update color based on current insect type
            switch(currentType.name.toLowerCase()) {
                case 'mite':
                    this.currentInsectDisplay.setFillStyle(0x8B4513); // Brown
                    break;
                case 'flea':
                    this.currentInsectDisplay.setFillStyle(0x666666); // Gray
                    break;
                case 'gnat':
                    this.currentInsectDisplay.setFillStyle(0x90EE90); // Light green
                    break;
                default:
                    this.currentInsectDisplay.setFillStyle(0xFFFF00); // Yellow
            }
        }
    }
}
