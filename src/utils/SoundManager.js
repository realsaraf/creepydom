class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.enabled = true;
    }

    preload() {
        // Create placeholder sounds using Web Audio API
        this.createPlaceholderSounds();
    }

    createPlaceholderSounds() {
        // These are placeholder sound definitions
        // In a real game, you would load actual audio files
        this.soundDefinitions = {
            eat: { frequency: 440, duration: 0.1, type: 'sawtooth' },
            grow: { frequency: 660, duration: 0.3, type: 'sine' },
            die: { frequency: 220, duration: 0.5, type: 'square' },
            special: { frequency: 880, duration: 0.2, type: 'triangle' },
            click: { frequency: 800, duration: 0.05, type: 'sine' },
            levelComplete: { frequency: 523, duration: 0.8, type: 'sine' },
            gameOver: { frequency: 165, duration: 1.0, type: 'sawtooth' }
        };
    }

    playSound(soundName) {
        if (!this.enabled) return;

        const definition = this.soundDefinitions[soundName];
        if (!definition) return;

        this.createWebAudioSound(definition);
    }

    createWebAudioSound(definition) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(definition.frequency, audioContext.currentTime);
            oscillator.type = definition.type;

            gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + definition.duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + definition.duration);
        } catch (error) {
            console.warn('Web Audio not supported:', error);
        }
    }

    playEatSound() {
        this.playSound('eat');
    }

    playGrowSound() {
        this.playSound('grow');
    }

    playDieSound() {
        this.playSound('die');
    }

    playSpecialSound() {
        this.playSound('special');
    }

    playClickSound() {
        this.playSound('click');
    }

    playLevelCompleteSound() {
        this.playSound('levelComplete');
    }

    playGameOverSound() {
        this.playSound('gameOver');
    }

    toggleSound() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
}
