class Insect extends Phaser.GameObjects.Container {
    constructor(scene, x, y, type, isSpecial = false, specialType = null) {
        super(scene, x, y);
        
        this.scene = scene;
        this.insectType = GameData.getInsectType(type);
        this.isSpecial = isSpecial;
        this.specialType = specialType;
        this.gridX = 0;
        this.gridY = 0;
        
        this.createInsectGraphics();
        this.setupInteraction();
        
        scene.add.existing(this);
    }

    createInsectGraphics() {
        // Improved size calculation - cap max size and use logarithmic scaling
        const baseSize = 12; // Minimum size
        const maxSize = 35; // Maximum size to prevent overcrowding
        const sizeRange = maxSize - baseSize;
        
        // Use logarithmic scaling to compress size differences
        const normalizedSize = Math.log(this.insectType.size + 1) / Math.log(21); // 21 = max size + 1
        const size = baseSize + (normalizedSize * sizeRange);
        
        const color = this.isSpecial ? this.specialType.color : this.insectType.color;
        
        this.body = this.scene.add.circle(0, 0, size, color);
        this.body.setStrokeStyle(2, 0xffffff, 0.8);
        this.add(this.body);

        // Add insect details
        this.createInsectDetails(size);
        
        // Special effect indicator
        if (this.isSpecial) {
            this.createSpecialIndicator();
        }

        // Points text - inside the circle for better visibility
        const fontSize = Math.max(8, Math.min(14, size * 0.35));
        this.pointsText = this.scene.add.text(0, 0, this.insectType.points.toString(), {
            fontSize: fontSize + 'px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            fontWeight: 'bold'
        }).setOrigin(0.5);
        this.add(this.pointsText);

        // Name text - smaller and positioned above
        const nameFontSize = Math.max(7, Math.min(10, size * 0.25));
        this.nameText = this.scene.add.text(0, -size - 6, this.insectType.name, {
            fontSize: nameFontSize + 'px',
            fill: '#cccccc',
            alpha: 0.8
        }).setOrigin(0.5);
        this.add(this.nameText);
    }

    createInsectDetails(size) {
        // Add simple visual details to make insects look more distinct
        const detailColor = 0x000000;
        
        // Eyes
        const eyeSize = size * 0.15;
        const eyeOffset = size * 0.3;
        
        this.leftEye = this.scene.add.circle(-eyeOffset, -eyeOffset, eyeSize, detailColor);
        this.rightEye = this.scene.add.circle(eyeOffset, -eyeOffset, eyeSize, detailColor);
        
        this.add([this.leftEye, this.rightEye]);

        // Add type-specific details
        if (this.insectType.id >= 5) {
            // Wings for flying insects
            this.createWings(size);
        }
        
        if (this.insectType.id >= 10) {
            // Antennae for larger insects
            this.createAntennae(size);
        }
    }

    createWings(size) {
        const wingSize = size * 0.8;
        const wingColor = 0xffffff;
        const wingAlpha = 0.3;
        
        this.leftWing = this.scene.add.ellipse(-size * 0.7, 0, wingSize, wingSize * 0.6, wingColor);
        this.leftWing.setAlpha(wingAlpha);
        
        this.rightWing = this.scene.add.ellipse(size * 0.7, 0, wingSize, wingSize * 0.6, wingColor);
        this.rightWing.setAlpha(wingAlpha);
        
        this.add([this.leftWing, this.rightWing]);
    }

    createAntennae(size) {
        const antennaLength = size * 0.8;
        const antennaColor = 0x444444;
        
        this.leftAntenna = this.scene.add.line(0, 0, -antennaLength * 0.5, -antennaLength, -antennaLength, -antennaLength * 1.5, antennaColor);
        this.leftAntenna.setLineWidth(2);
        
        this.rightAntenna = this.scene.add.line(0, 0, antennaLength * 0.5, -antennaLength, antennaLength, -antennaLength * 1.5, antennaColor);
        this.rightAntenna.setLineWidth(2);
        
        this.add([this.leftAntenna, this.rightAntenna]);
    }

    createSpecialIndicator() {
        // Glowing effect for special insects
        this.specialGlow = this.scene.add.circle(0, 0, this.body.radius + 5, this.specialType.color, 0.3);
        this.addAt(this.specialGlow, 0);

        // Special effect text - position below the points
        this.specialText = this.scene.add.text(0, 12, this.specialType.effect, {
            fontSize: '10px',
            fill: '#ffffff',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.add(this.specialText);

        // Pulsing animation
        this.scene.tweens.add({
            targets: this.specialGlow,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    setupInteraction() {
        this.body.setInteractive();
        this.body.on('pointerdown', () => {
            this.scene.onCellClicked(this.gridX, this.gridY);
        });

        // Hover effects
        this.body.on('pointerover', () => {
            this.body.setStrokeStyle(3, 0xffff00, 1);
            this.scene.input.setDefaultCursor('pointer');
        });

        this.body.on('pointerout', () => {
            this.body.setStrokeStyle(2, 0xffffff, 0.8);
            this.scene.input.setDefaultCursor('default');
        });
    }

    setGridPosition(gridX, gridY) {
        this.gridX = gridX;
        this.gridY = gridY;
    }

    getInsectTypeId() {
        return this.insectType.id;
    }

    getPoints() {
        return this.insectType.points;
    }

    applySpecialEffect(basePoints) {
        if (!this.isSpecial) return basePoints;

        switch (this.specialType.type) {
            case 'multiply2':
                return basePoints * 2;
            case 'multiply3':
                return basePoints * 3;
            case 'divide2':
                return Math.floor(basePoints / 2);
            case 'poison':
                // Poison gives negative points (loses 50 points)
                return -50;
            default:
                return basePoints;
        }
    }

    playEatenAnimation(callback) {
        this.scene.tweens.add({
            targets: this,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: callback
        });
    }

    destroy() {
        super.destroy();
    }
}
