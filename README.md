# 🎲 Snakes and Ladders Slot Game Overlay

Gamification overlay for Big Stack Nutcracker slot game that adds a Snakes and Ladders board game around the slot.

## 🎮 Game Rules

1. **Start:** Pawn begins at position 1
2. **Trigger:** When 2 scatter symbols land in a spin, roll a dice (1-6)
3. **Movement:** Pawn moves forward by the dice roll amount
4. **Snakes & Ladders:**
   - **Ladder at 8** → Climb up to 16
   - **Snake at 18** → Slide down to 7
   - **Ladder at 25** → Climb up to 32
   - **Snake at 29** → Slide down to 22
   - **Snake at 38** → Slide down to 34
5. **Win:** Reach the FINISH position

## 🚀 Quick Start

```bash
npm install
npm start
```

This will:
- Launch a browser with the slot game in an iPhone 13 Pro emulator
- Display the Snakes and Ladders board around the game
- Automatically detect scatter symbols and roll the dice
- Track pawn movement around the board

## 📁 Project Structure

```
SnakesAndLadders/
├── package.json              # Project dependencies
├── game.js                   # Main Playwright script
├── overlay.html              # Game overlay UI
├── snakesnladders.jpg        # Board design
└── README.md                 # This file
```

## 🎯 How It Works

- Uses Playwright to intercept game API responses
- Detects scatter symbols in real-time
- Automatically rolls dice and moves pawn
- Handles snake/ladder transitions
- Shows win screen when reaching FINISH

## 🔧 Configuration

Edit `game.js` to customize:
- Scatter symbol detection
- Dice roll animation speed
- Pawn movement speed
- Sound effects (optional)
