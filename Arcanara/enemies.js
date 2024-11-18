// Select orc1 element
const orc1Element = document.getElementById("orc1");
if (!orc1Element) {
  console.error("Orc1 element not found!");
}

// Orc1 setup
const orc1 = {
  x: 770,
  y: 100,
  width: 65,
  height: 85,
  isInCombat: false,
  facing: "left", // 'left' or 'right'
  currentAction: "idle", // 'idle' or 'attack'
};

// Apply the initial position to the element
if (orc1Element) {
  orc1Element.style.left = `${orc1.x}px`;
  orc1Element.style.top = `${orc1.y}px`;
}

// Animation parameters
const ORC1_IDLE_ROW = 0;
const ORC1_ATTACK_ROW = 0; // Row for attack animation
const ORC1_ANIMATION_COLS = 4;
const ORC1_FRAME_WIDTH = 96;
const ORC1_FRAME_HEIGHT = 96;
const ORC1_ANIMATION_SPEED = 200;
const ORC1_ATTACK_SPEED = 150; // Slightly faster for attack animation

let orc1CurrentFrame = 0;
let orc1LastFrameChange = 0;

// Function to flip orc sprite based on facing direction
function updateOrc1Facing(characterX) {
  const shouldFaceRight = characterX > orc1.x;
  if (shouldFaceRight !== (orc1.facing === "right")) {
    orc1.facing = shouldFaceRight ? "right" : "left";
    orc1Element.style.transform = `scaleX(${shouldFaceRight ? -1 : 1})`;
  }
}

// Function to animate orc1
 function animateOrc1(timestamp, characterX) {
  if (!orc1LastFrameChange) {
    orc1LastFrameChange = timestamp;
  }

  // Update facing direction
  updateOrc1Facing(characterX);

  const elapsed = timestamp - orc1LastFrameChange;
  const animationSpeed =
    orc1.currentAction === "attack" ? ORC1_ATTACK_SPEED : ORC1_ANIMATION_SPEED;

  if (elapsed > animationSpeed) {
    // Advance to next frame
    orc1CurrentFrame = (orc1CurrentFrame + 1) % ORC1_ANIMATION_COLS;

    // Update sprite sheet and background position
    if (orc1.currentAction === "attack") {
      orc1Element.style.backgroundImage = 'url("./images/orc1_attack_full.png")';
    } else {
      orc1Element.style.backgroundImage = 'url("./images/orc1_idle_full.png")';
    }

    orc1Element.style.backgroundPosition = `-${
      orc1CurrentFrame * ORC1_FRAME_WIDTH
    }px -${
      (orc1.currentAction === "attack" ? ORC1_ATTACK_ROW : ORC1_IDLE_ROW) *
      ORC1_FRAME_HEIGHT
    }px`;

    orc1LastFrameChange = timestamp;
  }

  // Continue the animation loop
  requestAnimationFrame((timestamp) => animateOrc1(timestamp, characterX));
}

// Function to initiate combat
 function initiateCombatWithOrc1(characterHitbox) {
  const COMBAT_RANGE = 100; // Adjust this value to set the combat initiation range

  // Calculate distance between character and orc
  const dx =
    characterHitbox.x + characterHitbox.width / 2 - (orc1.x + orc1.width / 2);
  const dy =
    characterHitbox.y + characterHitbox.height / 2 - (orc1.y + orc1.height / 2);
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Check if character is within combat range
  if (distance <= COMBAT_RANGE && !orc1.isInCombat) {
    orc1.isInCombat = true;
    orc1.currentAction = "attack";
    return true;
  } else if (distance > COMBAT_RANGE && orc1.isInCombat) {
    orc1.isInCombat = false;
    orc1.currentAction = "idle";
  }
  return false;
}

// Function to check collision between character and Orc1
 function checkCollisionWithOrc1(characterHitbox) {
  const orc1Hitbox = {
    x: orc1.x,
    y: orc1.y,
    width: orc1.width,
    height: orc1.height,
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

// Start the orc1 animation if orc1Element exists
if (orc1Element) {
  requestAnimationFrame((timestamp) => animateOrc1(timestamp, orc1.x));
}


export { checkCollisionWithOrc1, initiateCombatWithOrc1, animateOrc1 };