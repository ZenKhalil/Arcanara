import { nodes, displayNode } from "./story.js";
import { collisionZones } from "./objects.js";
import { checkCollisionWithOrc1, initiateCombatWithOrc1, animateOrc1 } from "./enemies.js";

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

// Get DOM elements
const startMenu = document.getElementById("start-menu");
const startGameBtn = document.getElementById("start-game");
const howToPlayBtn = document.getElementById("how-to-play");
const gameContainer = document.getElementById("game-container");

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

// Frame settings
const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 32;
const DISPLAY_FRAME_WIDTH = 64;
const DISPLAY_FRAME_HEIGHT = 64;
const ANIMATION_SPEED = 100;

// Character setup
const character = {
  x: 1,
  y: gameHeight * 0.6,
  speed: 200,
  direction: "idle-right",
  isMoving: false,
  isAttacking: false,
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
  "attack-right": { row: 5, frames: 4 },
  "attack-left": { row: 6, frames: 4 },
  "attack-down": { row: 7, frames: 4 },
  "attack-up": { row: 8, frames: 4 },
};

// Grab character element and set initial z-index
const characterElement = document.getElementById("character");
characterElement.style.zIndex = 1;

// Add attack animation function
function startAttackAnimation() {
  if (character.isAttacking) return;

  character.isAttacking = true;
  character.currentFrame = 0;
  animationTimer = 0; // Reset animation timer

  // Determine attack direction based on current facing direction
  let attackDirection;
  if (character.direction.includes("right")) {
    attackDirection = "attack-right";
  } else if (character.direction.includes("left")) {
    attackDirection = "attack-left";
  } else if (character.direction.includes("up")) {
    attackDirection = "attack-up";
  } else {
    attackDirection = "attack-down";
  }

  character.direction = attackDirection;
  updateCharacterPosition();
}

// Add function to complete attack animation
function completeAttackAnimation() {
  character.isAttacking = false;
  // Reset to idle position based on attack direction
  const direction = character.direction.split("-")[1];
  character.direction = `idle-${direction}`;
  character.currentFrame = 0;
  animationTimer = 0; // Reset animation timer
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
    if (
      ALWAYS_BELOW_CHARACTER.includes(zone.type) ||
      BEHIND_BUT_SOLID.includes(zone.type)
    ) {
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
  // Define character hitbox
  const characterHitbox = {
    x: newX + DISPLAY_FRAME_WIDTH * 0.2,
    y: newY + DISPLAY_FRAME_HEIGHT * 0.6,
    width: DISPLAY_FRAME_WIDTH * 0.6,
    height: DISPLAY_FRAME_HEIGHT * 0.3,
  };

  // Check collision with static objects
  for (const zone of collisionZones) {
    if (!zone || typeof zone.type === "undefined") {
      //console.warn("Invalid collision zone encountered:", zone);
      continue;
    }

    // Skip collision check only for ALWAYS_BELOW_CHARACTER objects
    if (ALWAYS_BELOW_CHARACTER.includes(zone.type)) {
      continue;
    }

    // Create object hitbox with special handling for houses
    let objectHitbox;
    if (BEHIND_BUT_SOLID.includes(zone.type)) {
      // Expand collision area for houses
      objectHitbox = {
        x: zone.x,
        y: zone.y + zone.height * 0.7, // Adjust this value to change where collision starts
        width: zone.width,
        height: zone.height * 0.4, // Adjust this value to change collision area size
      };
    } else {
      // Standard hitbox for other objects
      objectHitbox = {
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
      };
    }

    // Check for collision with static object
    if (
      characterHitbox.x < objectHitbox.x + objectHitbox.width &&
      characterHitbox.x + characterHitbox.width > objectHitbox.x &&
      characterHitbox.y < objectHitbox.y + objectHitbox.height &&
      characterHitbox.y + characterHitbox.height > objectHitbox.y
    ) {
      return true; // Collision detected with static object
    }
  }

  // Check collision with Orc1 and handle combat
  if (checkCollisionWithOrc1(characterHitbox)) {
    console.log("Collision detected with Orc1!");
    return true; // Collision detected
  }

  // Check for combat range even if not colliding
  initiateCombatWithOrc1(characterHitbox);

  return false; // No collision
}

// Variables for animation timing
let lastTime = null;
let animationTimer = 0;
let isFirstMove = true; // Add this flag to handle first movement

function gameLoop(timestamp) {
  if (!gameStarted) return;

  if (!lastTime) lastTime = timestamp;
  const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  // Only run the game logic if the game is not paused
  if (!gamePaused) {
    // Handle attack animation
    if (character.isAttacking) {
      animationTimer += deltaTime * 1000;
      if (animationTimer >= ANIMATION_SPEED) {
        animationTimer = 0;
        character.currentFrame++;

        if (character.currentFrame >= animations[character.direction].frames) {
          completeAttackAnimation();
        } else {
          updateCharacterPosition();
        }
      }

      // Call animateOrc1 with updated character position
      animateOrc1(timestamp, character.x, character.y);

      // We can return here if we want to skip the rest of the game logic
      // However, since movement is prevented during attacking, it's safe to proceed
    } else {
      let moved = false;
      let newDirection = character.direction;

      // Calculate movement vector
      let dx = 0;
      let dy = 0;

      // Check which keys are pressed
      if (keysPressed["ArrowUp"]) {
        dy -= 1;
        newDirection = "up";
        moved = true;
      }
      if (keysPressed["ArrowDown"]) {
        dy += 1;
        newDirection = "down";
        moved = true;
      }
      if (keysPressed["ArrowLeft"]) {
        dx -= 1;
        newDirection = "left";
        moved = true;
      }
      if (keysPressed["ArrowRight"]) {
        dx += 1;
        newDirection = "right";
        moved = true;
      }

      // Apply movement with collision check
      if (moved) {
        const newX = character.x + dx * character.speed * deltaTime;
        const newY = character.y + dy * character.speed * deltaTime;

        // First check game bounds
        const boundedX = Math.max(
          0,
          Math.min(gameWidth - DISPLAY_FRAME_WIDTH, newX)
        );
        const boundedY = Math.max(
          0,
          Math.min(gameHeight - DISPLAY_FRAME_HEIGHT, newY)
        );

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
          character.currentFrame =
            (character.currentFrame + 1) % animation.frames;
          updateCharacterPosition();
        }
      }

      // Call animateOrc1 with updated character position
      animateOrc1(timestamp, character.x, character.y);
    }
  }

  // Always request the next frame, regardless of gamePaused state
  requestAnimationFrame(gameLoop);
}


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
