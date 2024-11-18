// Select orc1 element
const orc1Element = document.getElementById("orc1");

if (!orc1Element) {
  console.error("Orc1 element not found!");
}

// Orc1 setup
const orc1 = {
  x: 770,
  y: 100,
  width: 96,
  height: 96,
};

// Apply the initial position to the element
if (orc1Element) {
  orc1Element.style.left = `${orc1.x}px`;
  orc1Element.style.top = `${orc1.y}px`;
}

// Define orc1 animation parameters
const ORC1_IDLE_ROW = 0; // Row index for front-facing idle
const ORC1_ANIMATION_COLS = 4; // Number of frames in idle animation
const ORC1_FRAME_WIDTH = 96; // New width of each frame in display size
const ORC1_FRAME_HEIGHT = 96; // New height of each frame in display size
const ORC1_ANIMATION_SPEED = 200; // Time between frames in ms

let orc1CurrentFrame = 0;
let orc1LastFrameChange = 0;

// Function to animate orc1's idle frames
export function animateOrc1(timestamp) {
  if (!orc1LastFrameChange) {
    orc1LastFrameChange = timestamp;
  }

  const elapsed = timestamp - orc1LastFrameChange;

  if (elapsed > ORC1_ANIMATION_SPEED) {
    // Advance to next frame
    orc1CurrentFrame = (orc1CurrentFrame + 1) % ORC1_ANIMATION_COLS;
    // Update background-position to show the correct frame
    orc1Element.style.backgroundPosition = `-${
      orc1CurrentFrame * ORC1_FRAME_WIDTH
    }px -${ORC1_IDLE_ROW * ORC1_FRAME_HEIGHT}px`;
    orc1LastFrameChange = timestamp;
  }

  // Continue the animation loop
  requestAnimationFrame(animateOrc1);
}

// Start the orc1 animation if orc1Element exists
if (orc1Element) {
  requestAnimationFrame(animateOrc1);
}

// Function to check collision between character and Orc1
export function checkCollisionWithOrc1(characterHitbox) {
  // Define Orc1's hitbox based on its current position and size
  const orc1Hitbox = {
    x: orc1.x,
    y: orc1.y,
    width: orc1.width,
    height: orc1.height,
  };

  // Check for overlap between character's hitbox and Orc1's hitbox
  if (
    characterHitbox.x < orc1Hitbox.x + orc1Hitbox.width &&
    characterHitbox.x + characterHitbox.width > orc1Hitbox.x &&
    characterHitbox.y < orc1Hitbox.y + orc1Hitbox.height &&
    characterHitbox.y + characterHitbox.height > orc1Hitbox.y
  ) {
    return true; // Collision detected with Orc1
  }

  return false; // No collision with Orc1
}

// Optional: Function to update Orc1's position (if Orc1 moves)
export function updateOrc1Position(newX, newY) {
  orc1.x = newX;
  orc1.y = newY;
  if (orc1Element) {
    orc1Element.style.left = `${orc1.x}px`;
    orc1Element.style.top = `${orc1.y}px`;
  }
}
