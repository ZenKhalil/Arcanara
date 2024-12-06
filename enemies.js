import { handlePlayerHit, isGameOverState } from "./combat.js";

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
  isInCombat: false,
  facing: "front",
  currentAction: "idle",
  lastAttackTime: 0,
  attackCooldown: 800, // Reduced from 1000 to make attacks more frequent
  isAttacking: false,
  health: 3,
  isDead: false,
};

// Animation parameters [keep existing constants]
const ORC1_IDLE_COLS = 4;
const ORC1_ATTACK_COLS = 4;
const ORC1_FRAME_WIDTH = 96;
const ORC1_FRAME_HEIGHT = 96;
const ORC1_ANIMATION_SPEED = 200;
const ORC1_ATTACK_SPEED = 150;

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

// Add function to handle orc getting hit
 function handleOrcHit() {
  if (orc1.isDead) return;

  orc1.health--;
  console.log("Orc hit! Health remaining:", orc1.health);

  // Visual feedback
  if (orc1Element) {
    orc1Element.style.animation = "damage-flash 0.5s";
    setTimeout(() => {
      orc1Element.style.animation = "";
    }, 500);
  }

  if (orc1.health <= 0) {
    orc1.isDead = true;
    orc1.currentAction = "idle";
    console.log("Orc defeated!");

    // Create and show victory alert
    const victoryAlert = document.createElement("div");
    victoryAlert.className = "modal";
    victoryAlert.innerHTML = `
      <div class="modal-content">
        <h2>Victory!</h2>
        <p>You have defeated the orc!</p>
        <button class="menu-button" onclick="this.parentElement.parentElement.remove()">Continue</button>
      </div>
    `;
    document.body.appendChild(victoryAlert);

    // Hide the orc
    if (orc1Element) {
      orc1Element.style.display = "none";
    }
  }
}

function updateOrc1Direction(characterX, characterY) {
  if (orc1.isDead) return; // Don't update if dead

  const DIRECTION_CHANGE_RANGE = 150;
  const distanceX = characterX - orc1.x;
  const distanceY = characterY - orc1.y;
  const absDistanceX = Math.abs(distanceX);
  const absDistanceY = Math.abs(distanceY);
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  if (distance <= DIRECTION_CHANGE_RANGE) {
    if (absDistanceX > absDistanceY) {
      orc1.facing = distanceX < 0 ? "left" : "right";
    } else {
      orc1.facing = distanceY < 0 ? "back" : "front";
    }
  } else {
    orc1.facing = "front";
  }
}

// [keep getDirectionRow function the same]
function getDirectionRow() {
  switch (orc1.facing) {
    case "front":
      return 0;
    case "back":
      return 1;
    case "left":
      return 2;
    case "right":
      return 3;
    default:
      return 0;
  }
}

function checkAttackHit(characterHitbox) {
  if (orc1.isDead) return false;

  if (
    orc1.currentAction === "attack" &&
    (orc1CurrentFrame === 1 || orc1CurrentFrame === 2)
  ) {
    const attackRange = 50; // Increased from 40 to make attacks slightly more dangerous
    let attackHitbox = {
      x: orc1.x,
      y: orc1.y,
      width: orc1.width,
      height: orc1.height,
    };

    // Adjust hitbox based on facing direction with improved ranges
    switch (orc1.facing) {
      case "left":
        attackHitbox.x -= attackRange;
        attackHitbox.width += attackRange * 0.7; // Slightly reduced side attack width
        break;
      case "right":
        attackHitbox.width += attackRange * 0.7;
        break;
      case "back":
        attackHitbox.y -= attackRange;
        attackHitbox.height += attackRange * 0.8;
        break;
      case "front":
        attackHitbox.height += attackRange * 0.8;
        break;
    }

    return checkCollision(characterHitbox, attackHitbox);
  }
  return false;
}
// [keep checkCollision function the same]
function checkCollision(box1, box2) {
  return (
    box1.x < box2.x + box2.width &&
    box1.x + box1.width > box2.x &&
    box1.y < box2.y + box2.height &&
    box1.y + box1.height > box2.y
  );
}

function animateOrc1(timestamp, characterX, characterY) {
  if (!orc1Element || isGameOverState() || orc1.isDead) return;

  if (!orc1LastFrameChange) {
    orc1LastFrameChange = timestamp;
  }

  // Create character hitbox for combat checks
  const characterHitbox = {
    x: characterX + DISPLAY_FRAME_WIDTH * 0.2,
    y: characterY + DISPLAY_FRAME_HEIGHT * 0.6,
    width: DISPLAY_FRAME_WIDTH * 0.6,
    height: DISPLAY_FRAME_HEIGHT * 0.3,
  };

  // Always check for combat, regardless of player movement
  initiateCombatWithOrc1(characterHitbox);
  updateOrc1Direction(characterX, characterY);

  const elapsed = timestamp - orc1LastFrameChange;
  const animationSpeed =
    orc1.currentAction === "attack" ? ORC1_ATTACK_SPEED : ORC1_ANIMATION_SPEED;

  if (elapsed > animationSpeed) {
    const maxFrames =
      orc1.currentAction === "attack" ? ORC1_ATTACK_COLS : ORC1_IDLE_COLS;
    orc1CurrentFrame = (orc1CurrentFrame + 1) % maxFrames;

    // If we complete an attack animation, reset to idle
    if (orc1.currentAction === "attack" && orc1CurrentFrame === 0) {
      orc1.isAttacking = false;
      orc1.currentAction = "idle";
      // Immediately check if we should start another attack
      if (orc1.isInCombat) {
        const currentTime = Date.now();
        if (currentTime - orc1.lastAttackTime >= orc1.attackCooldown) {
          orc1.currentAction = "attack";
          orc1.isAttacking = true;
          orc1.lastAttackTime = currentTime;
          orc1CurrentFrame = 0;
        }
      }
    }

    const directionRow = getDirectionRow();

    if (orc1.currentAction === "attack") {
      orc1Element.style.backgroundImage =
        'url("./images/orc1_attack_full.png")';
      orc1Element.style.backgroundSize = `${ATTACK_SHEET_WIDTH}px ${ATTACK_SHEET_HEIGHT}px`;

      const scaledFrameWidth = ATTACK_SHEET_WIDTH / ORC1_ATTACK_COLS;
      const yOffset = directionRow * (ATTACK_SHEET_HEIGHT / 4);
      orc1Element.style.backgroundPosition = `-${
        orc1CurrentFrame * scaledFrameWidth
      }px -${yOffset}px`;

      // Check for hits during attack frames
      if (
        (orc1CurrentFrame === 1 || orc1CurrentFrame === 2) &&
        orc1.isAttacking
      ) {
        if (checkAttackHit(characterHitbox)) {
          handlePlayerHit();
        }
      }
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
}


function initiateCombatWithOrc1(characterHitbox) {
  if (isGameOverState() || orc1.isDead) return false;

  const COMBAT_RANGE = 100;
  const currentTime = Date.now();

  const dx =
    characterHitbox.x + characterHitbox.width / 2 - (orc1.x + orc1.width / 2);
  const dy =
    characterHitbox.y + characterHitbox.height / 2 - (orc1.y + orc1.height / 2);
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance <= COMBAT_RANGE) {
    if (!orc1.isInCombat) {
      orc1.isInCombat = true;
      console.log("Entering combat");
    }

    // Start attack if not attacking and cooldown has passed
    if (
      !orc1.isAttacking &&
      currentTime - orc1.lastAttackTime >= orc1.attackCooldown
    ) {
      orc1.currentAction = "attack";
      orc1.isAttacking = true;
      orc1.lastAttackTime = currentTime;
      orc1CurrentFrame = 0;
      console.log("Starting new attack");
    }

    return true;
  } else {
    if (orc1.isInCombat) {
      console.log("Exiting combat");
      orc1.isInCombat = false;
      orc1.currentAction = "idle";
    }
    return false;
  }
}


// [keep other functions the same]
function checkCollisionWithOrc1(characterHitbox) {
  if (orc1.isDead) return false; // Don't collide if dead

  const orc1Hitbox = {
    x: orc1.x + orc1.width * 0.2,
    y: orc1.y + orc1.height * 0.3,
    width: orc1.width * 0.6,
    height: orc1.height * 0.5,
  };

  return checkCollision(characterHitbox, orc1Hitbox);
}

function updateOrc1Position(newX, newY) {
  if (orc1.isDead) return; // Don't update if dead

  orc1.x = newX;
  orc1.y = newY;
  if (orc1Element) {
    orc1Element.style.left = `${orc1.x}px`;
    orc1Element.style.top = `${orc1.y}px`;
  }
}

if (orc1Element) {
  requestAnimationFrame(animateOrc1);
}

export {
  checkCollisionWithOrc1,
  initiateCombatWithOrc1,
  animateOrc1,
  updateOrc1Position,
  handleOrcHit, // Add this export
};

// And add this function to check player attacks against orc:
export function checkPlayerAttackHit(playerHitbox) {
  if (orc1.isDead) return false;

  const orcHitbox = {
    x: orc1.x + orc1.width * 0.2,
    y: orc1.y + orc1.height * 0.3,
    width: orc1.width * 0.6,
    height: orc1.height * 0.5,
  };

  const hit = checkCollision(playerHitbox, orcHitbox);
  if (hit) {
    console.log("Player hit orc!");
    handleOrcHit();
  }
  return hit;
}