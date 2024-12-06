import { pauseGame, resumeGame } from "./script.js";

// Audio management for different areas
const backgroundSounds = {
  forest: new Audio("/BackgroundSound/ForestSound.mp3"),
  village: new Audio("/BackgroundSound/VillageSound.mp3"),
};

// Configure all audio elements
Object.values(backgroundSounds).forEach((sound) => {
  sound.loop = true;
  sound.volume = 0.5;
});

let currentArea = null;
let isPlaying = false;

export function playAreaSound(area) {
  // Don't start playing if we're already playing this area's sound
  if (currentArea === area && isPlaying) return;

  // Stop current sound if playing
  if (currentArea) {
    backgroundSounds[currentArea].pause();
    backgroundSounds[currentArea].currentTime = 0;
  }

  currentArea = area;
  isPlaying = true;

  try {
    backgroundSounds[area].play().catch((e) => {
      console.error("Audio playback failed:", e);
      isPlaying = false;
    });
  } catch (e) {
    console.error("Audio playback error:", e);
    isPlaying = false;
  }
}

export function stopCurrentSound() {
  if (currentArea) {
    backgroundSounds[currentArea].pause();
    backgroundSounds[currentArea].currentTime = 0;
    isPlaying = false;
    currentArea = null;
  }
}

// Story nodes
export const nodes = {
  start: {
    id: "start",
    title: "Welcome to Arcanara",
    description:
      "You find yourself at a crossroads. Choose your path wisely...",
    image: "/images/ForestEntrance.png",
    choices: [
      {
        name: "Enter the forest",
        node: "forestEntrance",
        enabled: true,
      },
      {
        name: "Return to the village",
        node: "village",
        enabled: false,
      },
    ],
  },
  forestEntrance: {
    id: "forestEntrance",
    title: "Forest Entrance",
    description: "The dense forest beckons. Adventure awaits...",
    choices: [], // Empty choices will trigger game continuation
  },
  village: {
    id: "village",
    title: "Village",
    description: "The village path leads to a cozy settlement...",
    image: "/images/VillageEntrance.png",
    choices: [], // Empty for now until village implementation
  },
};

// Function to display a node
export function displayNode(nodeId) {
  const node = nodes[nodeId];
  pauseGame();

  // Stop sounds if returning to start
  if (nodeId === "start") {
    stopCurrentSound();
  }

  const storyContainer = document.getElementById("story-container");
  storyContainer.innerHTML = "";
  storyContainer.style.display = "block";

  // Create wrapper for better layout
  const contentWrapper = document.createElement("div");
  contentWrapper.style.cssText =
    "display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px;";
  storyContainer.appendChild(contentWrapper);

  // Add image if present
  if (node.image) {
    const imageElement = document.createElement("img");
    imageElement.src = node.image;
    imageElement.style.cssText =
      "max-width: 600px; width: 100%; height: auto; border-radius: 8px;";
    contentWrapper.appendChild(imageElement);
  }

  // Add title
  const titleElement = document.createElement("h2");
  titleElement.textContent = node.title;
  titleElement.style.cssText = "font-size: 24px; margin: 0;";
  contentWrapper.appendChild(titleElement);

  // Add description
  const descriptionElement = document.createElement("p");
  descriptionElement.textContent = node.description;
  descriptionElement.style.cssText = "text-align: center; margin: 0;";
  contentWrapper.appendChild(descriptionElement);

  // Create button container
  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText =
    "display: flex; gap: 10px; justify-content: center;";
  contentWrapper.appendChild(buttonContainer);

  if (node.choices && node.choices.length > 0) {
    node.choices.forEach((choice) => {
      const button = document.createElement("button");
      button.textContent = choice.name;
      button.disabled = !choice.enabled;
      button.style.cssText = `
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        background-color: ${choice.enabled ? "#4CAF50" : "#cccccc"};
        color: white;
        cursor: ${choice.enabled ? "pointer" : "not-allowed"};
        transition: background-color 0.3s;
      `;

      if (choice.enabled) {
        button.addEventListener("mouseover", () => {
          button.style.backgroundColor = "#45a049";
        });
        button.addEventListener("mouseout", () => {
          button.style.backgroundColor = "#4CAF50";
        });
        button.addEventListener("click", () => {
          storyContainer
            .querySelectorAll("button")
            .forEach((btn) => (btn.disabled = true));

          // Play sound only after choice is made
          if (choice.node === "forestEntrance") {
            playAreaSound("forest");
            storyContainer.style.display = "none";
            resumeGame();
          } else if (choice.node === "village") {
            playAreaSound("village");
            displayNode(choice.node);
          }
        });
      }

      buttonContainer.appendChild(button);
    });
  } else {
    const continueButton = document.createElement("button");
    continueButton.textContent = "Continue Game";
    continueButton.style.cssText = `
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      background-color: #4CAF50;
      color: white;
      cursor: pointer;
      transition: background-color 0.3s;
    `;

    continueButton.addEventListener("mouseover", () => {
      continueButton.style.backgroundColor = "#45a049";
    });
    continueButton.addEventListener("mouseout", () => {
      continueButton.style.backgroundColor = "#4CAF50";
    });
    continueButton.addEventListener("click", () => {
      storyContainer.style.display = "none";
      resumeGame();
    });

    buttonContainer.appendChild(continueButton);
  }
}

// Handle sound resumption
export function handleGameResume() {
  if (currentArea && !isPlaying) {
    playAreaSound(currentArea);
  }
}
