class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    create() {
        console.log('LevelSelectScene create() called');
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Get sound manager
        this.soundManager = this.registry.get('soundManager');

        // Create beautiful Candy Crush-style background
        this.createCandyBackground(width, height);
        
        // Add floating particles for magical effect
        this.createFloatingParticles();

        // Beautiful header section
        this.createHeaderSection(width, height);

        // Back button with modern design
        this.createModernBackButton();

        // Get progress
        this.progress = GameData.getProgress();

        // Create beautiful level grid with Candy Crush styling
        this.createCandyLevelGrid(width, height);

        // Progress section at bottom with modern styling
        this.createProgressSection(width, height);
    }

    createCandyBackground(width, height) {
        // Main gradient background - same as menu
        const gradient = this.add.graphics();
        gradient.fillGradientStyle(0xFF6B8A, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 1);
        gradient.fillRect(0, 0, width, height);

        // Overlay with subtle pattern
        const overlay = this.add.graphics();
        overlay.fillGradientStyle(0xFFEAA7, 0xFF6B8A, 0x96CEB4, 0x4ECDC4, 0.2);
        overlay.fillRect(0, 0, width, height);

        // Animated bubbles in background
        for (let i = 0; i < 6; i++) {
            const bubble = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(20, 60),
                0xFFFFFF,
                0.1
            );
            
            this.tweens.add({
                targets: bubble,
                y: bubble.y - 100,
                duration: Phaser.Math.Between(8000, 12000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }
    }

    createFloatingParticles() {
        // Create floating candy-like particles
        for (let i = 0; i < 8; i++) {
            const colors = [0xFF6B8A, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 0xFFEAA7];
            const particle = this.add.circle(
                Phaser.Math.Between(50, this.cameras.main.width - 50),
                Phaser.Math.Between(100, this.cameras.main.height - 100),
                Phaser.Math.Between(4, 12),
                colors[Phaser.Math.Between(0, colors.length - 1)],
                0.6
            );
            
            this.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.Between(30, 80),
                x: particle.x + Phaser.Math.Between(-40, 40),
                alpha: { from: 0.6, to: 0.2 },
                scaleX: { from: 1, to: 1.3 },
                scaleY: { from: 1, to: 1.3 },
                duration: Phaser.Math.Between(4000, 8000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000)
            });
        }
    }

    createHeaderSection(width, height) {
        // Header background with candy-style design
        const headerBg = this.add.graphics();
        headerBg.fillStyle(0xFFFFFF, 0.95);
        headerBg.fillRoundedRect(20, 20, width - 40, 100, 30);
        
        // Header border with gradient effect
        headerBg.lineStyle(4, 0xFF6B8A, 1);
        headerBg.strokeRoundedRect(20, 20, width - 40, 100, 30);
        
        // Inner glow effect
        const innerGlow = this.add.graphics();
        innerGlow.fillStyle(0xFF6B8A, 0.1);
        innerGlow.fillRoundedRect(24, 24, width - 48, 92, 26);

        // Title with beautiful styling
        this.add.text(width / 2, 70, 'Choose Your Adventure', {
            fontSize: `${Math.min(28, width * 0.07)}px`,
            fill: '#FF6B8A',
            fontFamily: 'Nunito, Arial Black, Arial',
            fontWeight: '800',
            stroke: '#FFFFFF',
            strokeThickness: 3,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#FF6B8A',
                blur: 10,
                fill: true
            }
        }).setOrigin(0.5);
    }

    createModernBackButton() {
        const backButton = this.add.container(50, 150);
        
        // Button shadow
        const shadow = this.add.graphics();
        shadow.fillStyle(0x3BB5A8, 0.6);
        shadow.fillRoundedRect(-35, 3, 70, 44, 22);
        backButton.add(shadow);
        
        // Main button with candy styling
        const button = this.add.graphics();
        button.fillStyle(0x4ECDC4, 1);
        button.fillRoundedRect(-35, 0, 70, 44, 22);
        button.lineStyle(3, 0xFFFFFF, 0.9);
        button.strokeRoundedRect(-35, 0, 70, 44, 22);
        backButton.add(button);
        
        // Back arrow with modern styling
        const arrow = this.add.text(0, 22, '←', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Arial Black',
            fontWeight: '900'
        }).setOrigin(0.5);
        backButton.add(arrow);
        
        // Make it interactive
        backButton.setSize(70, 44);
        backButton.setInteractive({ useHandCursor: true });
        
        // Hover effects
        backButton.on('pointerover', () => {
            this.tweens.add({
                targets: backButton,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                ease: 'Back.easeOut'
            });
            
            if (this.soundManager) {
                this.soundManager.playUISound();
            }
        });
        
        backButton.on('pointerout', () => {
            this.tweens.add({
                targets: backButton,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        
        backButton.on('pointerdown', () => {
            this.tweens.add({
                targets: backButton,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                ease: 'Power2',
                yoyo: true,
                onComplete: () => {
                    this.scene.start('MenuScene');
                }
            });
            
            if (this.soundManager) {
                this.soundManager.playSelectSound();
            }
        });

        // Add test element for Playwright
        this.createTestElement(50, 150, 70, 44, 'back-button', () => {
            this.scene.start('MenuScene');
        });
    }

    createCandyLevelGrid(width, height) {
        // Create scrollable container for levels
        const gridContainer = this.add.container(width / 2, height / 2 + 40);
        
        // Calculate grid layout - 4 columns for better mobile experience
        const levels = 20;
        const cols = 4;
        const rows = Math.ceil(levels / cols);
        const buttonSize = Math.min(70, (width - 100) / cols);
        const spacing = 25;
        
        const startX = -(cols - 1) * (buttonSize + spacing) / 2;
        const startY = -(rows - 1) * (buttonSize + spacing) / 2;
        
        for (let i = 0; i < levels; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            
            const x = startX + col * (buttonSize + spacing);
            const y = startY + row * (buttonSize + spacing);
            
            const levelButton = this.createCandyLevelButton(i + 1, x, y, buttonSize);
            gridContainer.add(levelButton);
        }
    }

    createCandyLevelButton(level, x, y, size) {
        const container = this.add.container(x, y);
        
        // Check if level is unlocked
        const isUnlocked = level <= this.progress.unlockedLevels;
        const isCompleted = level < this.progress.unlockedLevels;
        
        // Button shadow with candy effect
        const shadow = this.add.graphics();
        if (isCompleted) {
            shadow.fillStyle(0xB8860B, 0.6); // Gold shadow for completed
        } else if (isUnlocked) {
            shadow.fillStyle(0x2A7F7F, 0.6); // Teal shadow for available
        } else {
            shadow.fillStyle(0x444444, 0.4); // Gray shadow for locked
        }
        shadow.fillRoundedRect(-size/2, -size/2 + 4, size, size, 18);
        container.add(shadow);
        
        // Main button with beautiful gradient
        const button = this.add.graphics();
        
        if (isCompleted) {
            // Completed - gold gradient
            button.fillGradientStyle(0xFFD700, 0xFFA500, 0xFFD700, 0xFFA500, 1);
        } else if (isUnlocked) {
            // Available - beautiful teal gradient
            button.fillGradientStyle(0x4ECDC4, 0x96CEB4, 0x4ECDC4, 0x96CEB4, 1);
        } else {
            // Locked - gray gradient
            button.fillGradientStyle(0x666666, 0x444444, 0x666666, 0x444444, 0.7);
        }
        
        button.fillRoundedRect(-size/2, -size/2, size, size, 18);
        
        // Beautiful border with glow effect
        const borderColor = isCompleted ? 0xFFD700 : (isUnlocked ? 0xFFFFFF : 0x777777);
        button.lineStyle(3, borderColor, 0.9);
        button.strokeRoundedRect(-size/2, -size/2, size, size, 18);
        
        // Inner highlight for 3D effect
        const highlight = this.add.graphics();
        if (isUnlocked) {
            highlight.fillStyle(0xFFFFFF, 0.3);
            highlight.fillRoundedRect(-size/2 + 4, -size/2 + 4, size - 8, size/3, 12);
        }
        
        container.add([button, highlight]);
        
        // Level number or lock icon
        if (isUnlocked) {
            const levelText = this.add.text(0, -8, level.toString(), {
                fontSize: `${Math.min(22, size * 0.35)}px`,
                fill: '#FFFFFF',
                fontFamily: 'Nunito, Arial Black',
                fontWeight: '900',
                stroke: isCompleted ? '#B8860B' : '#2A7F7F',
                strokeThickness: 2,
                shadow: {
                    offsetX: 1,
                    offsetY: 1,
                    color: '#000000',
                    blur: 3,
                    fill: true
                }
            }).setOrigin(0.5);
            container.add(levelText);
            
            // Stars for completed levels
            if (isCompleted) {
                const star = this.add.text(0, size * 0.2, '★', {
                    fontSize: `${size * 0.3}px`,
                    fill: '#FFD700',
                    shadow: {
                        offsetX: 1,
                        offsetY: 1,
                        color: '#B8860B',
                        blur: 2,
                        fill: true
                    }
                }).setOrigin(0.5);
                container.add(star);
                
                // Sparkling animation for completed levels
                this.tweens.add({
                    targets: star,
                    scaleX: { from: 1, to: 1.2 },
                    scaleY: { from: 1, to: 1.2 },
                    duration: 2000,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1,
                    delay: Phaser.Math.Between(0, 4000)
                });
            }
        } else {
            const lockIcon = this.add.text(0, 0, '🔒', {
                fontSize: `${size * 0.4}px`,
                alpha: 0.8
            }).setOrigin(0.5);
            container.add(lockIcon);
        }
        
        // Make interactive if unlocked
        if (isUnlocked) {
            container.setSize(size, size);
            container.setInteractive({ useHandCursor: true });
            
            // Beautiful hover effects
            container.on('pointerover', () => {
                this.tweens.add({
                    targets: container,
                    scaleX: 1.15,
                    scaleY: 1.15,
                    duration: 200,
                    ease: 'Back.easeOut'
                });
                
                // Add glow effect
                const glow = this.add.graphics();
                glow.fillStyle(isCompleted ? 0xFFD700 : 0x4ECDC4, 0.3);
                glow.fillCircle(x, y, size * 0.7);
                container.addAt(glow, 0);
                container.glowEffect = glow;
                
                if (this.soundManager) {
                    this.soundManager.playUISound();
                }
            });
            
            container.on('pointerout', () => {
                this.tweens.add({
                    targets: container,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Back.easeOut'
                });
                
                // Remove glow effect
                if (container.glowEffect) {
                    container.glowEffect.destroy();
                    container.glowEffect = null;
                }
            });
            
            container.on('pointerdown', () => {
                this.tweens.add({
                    targets: container,
                    scaleX: 0.9,
                    scaleY: 0.9,
                    duration: 100,
                    ease: 'Power2',
                    yoyo: true,
                    onComplete: () => {
                        this.startLevel(level);
                    }
                });
                
                if (this.soundManager) {
                    this.soundManager.playSelectSound();
                }
            });

            // Add test element for Playwright
            this.createTestElement(
                this.cameras.main.width / 2 + x, 
                this.cameras.main.height / 2 + 40 + y, 
                size, size, 
                `level-${level}-button`, 
                () => this.startLevel(level)
            );
        }
        
        return container;
    }

    createProgressSection(width, height) {
        // Progress container at bottom with beautiful styling
        const progressY = height - 80;
        
        // Progress background with candy styling
        const progressBg = this.add.graphics();
        progressBg.fillStyle(0xFFFFFF, 0.95);
        progressBg.fillRoundedRect(20, progressY - 35, width - 40, 70, 25);
        progressBg.lineStyle(3, 0x4ECDC4, 1);
        progressBg.strokeRoundedRect(20, progressY - 35, width - 40, 70, 25);
        
        // Inner glow
        const innerGlow = this.add.graphics();
        innerGlow.fillStyle(0x4ECDC4, 0.1);
        innerGlow.fillRoundedRect(24, progressY - 31, width - 48, 62, 21);
        
        // Progress text with beautiful styling
        const completedLevels = Math.max(0, this.progress.unlockedLevels - 1);
        const progressText = `Adventure Progress: ${completedLevels}/20 levels completed`;
        
        this.add.text(width / 2, progressY - 10, progressText, {
            fontSize: `${Math.min(16, width * 0.04)}px`,
            fill: '#4ECDC4',
            fontFamily: 'Nunito, Arial',
            fontWeight: '700',
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#FFFFFF',
                blur: 2,
                fill: true
            }
        }).setOrigin(0.5);
        
        // Progress bar with candy styling
        const barWidth = width - 100;
        const barHeight = 12;
        const barY = progressY + 15;
        
        // Background bar
        const barBg = this.add.graphics();
        barBg.fillStyle(0xDDDDDD, 1);
        barBg.fillRoundedRect((width - barWidth) / 2, barY - barHeight/2, barWidth, barHeight, 6);
        
        // Progress bar with beautiful gradient
        const progressWidth = (completedLevels / 20) * barWidth;
        if (progressWidth > 0) {
            const progressBar = this.add.graphics();
            progressBar.fillGradientStyle(0xFF6B8A, 0x4ECDC4, 0xFF6B8A, 0x4ECDC4, 1);
            progressBar.fillRoundedRect((width - barWidth) / 2, barY - barHeight/2, progressWidth, barHeight, 6);
            
            // Add shine effect to progress bar
            const shine = this.add.graphics();
            shine.fillStyle(0xFFFFFF, 0.4);
            shine.fillRoundedRect((width - barWidth) / 2 + 2, barY - barHeight/2 + 2, Math.max(0, progressWidth - 4), barHeight/2, 3);
        }
    }

    createTestElement(x, y, width, height, testId, callback) {
        // Get the canvas element and its position
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        
        const canvasRect = canvas.getBoundingClientRect();
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        
        // Calculate scale factors
        const scaleX = canvasRect.width / gameWidth;
        const scaleY = canvasRect.height / gameHeight;
        
        // Create invisible DOM element for testing
        const testElement = document.createElement('div');
        testElement.setAttribute('data-testid', testId);
        testElement.style.position = 'absolute';
        testElement.style.left = `${canvasRect.left + (x - width/2) * scaleX}px`;
        testElement.style.top = `${canvasRect.top + (y - height/2) * scaleY}px`;
        testElement.style.width = `${width * scaleX}px`;
        testElement.style.height = `${height * scaleY}px`;
        testElement.style.backgroundColor = 'transparent';
        testElement.style.pointerEvents = 'all';
        testElement.style.zIndex = '1000';
        testElement.style.cursor = 'pointer';
        
        // Add click handler
        testElement.addEventListener('click', (e) => {
            e.preventDefault();
            if (callback) callback();
        });
        
        // Add to document
        document.body.appendChild(testElement);
        
        // Store reference for cleanup
        if (!this.testElements) this.testElements = [];
        this.testElements.push(testElement);
        
        // Clean up when scene is destroyed
        this.events.once('destroy', () => {
            if (this.testElements) {
                this.testElements.forEach(el => {
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                });
                this.testElements = [];
            }
        });
    }

    startLevel(level) {
        // Set the selected level in the registry
        this.registry.set('selectedLevel', level);
        
        // Start the game scene
        this.scene.start('GameScene', { level: level });
    }
}
