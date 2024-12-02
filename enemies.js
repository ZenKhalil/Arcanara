// Select orc1 element
const orc1Element = document.getElementById("orc1");
if (!orc1Element) {
  console.error("Orc1 element not found!");
}

// Orc1 setup
const orc1 = {
  x: 770,
  y: 100,
  width: 96, // Match CSS width
  height: 96, // Match CSS height
  isInCombat: false,
  facing: "front",
  currentAction: "idle",
};

// Animation parameters
const ORC1_IDLE_COLS = 4;
const ORC1_ATTACK_COLS = 4;
const ORC1_FRAME_WIDTH = 96;
const ORC1_FRAME_HEIGHT = 96;
const ORC1_ANIMATION_SPEED = 200;
const ORC1_ATTACK_SPEED = 150;

// Sprite sheet dimensions
const IDLE_SHEET_WIDTH = 384;
const IDLE_SHEET_HEIGHT = 384;
const ATTACK_SHEET_WIDTH = 768;
const ATTACK_SHEET_HEIGHT = 384;

let orc1CurrentFrame = 0;
let orc1LastFrameChange = 0;

// Apply initial position
if (orc1Element) {
  orc1Element.style.left = `${orc1.x}px`;
  orc1Element.style.top = `${orc1.y}px`;
}

// Function to update orc direction based on character position
function updateOrc1Direction(characterX, characterY) {
  const DIRECTION_CHANGE_RANGE = 150; // Range within which orc will turn
  const distanceX = characterX - orc1.x;
  const distanceY = characterY - orc1.y;
  const absDistanceX = Math.abs(distanceX);
  const absDistanceY = Math.abs(distanceY);
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  // Only change direction if character is within range
  if (distance <= DIRECTION_CHANGE_RANGE) {
    // Decide which axis to consider based on which distance is greater
    if (absDistanceX > absDistanceY) {
      // Horizontal movement is dominant
      if (distanceX < 0) {
        orc1.facing = "left";
      } else if (distanceX > 0) {
        orc1.facing = "right";
      }
    } else {
      // Vertical movement is dominant
      if (distanceY < 0) {
        orc1.facing = "back"; // Character is above the orc
      } else if (distanceY > 0) {
        orc1.facing = "front"; // Character is below the orc
      }
    }
  } else {
    // Return to front if character is out of range
    orc1.facing = "front";
  }
}


// Function to get row based on facing direction
function getDirectionRow() {
  switch (orc1.facing) {
    case "front": return 0;
    case "back": return 1;
    case "left": return 2;
    case "right": return 3;
    default: return 0;
  }
}

// Function to animate orc1
// Function to animate orc1
function animateOrc1(timestamp, characterX, characterY) {
  if (!orc1Element) return;

  if (!orc1LastFrameChange) {
    orc1LastFrameChange = timestamp;
  }

  // Update direction based on character position
  updateOrc1Direction(characterX, characterY);

  const elapsed = timestamp - orc1LastFrameChange;
  const animationSpeed =
    orc1.currentAction === "attack" ? ORC1_ATTACK_SPEED : ORC1_ANIMATION_SPEED;

  if (elapsed > animationSpeed) {
    // Advance to next frame
    const maxFrames =
      orc1.currentAction === "attack" ? ORC1_ATTACK_COLS : ORC1_IDLE_COLS;
    orc1CurrentFrame = (orc1CurrentFrame + 1) % maxFrames;

    const directionRow = getDirectionRow();

    // Set the appropriate sprite sheet and background size
    if (orc1.currentAction === "attack") {
      orc1Element.style.backgroundImage =
        'url("./images/orc1_attack_full.png")';
      orc1Element.style.backgroundSize = `${ATTACK_SHEET_WIDTH}px ${ATTACK_SHEET_HEIGHT}px`;

      const scaledFrameWidth = ATTACK_SHEET_WIDTH / ORC1_ATTACK_COLS;
      const yOffset = directionRow * (ATTACK_SHEET_HEIGHT / 4);
      orc1Element.style.backgroundPosition = `-${
        orc1CurrentFrame * scaledFrameWidth
      }px -${yOffset}px`;
    } else {
      orc1Element.style.backgroundImage = 'url("./images/orc1_idle_full.png")';
      orc1Element.style.backgroundSize = `${IDLE_SHEET_WIDTH}px ${IDLE_SHEET_HEIGHT}px`;

      const yOffset = directionRow * ORC1_FRAME_HEIGHT;
      orc1Element.style.backgroundPosition = `-${
        orc1CurrentFrame * ORC1_FRAME_WIDTH
      }px -${yOffset}px`;
    }

    orc1LastFrameChange = timestamp;
  }

  // Remove the requestAnimationFrame call here
}

// Remove the initial requestAnimationFrame call
// Start the orc1 animation
// if (orc1Element) {
//   requestAnimationFrame((timestamp) => animateOrc1(timestamp, character.x, character.y));
// }

// Function to initiate combat
function initiateCombatWithOrc1(characterHitbox) {
  const COMBAT_RANGE = 60;

  const dx = characterHitbox.x + characterHitbox.width / 2 - (orc1.x + orc1.width / 2);
  const dy = characterHitbox.y + characterHitbox.height / 2 - (orc1.y + orc1.height / 2);
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance <= COMBAT_RANGE && !orc1.isInCombat) {
    orc1.isInCombat = true;
    orc1.currentAction = "attack";
    orc1CurrentFrame = 0;
    return true;
  } else if (distance > COMBAT_RANGE && orc1.isInCombat) {
    orc1.isInCombat = false;
    orc1.currentAction = "idle";
    orc1CurrentFrame = 0;
  }
  return false;
}

// Function to check collision between character and Orc1
function checkCollisionWithOrc1(characterHitbox) {
  const hitboxMargin = 18; // Adjust this value to make the collision area smaller or larger

  const orc1Hitbox = {
    x: orc1.x + hitboxMargin,
    y: orc1.y + hitboxMargin,
    width: orc1.width - hitboxMargin * 3,
    height: orc1.height - hitboxMargin * 1,
  };

  return (
    characterHitbox.x < orc1Hitbox.x + orc1Hitbox.width &&
    characterHitbox.x + characterHitbox.width > orc1Hitbox.x &&
    characterHitbox.y < orc1Hitbox.y + orc1Hitbox.height &&
    characterHitbox.y + characterHitbox.height > orc1Hitbox.y
  );
}


// Function to update Orc1's position
function updateOrc1Position(newX, newY) {
  orc1.x = newX;
  orc1.y = newY;
  if (orc1Element) {
    orc1Element.style.left = `${orc1.x}px`;
    orc1Element.style.top = `${orc1.y}px`;
  }
}

// Start the orc1 animation
if (orc1Element) {
  requestAnimationFrame(animateOrc1);
}


export {
  checkCollisionWithOrc1,
  initiateCombatWithOrc1,
  animateOrc1,
  updateOrc1Position
};