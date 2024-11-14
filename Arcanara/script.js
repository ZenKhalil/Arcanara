// Opret et player-objekt til at gemme position
const player = {
  x: 0, // startposition i x-aksen
  y: 0, // startposition i y-aksen
};

// Funktion til at vise figuren på den nuværende position
function displayPlayer() {
  const playerElement = document.getElementById("player");
  playerElement.style.transform = `translate(${player.x}px, ${player.y}px)`;
}

// Startposition
displayPlayer();

// Eksperimentér med at ændre positioner manuelt
player.x = 64; // fx flytte til 64px til højre
player.y = 64; // fx flytte til 64px nedad
displayPlayer();
