import { collisionZones } from "./objects.js";
console.log("Imported collisionZones:", collisionZones);

const gameContainer = document.getElementById("game-container");

// Game area dimensions
const gameWidth = 1118;
const gameHeight = 615;

// Frame settings
const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 32;
const DISPLAY_FRAME_WIDTH = 64;
const DISPLAY_FRAME_HEIGHT = 64;
const ANIMATION_SPEED = 100;

// Define objects that character should always be above - Move this up!
const ALWAYS_BELOW_CHARACTER = ["bridge", "path", "water"];

// Character setup
const character = {
  x: 1,
  y: gameHeight * 0.6,
  speed: 200,
  direction: "idle-right",
  isMoving: false,
  currentFrame: 0,
};

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
};

// Grab character element and set initial z-index
const characterElement = document.getElementById("character");
characterElement.style.zIndex = 1;

// Function to Render Collision Objects
function renderCollisionObjects() {
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

    // Set initial z-index based on object type
    if (ALWAYS_BELOW_CHARACTER.includes(zone.type)) {
      obj.style.zIndex = 0;
    } else {
      obj.style.zIndex = 1;
    }

    gameContainer.appendChild(obj);
  });
}

// Function to check if character is above or below an object's midpoint
function updateObjectDepth() {
  const characterMidpoint = character.y + DISPLAY_FRAME_HEIGHT / 2;

  collisionZones.forEach((zone) => {
    const objectElement = document.querySelector(
      `.collision-object.${zone.type}`
    );
    if (!objectElement) return;

    if (ALWAYS_BELOW_CHARACTER.includes(zone.type)) {
      objectElement.style.zIndex = 0;
      characterElement.style.zIndex = 1;
      return;
    }

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
if (collisionZones && collisionZones.length > 0) {
  renderCollisionObjects();
  console.log("Collision objects rendered");
} else {
  console.warn("No collision zones to render");
}

// Key state tracking
const keysPressed = {};

// Event listeners for key presses
document.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    keysPressed[event.key] = true;
    if (!character.isMoving) {
      character.isMoving = true;
      requestAnimationFrame(gameLoop);
    }
  }
});

document.addEventListener("keyup", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    keysPressed[event.key] = false;
    if (
      !keysPressed["ArrowUp"] &&
      !keysPressed["ArrowDown"] &&
      !keysPressed["ArrowLeft"] &&
      !keysPressed["ArrowRight"]
    ) {
      stopCharacterAnimation();
    }
  }
});

// Add collision checking function
function checkCollision(newX, newY) {
  // Create character hitbox (slightly smaller than visual size for better gameplay feel)
  const characterHitbox = {
    x: newX + DISPLAY_FRAME_WIDTH * 0.2, // 20% inset from sides
    y: newY + DISPLAY_FRAME_HEIGHT * 0.6, // 60% down from top for feet position
    width: DISPLAY_FRAME_WIDTH * 0.6, // 60% of character width
    height: DISPLAY_FRAME_HEIGHT * 0.3, // 30% of character height for feet area
  };

  // Check collision with each object
  for (const zone of collisionZones) {
    // Validate zone object
    if (!zone || typeof zone.type === 'undefined') {
      console.warn("Invalid collision zone encountered:", zone);
      continue; // Skip this zone
    }

    // Skip collision check for walkable objects
    if (ALWAYS_BELOW_CHARACTER.includes(zone.type)) {
      continue;
    }

    // Create object hitbox
    const objectHitbox = {
      x: zone.x,
      y: zone.y,
      width: zone.width,
      height: zone.height,
    };

    // Check for overlap
    if (
      characterHitbox.x + characterHitbox.width < objectHitbox.x ||
      characterHitbox.x > objectHitbox.x + objectHitbox.width ||
      characterHitbox.y + characterHitbox.height < objectHitbox.y ||
      characterHitbox.y > objectHitbox.y + objectHitbox.height
    ) {
      // No collision
      continue;
    } else {
      // Collision detected
      return true;
    }
  }

  return false; // No collision with any zones
}


// Variables for animation timing
let lastTime = null;
let animationTimer = 0;
let isFirstMove = true; // Add this flag to handle first movement

function gameLoop(timestamp) {
  if (isFirstMove) {
    lastTime = timestamp;
    isFirstMove = false;
  }
  
  if (!lastTime) lastTime = timestamp;
  const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  if (character.isMoving) {
    let moved = false;
    let newDirection = character.direction;
    
    // Calculate movement vector
    let dx = 0;
    let dy = 0;

    // Prioritize movement in this order: up, down, left, right
    if (keysPressed["ArrowUp"]) {
      dy -= 1;
      newDirection = "up";
      moved = true;
    } else if (keysPressed["ArrowDown"]) {
      dy += 1;
      newDirection = "down";
      moved = true;
    } else if (keysPressed["ArrowLeft"]) {
      dx -= 1;
      newDirection = "left";
      moved = true;
    } else if (keysPressed["ArrowRight"]) {
      dx += 1;
      newDirection = "right";
      moved = true;
    }

    // Apply movement with collision check
    if (moved) {
      const newX = character.x + dx * character.speed * deltaTime;
      const newY = character.y + dy * character.speed * deltaTime;

      // First check game bounds
      const boundedX = Math.max(0, Math.min(gameWidth - DISPLAY_FRAME_WIDTH, newX));
      const boundedY = Math.max(0, Math.min(gameHeight - DISPLAY_FRAME_HEIGHT, newY));

      // Then check object collisions
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
        character.currentFrame = (character.currentFrame + 1) % animation.frames;
        updateCharacterPosition();
      }
    }

    requestAnimationFrame(gameLoop);
  } else {
    lastTime = null;
    isFirstMove = true;
  }
}

// Optional: Add visual debugging for hitboxes (uncomment to use)
/*
function renderHitbox(x, y, width, height, color) {
  const hitbox = document.createElement('div');
  hitbox.style.position = 'absolute';
  hitbox.style.left = `${x}px`;
  hitbox.style.top = `${y}px`;
  hitbox.style.width = `${width}px`;
  hitbox.style.height = `${height}px`;
  hitbox.style.border = `1px solid ${color}`;
  hitbox.style.pointerEvents = 'none';
  hitbox.style.zIndex = '999';
  gameContainer.appendChild(hitbox);
  return hitbox;
}

// Usage in updateCharacterPosition:
const characterHitbox = {
  x: character.x + DISPLAY_FRAME_WIDTH * 0.2,
  y: character.y + DISPLAY_FRAME_HEIGHT * 0.6,
  width: DISPLAY_FRAME_WIDTH * 0.6,
  height: DISPLAY_FRAME_HEIGHT * 0.3
};
renderHitbox(characterHitbox.x, characterHitbox.y, characterHitbox.width, characterHitbox.height, 'red');
*/

// Update the stopCharacterAnimation function to reset the first move flag
function stopCharacterAnimation() {
  character.isMoving = false;
  isFirstMove = true; // Reset first move flag
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
const openModalBtn = document.getElementById("open-modal");
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
