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

        // Candy Crush-inspired gradient background
        this.createCandyBackground(width, height);
        
        // Floating particles for magical effect
        this.createFloatingParticles();

        // Game logo with Candy Crush style
        this.createGameLogo(width, height);
        
        // Create beautiful buttons
        this.createMenuButtons(width, height);
        
        // Add decorative elements
        this.createDecorations(width, height);
    }

    createCandyBackground(width, height) {
        // Main gradient background
        const gradient = this.add.graphics();
        gradient.fillGradientStyle(0xFF6B8A, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 1);
        gradient.fillRect(0, 0, width, height);

        // Overlay with subtle pattern
        const overlay = this.add.graphics();
        overlay.fillGradientStyle(0xFFEAA7, 0xFF6B8A, 0x96CEB4, 0x4ECDC4, 0.3);
        overlay.fillRect(0, 0, width, height);

        // Animated bubbles in background
        for (let i = 0; i < 8; i++) {
            const bubble = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(30, 80),
                0xFFFFFF,
                0.1
            );
            
            this.tweens.add({
                targets: bubble,
                y: bubble.y - 100,
                duration: Phaser.Math.Between(3000, 6000),
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createFloatingParticles() {
        // Create magical floating particles
        for (let i = 0; i < 15; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, this.cameras.main.width),
                Phaser.Math.Between(0, this.cameras.main.height),
                Phaser.Math.Between(3, 8),
                Phaser.Math.RND.pick([0xFF6B8A, 0x4ECDC4, 0x96CEB4, 0xFFEAA7]),
                0.6
            );

            this.tweens.add({
                targets: particle,
                x: particle.x + Phaser.Math.Between(-50, 50),
                y: particle.y - 200,
                alpha: 0,
                duration: Phaser.Math.Between(2000, 4000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }

    createGameLogo(width, height) {
        // Main title with modern styling
        const titleBg = this.add.graphics();
        titleBg.fillStyle(0xFFFFFF, 0.9);
        titleBg.fillRoundedRect(width/2 - 160, height/2 - 200, 320, 100, 25);
        titleBg.lineStyle(4, 0xFF6B8A, 1);
        titleBg.strokeRoundedRect(width/2 - 160, height/2 - 200, 320, 100, 25);

        const title = this.add.text(width / 2, height / 2 - 150, 'CREEPYDOM', {
            fontSize: Math.min(width * 0.12, 48) + 'px',
            fill: '#FF6B8A',
            fontWeight: '800',
            fontFamily: 'Fredoka One, cursive',
            stroke: '#FFFFFF',
            strokeThickness: 2
        }).setOrigin(0.5);

        const subtitle = this.add.text(width / 2, height / 2 - 110, 'Evolution Adventure', {
            fontSize: Math.min(width * 0.05, 20) + 'px',
            fill: '#4ECDC4',
            fontWeight: '600',
            fontFamily: 'Nunito, sans-serif'
        }).setOrigin(0.5);

        // Pulsing animation for title
        this.tweens.add({
            targets: [title, titleBg],
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createMenuButtons(width, height) {
        const buttonY = height / 2 + 50;
        const buttonSpacing = 80;
        
        // Play button - main CTA
        const playButton = this.createCandyButton(
            width / 2, buttonY, 
            'PLAY', 
            0x4ECDC4, 0x3BB5A8,
            () => this.scene.start('LevelSelectScene'),
            'play-button'
        );

        // How to Play button
        const howToPlayButton = this.createCandyButton(
            width / 2, buttonY + buttonSpacing,
            'HOW TO PLAY',
            0x96CEB4, 0x7FB398,
            () => this.showHowToPlay(),
            'how-to-play-button'
        );
        
        // Make play button more prominent
        this.tweens.add({
            targets: playButton.container,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createCandyButton(x, y, text, color, shadowColor, callback, testId = null) {
        const container = this.add.container(x, y);
        
        // Button shadow
        const shadow = this.add.graphics();
        shadow.fillStyle(shadowColor, 0.8);
        shadow.fillRoundedRect(-80, 5, 160, 50, 25);
        container.add(shadow);
        
        // Main button
        const button = this.add.graphics();
        button.fillStyle(color, 1);
        button.fillRoundedRect(-80, 0, 160, 50, 25);
        button.lineStyle(3, 0xFFFFFF, 0.8);
        button.strokeRoundedRect(-80, 0, 160, 50, 25);
        container.add(button);
        
        // Button text
        const buttonText = this.add.text(0, 25, text, {
            fontSize: Math.min(this.cameras.main.width * 0.045, 18) + 'px',
            fill: '#FFFFFF',
            fontWeight: '700',
            fontFamily: 'Nunito, sans-serif'
        }).setOrigin(0.5);
        container.add(buttonText);
        
        // Interactive area
        const hitArea = this.add.rectangle(0, 0, 160, 50, 0x000000, 0);
        hitArea.setInteractive();
        container.add(hitArea);
        
        // Create DOM element for Playwright testing if testId is provided
        if (testId) {
            this.createTestElement(x, y, 160, 50, testId, callback);
        }
        
        // Button interactions
        hitArea.on('pointerdown', () => {
            this.tweens.add({
                targets: container,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    if (callback) callback();
                }
            });
        });

        hitArea.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200
            });
        });

        hitArea.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 200
            });
        });

        return { container, button, buttonText };
    }

    createDecorations(width, height) {
        // Decorative elements around the screen
        const decorations = [
            { x: 50, y: 100, size: 20, color: 0xFF6B8A },
            { x: width - 50, y: 150, size: 25, color: 0x4ECDC4 },
            { x: 30, y: height - 100, size: 15, color: 0x96CEB4 },
            { x: width - 30, y: height - 150, size: 22, color: 0xFFEAA7 }
        ];

        decorations.forEach(deco => {
            const shape = this.add.circle(deco.x, deco.y, deco.size, deco.color, 0.7);
            this.tweens.add({
                targets: shape,
                rotation: Math.PI * 2,
                duration: 4000,
                repeat: -1,
                ease: 'Linear'
            });
        });
    }

    showHowToPlay() {
        // Create overlay background
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );
        overlay.setInteractive();

        // Create instruction panel
        const panelWidth = Math.min(this.cameras.main.width * 0.9, 350);
        const panelHeight = Math.min(this.cameras.main.height * 0.8, 500);
        
        const panel = this.add.graphics();
        panel.fillStyle(0xFFFFFF, 0.95);
        panel.fillRoundedRect(
            this.cameras.main.width / 2 - panelWidth / 2,
            this.cameras.main.height / 2 - panelHeight / 2,
            panelWidth,
            panelHeight,
            20
        );
        panel.lineStyle(4, 0xFF6B8A, 1);
        panel.strokeRoundedRect(
            this.cameras.main.width / 2 - panelWidth / 2,
            this.cameras.main.height / 2 - panelHeight / 2,
            panelWidth,
            panelHeight,
            20
        );

        // Instructions text
        const instructions = [
            'HOW TO PLAY',
            '',
            '🐛 Start as a small insect',
            '🍃 Eat smaller insects to grow',
            '⚡ Avoid larger predators',
            '🦋 Evolve and become stronger',
            '🏆 Complete all levels!'
        ];

        instructions.forEach((line, index) => {
            const fontSize = index === 0 ? 24 : 16;
            const color = index === 0 ? '#FF6B8A' : '#333333';
            const fontWeight = index === 0 ? '800' : '600';
            
            this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 - panelHeight / 2 + 40 + (index * 30),
                line,
                {
                    fontSize: fontSize + 'px',
                    fill: color,
                    fontWeight: fontWeight,
                    fontFamily: 'Nunito, sans-serif',
                    align: 'center'
                }
            ).setOrigin(0.5);
        });

        // Create "Got it!" button
        const closeCallback = () => {
            panel.destroy();
            overlay.destroy();
            // Clean up instruction texts
            this.children.list
                .filter(child => child.type === 'Text' && instructions.includes(child.text))
                .forEach(text => text.destroy());
        };

        const gotItButton = this.createCandyButton(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + panelHeight / 2 - 40,
            'Got it!',
            0x4ECDC4, 0x3BB5A8,
            closeCallback,
            'got-it-button'
        );

        // Also close on overlay tap (but not on panel)
        overlay.on('pointerdown', closeCallback);
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
}
