# Tenure Rush

A retro 8-bit vertical scrolling arcade game where a professor must navigate through an endless series of closed doors on a university campus to achieve tenure.

## Quick Start

1. Save `package.json` in your project root directory (`tenure-rush/`)

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   This will open the game in your default browser.

## Alternative: Run without npm

If you prefer not to use npm, you can run a simple HTTP server:

```bash
# Using Python 3
python -m http.server 8000

# Or using Python 2
python -m SimpleHTTPServer 8000
```

Then open `http://localhost:8000` in your browser.

## Project Structure

```
tenure-rush/
├── index.html          # Main HTML file
├── package.json        # NPM configuration
├── README.md          # This file
├── src/               # Source code
│   ├── main.js        # Entry point
│   ├── core/          # Core game systems
│   ├── entities/      # Game entities (Player, Door, etc.)
│   ├── scenes/        # Game scenes
│   ├── systems/       # Game systems (Physics, Input, etc.)
│   ├── ui/            # UI components
│   └── utils/         # Utilities and constants
└── styles/            # CSS styles
    └── main.css
```

## Game Controls

- **Arrow Keys (←→)**: Move left/right
- **Arrow Keys (↑↓)**: Input door sequences
- **Up Arrow (↑)**: Hold for 2.5x speed boost (disabled during door sequences)
- **Spacebar**: Input door sequences (␣)
- **P**: Pause/unpause
- **R**: Restart (when game over)

## Game Mechanics

### Core Systems
- **Door Sequences**: Unlock doors with arrow key and spacebar combinations
- **Tenure Progress**: Reach 100% tenure to win (1% per door, 2% with glasses power-up)
- **Health System**: 5 HP, lose 1 per collision, ~1.3 second immunity after damage
- **Power-ups**: Coffee (2x lateral speed), Glasses (2x tenure), Cheese (2x friend spawns), Chopsticks/Sushi
- **Door Passes**: Auto-open doors on collision (obtained from male friend contacts)
- **Hearts System**: Collect hearts by contacting male friends for romantic ending

### Spawning Logic
- **Doors**: Every 40-150 frames
- **Power-ups**: Every 100-200 frames  
- **Male Friends**: Every 200-300 frames
- **Grumpy Academics**: Level-based intervals (600-800 frames at level 1, down to 120-250 frames at level 10)

## Development

This is Phase 1 of the Tenure Rush game, implementing core mechanics:
- Player movement with coffee power-up lateral speed boost
- Door sequence mechanics with level-based complexity
- Power-up system including Coffee, Glasses, Cheese, Chopsticks, and Sushi
- Tenure progression system (1% per door, 2% with glasses)
- Frame-based spawning system with randomized intervals
- Basic collision detection with immunity frames
- Male friend interaction system with hearts collection and door passes

The modular architecture is designed to support future phases including enhanced graphics, sound, and additional gameplay features.