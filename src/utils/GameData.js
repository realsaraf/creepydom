class GameData {
    static INSECT_TYPES = [
        { id: 0, name: 'Mite', size: 1, color: 0xDEB887, points: 1 },         // Burlywood
        { id: 1, name: 'Aphid', size: 2, color: 0x9ACD32, points: 2 },        // Yellow Green  
        { id: 2, name: 'Ant', size: 3, color: 0x8B4513, points: 4 },          // Saddle Brown
        { id: 3, name: 'Flea', size: 4, color: 0x6B8E23, points: 8 },         // Olive Drab
        { id: 4, name: 'Termite', size: 5, color: 0xD2B48C, points: 16 },     // Tan
        { id: 5, name: 'Fly', size: 6, color: 0x2F4F4F, points: 32 },         // Dark Slate Gray
        { id: 6, name: 'Mosquito', size: 7, color: 0x696969, points: 64 },    // Dim Gray
        { id: 7, name: 'Bee', size: 8, color: 0xFFD700, points: 128 },        // Gold
        { id: 8, name: 'Wasp', size: 9, color: 0xFF8C00, points: 256 },       // Dark Orange
        { id: 9, name: 'Dragonfly', size: 10, color: 0x4682B4, points: 512 }, // Steel Blue
        { id: 10, name: 'Butterfly', size: 11, color: 0xFF69B4, points: 1024 }, // Hot Pink
        { id: 11, name: 'Grasshopper', size: 12, color: 0x32CD32, points: 2048 }, // Lime Green
        { id: 12, name: 'Cricket', size: 13, color: 0x228B22, points: 4096 },    // Forest Green
        { id: 13, name: 'Beetle', size: 14, color: 0x8B4513, points: 8192 },     // Saddle Brown
        { id: 14, name: 'Scorpion', size: 15, color: 0xB8860B, points: 16384 },  // Dark Goldenrod
        { id: 15, name: 'Spider', size: 16, color: 0x800000, points: 32768 },    // Maroon
        { id: 16, name: 'Praying Mantis', size: 17, color: 0x6B8E23, points: 65536 }, // Olive Drab
        { id: 17, name: 'Centipede', size: 18, color: 0xA0522D, points: 131072 },     // Sienna
        { id: 18, name: 'Tarantula', size: 19, color: 0x8B0000, points: 262144 },     // Dark Red
        { id: 19, name: 'T-Rex', size: 20, color: 0x228B22, points: 524288 }          // Forest Green
    ];

    static SPECIAL_TYPES = [
        { type: 'multiply2', color: 0x32CD32, effect: 'x2' },    // Lime Green
        { type: 'multiply3', color: 0x4682B4, effect: 'x3' },    // Steel Blue
        { type: 'divide2', color: 0xFF8C00, effect: '÷2' },      // Dark Orange
        { type: 'poison', color: 0x8B0000, effect: '-50' }       // Dark Red
    ];

    static LEVELS = [
        { level: 1, startType: 0, targetType: 3, gridSize: 6, specialChance: 0.05 },
        { level: 2, startType: 1, targetType: 4, gridSize: 7, specialChance: 0.08 },
        { level: 3, startType: 2, targetType: 5, gridSize: 7, specialChance: 0.10 },
        { level: 4, startType: 2, targetType: 6, gridSize: 8, specialChance: 0.12 },
        { level: 5, startType: 3, targetType: 7, gridSize: 8, specialChance: 0.15 },
        { level: 6, startType: 4, targetType: 8, gridSize: 8, specialChance: 0.15 },
        { level: 7, startType: 5, targetType: 9, gridSize: 9, specialChance: 0.18 },
        { level: 8, startType: 6, targetType: 10, gridSize: 9, specialChance: 0.20 },
        { level: 9, startType: 7, targetType: 11, gridSize: 9, specialChance: 0.20 },
        { level: 10, startType: 8, targetType: 12, gridSize: 10, specialChance: 0.22 },
        { level: 11, startType: 9, targetType: 13, gridSize: 10, specialChance: 0.25 },
        { level: 12, startType: 10, targetType: 14, gridSize: 10, specialChance: 0.25 },
        { level: 13, startType: 11, targetType: 15, gridSize: 11, specialChance: 0.28 },
        { level: 14, startType: 12, targetType: 16, gridSize: 11, specialChance: 0.30 },
        { level: 15, startType: 13, targetType: 17, gridSize: 11, specialChance: 0.30 },
        { level: 16, startType: 14, targetType: 18, gridSize: 12, specialChance: 0.32 },
        { level: 17, startType: 15, targetType: 18, gridSize: 12, specialChance: 0.35 },
        { level: 18, startType: 16, targetType: 19, gridSize: 12, specialChance: 0.35 },
        { level: 19, startType: 17, targetType: 19, gridSize: 13, specialChance: 0.38 },
        { level: 20, startType: 18, targetType: 19, gridSize: 13, specialChance: 0.40 }
    ];

    static getInsectType(id) {
        return this.INSECT_TYPES[id] || this.INSECT_TYPES[0];
    }

    static getNextInsectType(currentId) {
        return Math.min(currentId + 1, this.INSECT_TYPES.length - 1);
    }

    static canEat(predatorId, preyId) {
        return predatorId >= preyId;
    }

    static getLevelData(level) {
        return this.LEVELS[level - 1] || this.LEVELS[0];
    }

    static getRandomSpecialType() {
        return this.SPECIAL_TYPES[Math.floor(Math.random() * this.SPECIAL_TYPES.length)];
    }

    static saveProgress(level) {
        const progress = this.getProgress();
        progress.unlockedLevels = Math.max(progress.unlockedLevels, level + 1);
        localStorage.setItem('creepydom_progress', JSON.stringify(progress));
    }

    static getProgress() {
        const saved = localStorage.getItem('creepydom_progress');
        return saved ? JSON.parse(saved) : { unlockedLevels: 1 };
    }
}
