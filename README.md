# Arcanara Game

A 2D pixel art adventure game built with JavaScript, featuring dynamic combat, multiple areas, and interactive storytelling.

## Features

### Game Mechanics
- Fluid character movement with arrow key controls
- Combat system with attack animations
- Area-specific collisions and interactions
- Dynamic object depth handling (z-index layering)
- State management for different game areas

### Areas
- **Forest**
  - Traditional collision-based environment
  - Combat encounters with enemies (Orc)
  - Interactive objects and treasures
  - Custom background music

- **Village**
  - Image mask-based collision system
  - Unique architectural elements
  - Custom background music
  - Open world exploration

### Combat System
- Attack animations with F key
- Enemy AI with directional awareness
- Health system for both player and enemies
- Victory/defeat conditions
- Visual feedback for hits
- Invulnerability frames

### Technical Features
- Custom collision detection systems:
  - Object-based for forest area
  - Pixel-perfect for village area using transparency masks
- Dynamic audio management
- Sprite-based animations
- Canvas-based collision detection
- Responsive game state management

## Project Structure

```
project/
│
├── images
│   
├── BackgroundSound
│
├── js/
│   ├── script.js      # Main game logic
│   ├── enemies.js     # Enemy behavior and combat
│   ├── objects.js     # Game objects and collision zones
│   ├── combat.js      # Combat system management
│   └── story.js       # Story progression and dialogue
│
├── styles.css         # Game styling
├── index.html         # Main game page
└── README.md
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ZenKhalil/Arcanara.git
```

2. No build process is required as the game uses vanilla JavaScript.

3. Due to asset loading requirements, the game needs to be served from a web server. You can use any local development server, for example:
   - Live Server (VS Code extension)
   - Python's SimpleHTTPServer
   - Node's http-server

## How to Play

1. Use arrow keys for movement:
   - ↑ (Up Arrow): Move up
   - ↓ (Down Arrow): Move down
   - ← (Left Arrow): Move left
   - → (Right Arrow): Move right

2. Combat Controls:
   - F: Attack
   - Position yourself strategically for combat
   - Defeat enemies to progress

3. Navigation:
   - Use the menu to start a new game
   - Select different areas to explore
   - Interact with the environment

## Technical Implementation Details

### Collision Systems
- Forest Area: Uses predefined collision zones with object-based detection
- Village Area: Uses image transparency for walkable area detection
- Dynamic collision handling for moving objects and enemies

### Animation System
- Sprite-based character animations
- Frame-by-frame animation control
- Direction-aware sprite selection
- Smooth transition between animation states

### Audio Management
- Area-specific background music
- Seamless audio transitions
- Volume control
- Audio state management

## Development

The game is built with vanilla JavaScript and uses several custom systems:

- Custom game loop using requestAnimationFrame
- State management for game progression
- Event-based interaction system
- Dynamic asset loading
- Canvas-based collision detection

## Credits

- Pixel Art Assets: [Credit source]
- Sound Effects: [Credit source]
- Background Music: [Credit source]

## Future Improvements

- [ ] Additional areas to explore
- [ ] More enemy types
- [ ] Inventory system
- [ ] Save/load functionality
- [ ] Additional combat mechanics
- [ ] Quest system