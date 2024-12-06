let playerHealth = 4;
let isGameOver = false;
let lastHitTime = 0;
const INVULNERABILITY_PERIOD = 500;

// Create modal immediately instead of waiting for DOMContentLoaded
const gameOverModal = document.createElement("div");
gameOverModal.id = "game-over-modal";
gameOverModal.className = "modal hidden";
gameOverModal.innerHTML = `
    <div class="modal-content">
        <h2>Game Over</h2>
        <p>You have been defeated!</p>
        <button id="try-again-button" class="menu-button">Try Again</button>
    </div>
`;
document.body.appendChild(gameOverModal);

// Add event listener for try again button
gameOverModal
  .querySelector("#try-again-button")
  ?.addEventListener("click", () => {
    gameOverModal.classList.add("hidden");
    resetPlayerHealth();
    window.location.reload();
  });

export function handlePlayerHit() {
  if (isGameOver) return; // Don't process hits if game is over

  const currentTime = Date.now();

  if (currentTime - lastHitTime < INVULNERABILITY_PERIOD) {
    console.log("Player in invulnerability period");
    return;
  }

  console.log("Player hit! Current health:", playerHealth);

  lastHitTime = currentTime;
  playerHealth--;

  // Visual feedback
  const character = document.getElementById("character");
  if (character) {
    character.style.animation = "damage-flash 0.5s";
    setTimeout(() => {
      character.style.animation = "";
    }, 500);
  }

  console.log("Player health after hit:", playerHealth);

  if (playerHealth <= 0) {
    console.log("Triggering game over...");
    triggerGameOver();
  }
}

export function resetPlayerHealth() {
  playerHealth = 4;
  isGameOver = false;
  lastHitTime = 0;
  console.log("Health reset, new health:", playerHealth);
}

export function getPlayerHealth() {
  return playerHealth;
}

export function isGameOverState() {
  return isGameOver;
}

function triggerGameOver() {
  isGameOver = true;
  console.log("Game Over State triggered");

  const modal = document.getElementById("game-over-modal");
  if (modal) {
    console.log("Showing game over modal");
    modal.classList.remove("hidden");
  } else {
    console.error("Game over modal not found!");
  }
}
