class MysteryBox extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        
        this.scene = scene;
        this.gridX = 0;
        this.gridY = 0;
        this.revealed = false;
        this.hiddenInsect = null;
        this.hiddenSpecialType = null;
        
        this.generateHiddenContent();
        this.createMysteryGraphics();
        this.setupInteraction();
        
        scene.add.existing(this);
    }

    generateHiddenContent() {
        // Generate what's inside the mystery box
        const rand = Math.random();
        
        if (rand < 0.3) {
            // 30% chance for high multiplier special insects
            this.hiddenInsect = GameData.getInsectType(Phaser.Math.Between(0, 3));
            this.hiddenSpecialType = {
                type: Math.random() < 0.5 ? 'multiply3' : 'multiply2',
                color: Math.random() < 0.5 ? 0x0000FF : 0x00FF00,
                effect: Math.random() < 0.5 ? 'x3' : 'x2'
            };
        } else if (rand < 0.5) {
            // 20% chance for penalty
            this.hiddenInsect = GameData.getInsectType(Phaser.Math.Between(0, 2));
            this.hiddenSpecialType = {
                type: Math.random() < 0.5 ? 'divide2' : 'poison',
                color: Math.random() < 0.5 ? 0xFF0000 : 0x800080,
                effect: Math.random() < 0.5 ? '÷2' : '-50'
            };
        } else if (rand < 0.8) {
            // 30% chance for regular small insect
            this.hiddenInsect = GameData.getInsectType(Phaser.Math.Between(0, 4));
            this.hiddenSpecialType = null;
        } else {
            // 20% chance for larger threatening insect
            this.hiddenInsect = GameData.getInsectType(Phaser.Math.Between(5, Math.min(10, GameData.INSECT_TYPES.length - 1)));
            this.hiddenSpecialType = null;
        }
    }

    createMysteryGraphics() {
        // Main mystery box
        const size = 25;
        this.box = this.scene.add.rectangle(0, 0, size * 2, size * 2, 0x444444);
        this.box.setStrokeStyle(3, 0x888888);
        this.add(this.box);

        // Question mark
        this.questionMark = this.scene.add.text(0, 0, '?', {
            fontSize: '24px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        this.add(this.questionMark);

        // Glowing animation
        this.scene.tweens.add({
            targets: this.box,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Sparkle effect
        this.createSparkles();
    }

    createSparkles() {
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const distance = 35;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            const sparkle = this.scene.add.circle(x, y, 2, 0xffff00, 0.8);
            this.add(sparkle);
            
            this.scene.tweens.add({
                targets: sparkle,
                alpha: 0,
                duration: 1500,
                delay: i * 200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    setupInteraction() {
        this.box.setInteractive();
        this.box.on('pointerdown', () => {
            this.scene.onCellClicked(this.gridX, this.gridY);
        });

        // Hover effects
        this.box.on('pointerover', () => {
            this.box.setStrokeStyle(4, 0xffff00);
            this.scene.input.setDefaultCursor('pointer');
        });

        this.box.on('pointerout', () => {
            this.box.setStrokeStyle(3, 0x888888);
            this.scene.input.setDefaultCursor('default');
        });
    }

    setGridPosition(gridX, gridY) {
        this.gridX = gridX;
        this.gridY = gridY;
    }

    reveal() {
        if (this.revealed) return this.hiddenInsect;
        
        this.revealed = true;
        
        // Play reveal animation
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });

        // Create the actual insect
        const worldPos = this.scene.gridToWorld(this.gridX, this.gridY);
        const isSpecial = this.hiddenSpecialType !== null;
        const insect = new Insect(this.scene, worldPos.x, worldPos.y, 
            this.hiddenInsect.id, isSpecial, this.hiddenSpecialType);
        insect.setGridPosition(this.gridX, this.gridY);

        // Replace in grid
        this.scene.grid[this.gridX][this.gridY] = insect;
        
        // Remove from insects array and add new insect
        const index = this.scene.insects.indexOf(this);
        if (index > -1) {
            this.scene.insects.splice(index, 1);
        }
        this.scene.insects.push(insect);

        // Remove mystery box
        this.destroy();
        
        return insect;
    }

    // Interface compatibility with Insect class
    getInsectTypeId() {
        return this.hiddenInsect.id;
    }

    getPoints() {
        return this.hiddenInsect.points;
    }

    isSpecial() {
        return this.hiddenSpecialType !== null;
    }

    applySpecialEffect(basePoints) {
        if (!this.hiddenSpecialType) return basePoints;

        switch (this.hiddenSpecialType.type) {
            case 'multiply2':
                return basePoints * 2;
            case 'multiply3':
                return basePoints * 3;
            case 'divide2':
                return Math.floor(basePoints / 2);
            case 'poison':
                return -50;
            default:
                return basePoints;
        }
    }

    playEatenAnimation(callback) {
        // Reveal first, then the insect handles the eating
        const insect = this.reveal();
        if (insect && callback) {
            insect.playEatenAnimation(callback);
        }
    }
}
