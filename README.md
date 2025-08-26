# CreepyDom - Evolution Game

CreepyDom is an exciting evolution-based puzzle game built with Phaser.js where players control insects that grow by eating smaller insects and evolve through 20 challenging levels, ultimately becoming a T-Rex!

## 🎮 Game Features

- **20 Progressive Levels**: Start as a tiny mite and evolve all the way to a mighty T-Rex
- **Strategic Gameplay**: Eat smaller insects to grow, avoid larger ones that will eat you
- **Special Power-ups**: 
  - 🟢 Green insects: Double points (×2)
  - 🔵 Blue insects: Triple points (×3)
  - 🔴 Red insects: Half points (÷2)
  - 🟣 Purple insects: Lose 50 points
- **Progressive Difficulty**: Each level introduces more challenges and special insects
- **Save System**: Progress is automatically saved locally
- **Sound Effects**: Audio feedback for eating, evolving, dying, and level completion
- **Smooth Animations**: Engaging visual effects for all game actions

## 🕹️ How to Play

1. **Click to Move**: Click on adjacent insects to move your creature
2. **Eat Smaller Insects**: You can only eat insects smaller than or equal to your size
3. **Avoid Larger Insects**: Larger insects will eat you if you try to attack them
4. **Evolve**: Accumulate enough points to evolve into the next insect type
5. **Complete Levels**: Reach the target evolution for each level
6. **Strategic Planning**: Plan your moves carefully to avoid getting trapped

## 🐛 Insect Evolution Chain

1. Mite → 2. Aphid → 3. Ant → 4. Flea → 5. Termite → 6. Fly → 7. Mosquito → 8. Bee → 9. Wasp → 10. Dragonfly → 11. Butterfly → 12. Grasshopper → 13. Cricket → 14. Beetle → 15. Scorpion → 16. Spider → 17. Praying Mantis → 18. Centipede → 19. Tarantula → 20. **T-Rex**

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (optional, for development server)

### Installation & Running

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd creepydom
   ```

2. **Option A: Simple HTTP Server (Recommended)**
   ```bash
   npm install
   npm start
   ```
   Then open `http://localhost:3000` in your browser

3. **Option B: Direct File Opening**
   - Simply open `index.html` in your web browser
   - Note: Some browsers may have CORS restrictions with local files

4. **Option C: Use any HTTP server**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js live-server
   npx live-server
   ```

## 🛠️ Project Structure

```
creepydom/
├── index.html              # Main HTML file
├── package.json           # Project configuration
├── README.md             # This file
├── assets/               # Game assets
│   ├── images/          # Image files (placeholder)
│   └── sounds/          # Sound files (placeholder)
└── src/                 # Source code
    ├── Game.js          # Main game configuration
    ├── entities/        # Game entities
    │   ├── Insect.js    # Base insect class
    │   └── Player.js    # Player-controlled insect
    ├── scenes/          # Game scenes
    │   ├── BootScene.js        # Loading screen
    │   ├── MenuScene.js        # Main menu
    │   ├── LevelSelectScene.js # Level selection
    │   ├── GameScene.js        # Main gameplay
    │   ├── GameOverScene.js    # Game over screen
    │   └── LevelCompleteScene.js # Level completion
    └── utils/           # Utility classes
        ├── GameData.js  # Game data and configuration
        └── SoundManager.js # Sound management
```

## 🎯 Game Mechanics

### Core Mechanics
- **Grid-based Movement**: Move one cell at a time to adjacent insects
- **Size-based Combat**: Only eat insects of equal or smaller size
- **Point Accumulation**: Gain points to trigger evolution
- **Progressive Evolution**: Each evolution unlocks new capabilities

### Special Insects
- Appear randomly based on level difficulty
- Provide various effects when consumed
- Add strategic depth to gameplay
- Increase in frequency as levels progress

### Level Progression
- Each level has specific start and target insects
- Grid size increases with difficulty
- Special insect spawn rates increase
- Strategic planning becomes more important

## 🔧 Technical Details

- **Engine**: Phaser.js 3.70.0
- **Rendering**: HTML5 Canvas
- **Audio**: Web Audio API (procedural sounds)
- **Storage**: LocalStorage for progress saving
- **Browser Support**: Modern browsers with ES6 support

## 🎨 Customization

The game is designed to be easily customizable:

1. **Add Real Assets**: Replace placeholder graphics and sounds in the `assets/` folder
2. **Modify Insects**: Edit `GameData.js` to add new insect types or change properties
3. **Adjust Difficulty**: Modify level configurations in `GameData.js`
4. **Visual Styling**: Update colors and styling in individual scene files
5. **Sound Effects**: Replace Web Audio sounds with actual audio files

## 🐛 Known Issues

- Audio may not work on some mobile browsers due to autoplay restrictions
- Graphics are currently procedurally generated (placeholders for real assets)
- Some browsers may require user interaction before playing sounds

## 🚀 Future Enhancements

- Real artwork and sound effects
- Mobile touch controls optimization
- Additional special insect types
- Bonus levels and achievements
- Multiplayer mode
- Level editor

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 🎮 Play Now!

Open `index.html` in your browser and start your evolution journey from a tiny mite to a mighty T-Rex!

---

**Have fun evolving! 🦎**
