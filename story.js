import { pauseGame, resumeGame } from "./script.js";

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
          if (choice.node === "forestEntrance") {
            storyContainer.style.display = "none";
            resumeGame();
          } else {
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
