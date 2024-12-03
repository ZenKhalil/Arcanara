import { pauseGame, resumeGame } from "./script.js";

// Story nodes
export const nodes = {
  start: {
    id: "start",
    title: "Welcome to Arcanara",
    description: "You find yourself at the entrance of a mysterious forest...",
    choices: [
      { name: "Enter the forest", node: "forestEntrance" },
      { name: "Return to the village", node: "village" },
    ],
  },
  // ... other nodes
};

// Function to display a node
export function displayNode(nodeId) {
  const node = nodes[nodeId];

  // Pause the game when displaying a story node
  pauseGame();

  // Get the story container and clear existing content
  const storyContainer = document.getElementById("story-container");
  storyContainer.innerHTML = "";

  // Show the story container
  storyContainer.style.display = "block";

  // Create and append the title
  const titleElement = document.createElement("h2");
  titleElement.textContent = node.title;
  storyContainer.appendChild(titleElement);

  // Create and append the description
  const descriptionElement = document.createElement("p");
  descriptionElement.textContent = node.description;
  storyContainer.appendChild(descriptionElement);

  // Create and append choice buttons
  if (node.choices && node.choices.length > 0) {
    node.choices.forEach((choice) => {
      const button = document.createElement("button");
      button.textContent = choice.name;
      button.addEventListener("click", () => {
        // Disable all buttons to prevent multiple clicks
        storyContainer
          .querySelectorAll("button")
          .forEach((btn) => (btn.disabled = true));
        // Display the next node
        displayNode(choice.node);
      });
      storyContainer.appendChild(button);
    });
  } else {
    // End of story handling
    const message = document.createElement("p");
    message.textContent = "The End.";

    const continueButton = document.createElement("button");
    continueButton.textContent = "Continue Game";
    continueButton.addEventListener("click", () => {
      // Hide the story container
      storyContainer.style.display = "none";
      // Resume the game
      resumeGame();
    });

    storyContainer.appendChild(message);
    storyContainer.appendChild(continueButton);
  }
}
