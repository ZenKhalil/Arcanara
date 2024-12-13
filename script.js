import { displayNode } from "./story.js";
import { HIDDEN_OBJECTS, areaCollisionZones } from "./objects.js";
import { checkCollisionWithOrc1, initiateCombatWithOrc1, animateOrc1, checkPlayerAttackHit } from "./enemies.js";
import { isGameOverState } from "./combat.js";


// Game state
let gameStarted = false;
export let gamePaused = false;

// Functions to pause and resume the game
export function pauseGame() {
  gamePaused = true;
}

export function resumeGame() {
  gamePaused = false;
}

export const gameState = {
  currentArea: "forest",
};

// Get DOM elements
const startMenu = document.getElementById("start-menu");
const startGameBtn = document.getElementById("start-game");
const howToPlayBtn = document.getElementById("how-to-play");
const gameContainer = document.getElementById("game-container");
const homeLink = document.querySelector('nav a[href="#"]');
const aboutLink = document.querySelectorAll('nav a[href="#"]')[1];

// Create about page container
const aboutContainer = document.createElement("div");
aboutContainer.id = "about-container";
aboutContainer.className = "overlay";
aboutContainer.style.display = "none"; // Set initial display to none
aboutContainer.innerHTML = `
  <div class="menu-content">
    <div class="pixel-corner pixel-corner-tl"></div>
    <div class="pixel-corner pixel-corner-tr"></div>
    <div class="pixel-corner pixel-corner-bl"></div>
    <div class="pixel-corner pixel-corner-br"></div>
    <h2>About Arcanara</h2>
    <p>Welcome to Arcanara, a magical realm where adventure awaits at every turn!</p>
    <p>Navigate through enchanted forests, battle fearsome orcs, and uncover ancient mysteries in this pixel art adventure.</p>
    <button id="back-to-menu" class="menu-button">BACK TO MENU</button>
  </div>
`;
document.querySelector("main").appendChild(aboutContainer);

// Initialize page state
gameContainer.style.display = "none";
startMenu.style.display = "flex";

// Navigation functions
function showStartMenu() {
  gameStarted = false;
  startMenu.style.display = "flex";
  gameContainer.style.display = "none";
  aboutContainer.style.display = "none";
}

function showAboutPage() {
  startMenu.style.display = "none";
  gameContainer.style.display = "none";
  aboutContainer.style.display = "flex";
}

// Event listeners for navigation
homeLink.addEventListener("click", (e) => {
  e.preventDefault();
  showStartMenu();
});

aboutLink.addEventListener("click", (e) => {
  e.preventDefault();
  showAboutPage();
});

document
  .getElementById("back-to-menu")
  .addEventListener("click", showStartMenu);

// Start game function
function startGame() {
  gameStarted = true;
  startMenu.style.display = "none";
  gameContainer.style.display = "block";
  // Initialize game
  requestAnimationFrame(gameLoop);
  // Start the story from the 'start' node
  displayNode("start");
}

// Event listeners for menu buttons
startGameBtn.addEventListener("click", startGame);
howToPlayBtn.addEventListener("click", () => {
  // Use your existing modal
  modal.classList.remove("hidden");
});


// Game area dimensions
const gameWidth = 1118;
const gameHeight = 615;

const collisionCanvas = document.createElement("canvas");
const collisionCtx = collisionCanvas.getContext("2d", {
  willReadFrequently: true,
}); // Add this option
const collisionImage = new Image();

collisionImage.onload = function () {
  collisionCanvas.width = gameWidth; // Match game dimensions
  collisionCanvas.height = gameHeight;
  collisionCtx.drawImage(collisionImage, 0, 0, gameWidth, gameHeight);
  console.log("Collision map loaded"); // Debug log
};
collisionImage.src = "/images/village-background1.png";


// Frame settings
const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 32;
const DISPLAY_FRAME_WIDTH = 64;
const DISPLAY_FRAME_HEIGHT = 64;
const ANIMATION_SPEED = 100;

const areaStartPositions = {
  forest: {
    x: 1,
    y: gameHeight * 0.6,
  },
  village: {
    x: 1,
    y: gameHeight * 0.9,
  },
};

// Character setup
const character = {
  ...areaStartPositions.forest, // Set initial position
  speed: 200,
  direction: "idle-right",
  isMoving: false,
  isAttacking: false,
  currentFrame: 0,
};


// Add this function
export function setCharacterPosition(area) {
  if (!areaStartPositions[area]) return;
  
  character.x = areaStartPositions[area].x;
  character.y = areaStartPositions[area].y;
  character.direction = 'idle-right'; // Set appropriate starting direction
  character.currentFrame = 0;
  updateCharacterPosition();
}

// Animation frames for each direction
const animations = {
  up: { row: 3, frames: 4 },
  down: { row: 4, frames: 4 },
  right: { row: 1, frames: 4 },
  left: { row: 2, frames: 4 },
  "idle-down": { row: 0, frame: 0, frames: 1 },
  "idle-right": { row: 0, frame: 1, frames: 1 },
  "idle-left": { row: 0, frame: 2, frames: 1 },
  "idle-up": { row: 0, frame: 3, frames: 1 },
  "attack-right": { row: 5, frames: 4 },
  "attack-left": { row: 6, frames: 4 },
  "attack-down": { row: 7, frames: 4 },
  "attack-up": { row: 8, frames: 4 },
};

// Grab character element and set initial z-index
const characterElement = document.getElementById("character");
characterElement.style.zIndex = 1;

// Update startAttackAnimation to reset properly
function startAttackAnimation() {
  if (character.isAttacking) return;

  character.isAttacking = true;
  character.currentFrame = 0;
  animationTimer = 0;

  let attackDirection;
  if (character.direction.includes("right") || character.direction === "right") {
    attackDirection = "attack-right";
  } else if (character.direction.includes("left") || character.direction === "left") {
    attackDirection = "attack-left";
  } else if (character.direction.includes("up") || character.direction === "up") {
    attackDirection = "attack-up";
  } else {
    attackDirection = "attack-down";
  }

  character.direction = attackDirection;
  updateCharacterPosition();
}

// Update completeAttackAnimation
function completeAttackAnimation() {
  character.isAttacking = false;
  const direction = character.direction.split("-")[1];
  character.direction = `idle-${direction}`;
  character.currentFrame = 0;
  animationTimer = 0;
  updateCharacterPosition();
}

// Add F key listener for attacks
document.addEventListener("keydown", (event) => {
  if (gamePaused) return;
  if (event.key.toLowerCase() === "f" && !character.isAttacking) {
    startAttackAnimation();
    // Start the game loop for attack animation
    requestAnimationFrame(gameLoop);
  } else if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
  ) {
    keysPressed[event.key] = true;
    if (!character.isMoving && !character.isAttacking) {
      character.isMoving = true;
      requestAnimationFrame(gameLoop);
    }
  }
});

// Define different types of objects and their behavior
const ALWAYS_BELOW_CHARACTER = ["bridge", "path", "water"];
const BEHIND_BUT_SOLID = ["house", "house2", "cabin"];
const DYNAMIC_Z_INDEX_OBJECTS = ["tree", "rock"];

// Function to Render Collision Objects
export function renderCollisionObjects(collisionZones) {
  if (!collisionZones) return;

  collisionZones.forEach((zone) => {
    const obj = document.createElement("div");
    obj.classList.add("collision-object", zone.type);
    obj.style.left = `${zone.x}px`;
    obj.style.top = `${zone.y}px`;
    obj.style.width = `${zone.width}px`;
    obj.style.height = `${zone.height}px`;
    obj.style.backgroundPosition = `-${
      zone.sprite.column * FRAME_WIDTH * 2
    }px -${zone.sprite.row * FRAME_HEIGHT * 2}px`;

    if (
      ALWAYS_BELOW_CHARACTER.includes(zone.type) ||
      BEHIND_BUT_SOLID.includes(zone.type)
    ) {
      obj.style.zIndex = 0;
    } else {
      obj.style.zIndex = 1;
    }

    if (HIDDEN_OBJECTS.includes(zone.type)) {
      obj.style.display = "none";
    }

    gameContainer.appendChild(obj);
  });
}

// Initial render (for forest)
renderCollisionObjects(areaCollisionZones.forest);

// Function to check if character is above or below an object's midpoint
function updateObjectDepth() {
  const characterMidpoint = character.y + DISPLAY_FRAME_HEIGHT / 2;
  const currentCollisionZones = areaCollisionZones[gameState.currentArea];

  currentCollisionZones.forEach((zone) => {
    const objectElement = document.querySelector(
      `.collision-object.${zone.type}`
    );
    if (!objectElement) return;
    // Always below character objects and behind but solid objects
    if (
      ALWAYS_BELOW_CHARACTER.includes(zone.type) ||
      BEHIND_BUT_SOLID.includes(zone.type)
    ) {
      objectElement.style.zIndex = 0;
      characterElement.style.zIndex = 1;
      return;
    }

    // Dynamic z-index objects
    const objectMidpoint = zone.y + zone.height / 2;
    const characterRight = character.x + DISPLAY_FRAME_WIDTH;
    const characterLeft = character.x;
    const objectRight = zone.x + zone.width;
    const objectLeft = zone.x;

    const horizontalOverlap = !(
      characterRight < objectLeft || characterLeft > objectRight
    );

    if (horizontalOverlap) {
      if (characterMidpoint < objectMidpoint) {
        objectElement.style.zIndex = 2;
        characterElement.style.zIndex = 1;
      } else {
        objectElement.style.zIndex = 1;
        characterElement.style.zIndex = 2;
      }
    }
  });
}

// Update character position function
function updateCharacterPosition() {
  characterElement.style.left = `${character.x}px`;
  characterElement.style.top = `${character.y}px`;

  const animation = animations[character.direction] || animations["idle-down"];
  let frameX;
  let frameY = animation.row * FRAME_HEIGHT * 2;

  if (animation.frames > 1) {
    frameX = character.currentFrame * FRAME_WIDTH * 2;
  } else if (animation.frame !== undefined) {
    frameX = animation.frame * FRAME_WIDTH * 2;
  } else {
    frameX = 0;
  }

  characterElement.style.backgroundPosition = `-${frameX}px -${frameY}px`;
  updateObjectDepth();
}

// game container uses relative positioning
gameContainer.style.position = "relative";

// Initialize objects
/*if (areaCollisionZones.forest && areaCollisionZones.forest.length > 0) {
  renderCollisionObjects(areaCollisionZones.forest);
  console.log("Forest collision objects rendered");
} else {
  console.warn("No collision zones to render");
}*/

// Key state tracking
const keysPressed = {};
let currentMovementKey = null;

document.addEventListener("keydown", (event) => {
  if (!gameStarted || gamePaused) return;

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
    keysPressed[event.key] = true;

    if (!currentMovementKey) {
      currentMovementKey = event.key;
    }

    if (!character.isMoving && !character.isAttacking) {
      character.isMoving = true;
      requestAnimationFrame(gameLoop);
    }
  } else if (event.key.toLowerCase() === "f" && !character.isAttacking) {
    startAttackAnimation();
    requestAnimationFrame(gameLoop);
  }
});

document.addEventListener("keyup", (event) => {
  if (!gameStarted) return;

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
    keysPressed[event.key] = false;

    // If the released key was the current movement key, find the next pressed key
    if (event.key === currentMovementKey) {
      currentMovementKey =
        Object.entries(keysPressed).find(
          ([key, isPressed]) =>
            isPressed &&
            ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)
        )?.[0] || null;
    }

    if (!Object.values(keysPressed).some((pressed) => pressed)) {
      stopCharacterAnimation();
    }
  }
});

function isWalkable(x, y) {
  try {
    // Ensure coordinates are integers and within bounds
    x = Math.floor(x);
    y = Math.floor(y);

    if (x < 0 || x >= gameWidth || y < 0 || y >= gameHeight) {
      return false;
    }

    const pixelData = collisionCtx.getImageData(x, y, 1, 1).data;
    console.log(`Checking position (${x}, ${y}), alpha: ${pixelData[3]}`); // Debug log
    return pixelData[3] === 0; // true if transparent
  } catch (error) {
    console.error("Error checking walkable:", error);
    return false;
  }
}


function checkCollision(newX, newY) {
  const characterHitbox = {
    x: newX + DISPLAY_FRAME_WIDTH * 0.2,
    y: newY + DISPLAY_FRAME_HEIGHT * 0.6,
    width: DISPLAY_FRAME_WIDTH * 0.6,
    height: DISPLAY_FRAME_HEIGHT * 0.3,
  };

  if (gameState.currentArea === "village") {
    // Sample multiple points around the character's hitbox
    const points = [
      { x: characterHitbox.x, y: characterHitbox.y }, // Top-left
      { x: characterHitbox.x + characterHitbox.width, y: characterHitbox.y }, // Top-right
      { x: characterHitbox.x, y: characterHitbox.y + characterHitbox.height }, // Bottom-left
      {
        x: characterHitbox.x + characterHitbox.width,
        y: characterHitbox.y + characterHitbox.height,
      }, // Bottom-right
      {
        x: characterHitbox.x + characterHitbox.width / 2,
        y: characterHitbox.y + characterHitbox.height / 2,
      }, // Center
    ];

    // Collision occurs if any point is in a non-walkable area
    const collision = points.some((point) => !isWalkable(point.x, point.y));
    return collision;
  }
  
  // Forest area uses the original collision system
  const currentCollisionZones = areaCollisionZones[gameState.currentArea];
  if (!currentCollisionZones) return false;

  // Check collision with static objects
  for (const zone of currentCollisionZones) {
    if (!zone || typeof zone.type === "undefined") {
      continue;
    }

    // Skip collision check only for ALWAYS_BELOW_CHARACTER objects
    if (ALWAYS_BELOW_CHARACTER.includes(zone.type)) {
      continue;
    }

    // Create object hitbox with special handling for houses
    let objectHitbox;
    if (BEHIND_BUT_SOLID.includes(zone.type)) {
      objectHitbox = {
        x: zone.x,
        y: zone.y + zone.height * 0.7,
        width: zone.width,
        height: zone.height * 0.4,
      };
    } else {
      objectHitbox = {
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
      };
    }

    // Check for collision
    if (
      characterHitbox.x < objectHitbox.x + objectHitbox.width &&
      characterHitbox.x + characterHitbox.width > objectHitbox.x &&
      characterHitbox.y < objectHitbox.y + objectHitbox.height &&
      characterHitbox.y + characterHitbox.height > objectHitbox.y
    ) {
      return true;
    }
  }

  // Check collision with Orc1 and handle combat
  if (checkCollisionWithOrc1(characterHitbox)) {
    console.log("Collision detected with Orc1!");
    return true;
  }

  // Check for combat range even if not colliding
  initiateCombatWithOrc1(characterHitbox);

  return false;
}

// Variables for animation timing
let lastTime = null;
let animationTimer = 0;
let isFirstMove = true; 

// Main game loop: handles character movement, animations, and updates game state based on delta time
function gameLoop(timestamp) {
  if (!gameStarted || isGameOverState()) return;

  if (!lastTime) lastTime = timestamp;
  const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  if (!gamePaused) {
    if (character.isAttacking) {
      animationTimer += deltaTime * 1000;
      if (animationTimer >= ANIMATION_SPEED) {
        animationTimer = 0;
        character.currentFrame++;

        // Check for hit on attack frame 2
        if (character.currentFrame === 2) {
          const attackRange = 40;
          let attackHitbox = {
            x: character.x,
            y: character.y,
            width: DISPLAY_FRAME_WIDTH,
            height: DISPLAY_FRAME_HEIGHT,
          };

          switch (character.direction) {
            case "attack-left":
              attackHitbox.x -= attackRange;
              attackHitbox.width += attackRange;
              break;
            case "attack-right":
              attackHitbox.width += attackRange;
              break;
            case "attack-up":
              attackHitbox.y -= attackRange;
              attackHitbox.height += attackRange;
              break;
            case "attack-down":
              attackHitbox.height += attackRange;
              break;
          }

          // Only check orc hits in the forest area
          if (gameState.currentArea === "forest") {
            checkPlayerAttackHit(attackHitbox);
          }
        }

        if (character.currentFrame >= animations[character.direction].frames) {
          completeAttackAnimation();
        } else {
          updateCharacterPosition();
        }
      }
    } else {
      let moved = false;
      let newDirection = character.direction;
      let dx = 0;
      let dy = 0;

      if (currentMovementKey) {
        switch (currentMovementKey) {
          case "ArrowUp":
            dy = -1;
            newDirection = "up";
            moved = true;
            break;
          case "ArrowDown":
            dy = 1;
            newDirection = "down";
            moved = true;
            break;
          case "ArrowLeft":
            dx = -1;
            newDirection = "left";
            moved = true;
            break;
          case "ArrowRight":
            dx = 1;
            newDirection = "right";
            moved = true;
            break;
        }
      }

      if (moved) {
        const newX = character.x + dx * character.speed * deltaTime;
        const newY = character.y + dy * character.speed * deltaTime;

        const boundedX = Math.max(
          0,
          Math.min(gameWidth - DISPLAY_FRAME_WIDTH, newX)
        );
        const boundedY = Math.max(
          0,
          Math.min(gameHeight - DISPLAY_FRAME_HEIGHT, newY)
        );

        // Use area-specific collision zones
        if (!checkCollision(boundedX, boundedY)) {
          character.x = boundedX;
          character.y = boundedY;
        }

        if (character.direction !== newDirection) {
          character.direction = newDirection;
          character.currentFrame = 0;
        }
        updateCharacterPosition();
      } else {
        if (!character.direction.startsWith("idle-")) {
          character.direction = `idle-${character.direction}`;
          character.currentFrame = 0;
          updateCharacterPosition();
        }
      }

      // Handle animation frame updates
      const animation = animations[character.direction];
      if (animation && animation.frames > 1) {
        animationTimer += deltaTime * 1000;
        if (animationTimer >= ANIMATION_SPEED) {
          animationTimer = 0;
          character.currentFrame =
            (character.currentFrame + 1) % animation.frames;
          updateCharacterPosition();
        }
      }
    }

    // Only update orc animation in forest area
    if (gameState.currentArea === "forest") {
      animateOrc1(timestamp, character.x, character.y);
    }
  }

  requestAnimationFrame(gameLoop);
}
// Then modify your keydown and keyup event handlers:
/*window.addEventListener("keydown", (event) => {
  if (!gameStarted) return;
  
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    if (!keysPressed[event.key]) {
      lastPressedKey = event.key;
    }
    keysPressed[event.key] = true;
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  if (!gameStarted) return;
  
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    keysPressed[event.key] = false;
    // If the released key was the last pressed key, find the next pressed key if any
    if (event.key === lastPressedKey) {
      lastPressedKey = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].find(
        key => keysPressed[key]
      ) || null;
    }
    event.preventDefault();
  }
});
*/

// Start the game loop
requestAnimationFrame(gameLoop);

// Update stopCharacterAnimation to check for attacking
function stopCharacterAnimation() {
  if (character.isAttacking) return; // Don't stop if attacking

  character.isMoving = false;
  isFirstMove = true;
  if (!character.direction.startsWith("idle-")) {
    character.direction = `idle-${character.direction}`;
  }
  character.currentFrame = 0;
  updateCharacterPosition();
}

// Initialize the character position
updateCharacterPosition();

// Modal Functionality
const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("how-to-play");
const closeModalBtn = document.querySelector(".close-button");

// Function to open modal
openModalBtn.addEventListener("click", (e) => {
  e.preventDefault();
  modal.classList.remove("hidden");
});

// Function to close modal
closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Close modal when clicking outside the modal content
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

// Dark Mode Toggle Functionality
const darkModeToggle = document.getElementById("dark-mode-toggle");

// Toggle dark mode
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  // Optionally, store preference in localStorage
  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

// Load theme preference on page load
window.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
  }
});
