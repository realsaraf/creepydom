class Player extends Insect {
    constructor(scene, x, y, type) {
        super(scene, x, y, type, false, null);
        
        this.currentPoints = this.insectType.points;
        this.moveHistory = [];
        this.canMove = true;
        
        this.createPlayerIndicator();
        this.setupMovement();
    }

    createPlayerIndicator() {
        // Add a distinctive border to show this is the player
        this.playerBorder = this.scene.add.circle(0, 0, this.body.radius + 8, 0x00ff00, 0);
        this.playerBorder.setStrokeStyle(4, 0x00ff00, 0.8);
        this.addAt(this.playerBorder, 0);

        // Pulsing animation for player indicator
        this.scene.tweens.add({
            targets: this.playerBorder,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Crown or special symbol for player
        this.playerSymbol = this.scene.add.text(0, -this.body.radius - 25, '♦', {
            fontSize: '16px',
            fill: '#00ff00',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        this.add(this.playerSymbol);
        
        // Add keyboard hint
        this.keyboardHint = this.scene.add.text(0, this.body.radius + 30, '↑↓←→', {
            fontSize: '12px',
            fill: '#00ff00',
            alpha: 0.7
        }).setOrigin(0.5);
        this.add(this.keyboardHint);
    }

    setupMovement() {
        // Override the click handler for movement instead of eating
        this.body.off('pointerdown');
        this.body.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation();
            // Player doesn't respond to clicks on itself
        });
    }

    canEatInsect(insect) {
        return GameData.canEat(this.getInsectTypeId(), insect.getInsectTypeId());
    }

    eatInsect(insect) {
        if (!this.canEatInsect(insect)) {
            return false;
        }

        let points = insect.getPoints();
        
        // Apply special effects
        if (insect.isSpecial) {
            // Special insects modify the points gained
            const modifiedPoints = insect.applySpecialEffect(points);
            this.currentPoints += modifiedPoints;
            this.scene.soundManager.playSpecialSound();
        } else {
            // Normal insects: add their points to current total
            this.currentPoints += points;
            this.scene.soundManager.playEatSound();
        }

        this.updateAfterEating();
        
        return true;
    }

    updateAfterEating() {
        // Check if player should evolve
        const nextTypeId = this.findEvolutionTarget();
        
        if (nextTypeId > this.getInsectTypeId()) {
            this.evolve(nextTypeId);
        }

        // Update points display
        this.pointsText.setText(this.currentPoints.toString());
    }

    findEvolutionTarget() {
        // Find the highest insect type the player can become based on points
        for (let i = GameData.INSECT_TYPES.length - 1; i >= 0; i--) {
            if (this.currentPoints >= GameData.INSECT_TYPES[i].points) {
                return i;
            }
        }
        return 0;
    }

    evolve(newTypeId) {
        if (newTypeId <= this.getInsectTypeId()) return;

        this.scene.soundManager.playGrowSound();
        
        // Store old type for comparison
        const oldType = this.insectType;
        
        // Update to new type
        this.insectType = GameData.getInsectType(newTypeId);
        
        // Recreate graphics with new type
        this.removeAll(true);
        this.createInsectGraphics();
        this.createPlayerIndicator();
        
        // Play evolution animation
        this.playEvolutionAnimation();
        
        // Check if level is complete
        this.scene.checkLevelComplete();
    }

    playEvolutionAnimation() {
        // Scale up animation
        this.setScale(0.5);
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Power2'
                });
            }
        });

        // Particle effect
        this.createEvolutionParticles();
    }

    createEvolutionParticles() {
        // Simple particle effect using multiple circles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = this.body.radius + 20;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            const particle = this.scene.add.circle(this.x + x, this.y + y, 3, 0xffff00);
            this.scene.tweens.add({
                targets: particle,
                x: this.x + x * 2,
                y: this.y + y * 2,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    moveTo(gridX, gridY, worldX, worldY) {
        if (!this.canMove) return;

        this.canMove = false;
        this.moveHistory.push({ x: this.gridX, y: this.gridY });
        
        // Update grid position
        this.setGridPosition(gridX, gridY);
        
        // Animate movement
        this.scene.tweens.add({
            targets: this,
            x: worldX,
            y: worldY,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.canMove = true;
                this.scene.checkPlayerPosition();
            }
        });
    }

    canUndoMove() {
        return this.moveHistory.length > 0;
    }

    undoMove() {
        if (!this.canUndoMove()) return false;

        const lastPos = this.moveHistory.pop();
        const worldPos = this.scene.gridToWorld(lastPos.x, lastPos.y);
        
        this.setGridPosition(lastPos.x, lastPos.y);
        this.setPosition(worldPos.x, worldPos.y);
        
        return true;
    }

    reset(startType, gridX, gridY, worldX, worldY) {
        this.insectType = GameData.getInsectType(startType);
        this.currentPoints = this.insectType.points;
        this.moveHistory = [];
        this.canMove = true;
        
        this.setGridPosition(gridX, gridY);
        this.setPosition(worldX, worldY);
        
        // Recreate graphics
        this.removeAll(true);
        this.createInsectGraphics();
        this.createPlayerIndicator();
    }

    getCurrentTypeId() {
        return this.getInsectTypeId();
    }

    getScore() {
        return this.currentPoints;
    }
}
