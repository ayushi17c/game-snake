const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const homeScreen = document.querySelector(".home-screen");
const gameOverDiv = document.getElementById("gameOver");
const highScoreEl = document.getElementById("highScore");
const lastPlayerEl = document.getElementById("lastPlayer");
const eatSound = new Audio("eat.mp3"); // Sound for eating food
const gameOverSound = new Audio("gameover.mp3"); // Sound for game over
const startgameSound = new Audio("startgamee.mp3"); // Sound for starting the game

let snake, food, dx, dy, score, interval, playerName;
let isPaused = false;

window.onload = () => {
  const highScore = localStorage.getItem("highScore") || 0;
  const lastPlayer = localStorage.getItem("lastPlayer") || "-";

  highScoreEl.textContent = highScore;
  lastPlayerEl.textContent = lastPlayer;

  document.getElementById("gameScreen").style.display = "none"; // Ensure the game screen is hidden
  document.querySelector(".home-screen").style.display = "block"; // Ensure the home screen is visible
  document.getElementById("gameOver").style.display = "none"; // Ensure the game over screen is hidden
};

function startGame() {
  startgameSound.currentTime = 0; // Reset the audio to the beginning
  startgameSound.play().catch((error) => {
    console.error("Audio playback failed:", error);
  });
  playerName = document.getElementById("playerName").value.trim();
  if (!playerName) {
    alert("Please enter your name!");
    return;
  }

  const difficulty = document.getElementById("difficulty").value;
  let speed = 150;
  if (difficulty === "medium") speed = 100;
  else if (difficulty === "hard") speed = 75;

  document.querySelector(".home-screen").style.display = "none"; // Hide the home screen
  document.getElementById("gameScreen").style.display = "flex"; // Show the game screen

  localStorage.setItem("lastPlayer", playerName);
  lastPlayerEl.textContent = playerName;

  resetGame();
  draw();
  interval = setInterval(update, speed); // Start the game loop
}

function goBackHome() {
  document.getElementById("gameScreen").style.display = "none"; // Hide the game screen
  document.querySelector(".home-screen").style.display = "block"; // Show the home screen
  document.getElementById("gameOver").style.display = "none"; // Hide the game over screen
  clearInterval(interval); // Stop the game loop
}

function resetGame() {
  snake = [{ x: 200, y: 200 }];
  dx = 20;
  dy = 0;
  food = randomFood();
  score = 0;
  document.getElementById("currentScore").textContent = score;
}

function update() {
  if (isPaused) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    endGame();
    return;
  }

  for (let part of snake) {
    if (part.x === head.x && part.y === head.y) {
      endGame();
      return;
    }
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    food = randomFood();
    document.getElementById("currentScore").textContent = score;
    eatSound.play();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  // Create a gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#12f667"); // Start color (blue)
  gradient.addColorStop(1, "#2a5298"); // End color (darker blue)

  // Fill the canvas with the gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add shadow effect for the snake
  ctx.shadowColor = "rgba(64, 229, 64, 0.5)";
  ctx.shadowBlur = 10;

  // Draw the snake
  for (let i = 0; i < snake.length; i++) {
    const part = snake[i];

    if (i === 0) {
      // Draw the head with a different style (mouth)
      ctx.fillStyle = "black"; // Head color
      ctx.beginPath();
      ctx.arc(part.x + 14, part.y + 12, 12, 0, Math.PI * 2); // Draw the head as a circle
      ctx.fill();

      // Draw the mouth as a triangle
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.moveTo(part.x + 9, part.y + 6); // Top point of the triangle
      ctx.lineTo(part.x + 6, part.y + 12); // Bottom-left point
      ctx.lineTo(part.x + 12, part.y + 12); // Bottom-right point
      ctx.closePath();
      ctx.fill();
    } else {
      // Draw the body with gradient and rounded corners
      const gradient = ctx.createLinearGradient(part.x, part.y, part.x + 18, part.y + 18);
      gradient.addColorStop(0, "brown");
      gradient.addColorStop(1, "black");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(part.x + 14, part.y + 12, 12, 0, Math.PI * 2); // Draw a circle for each segment
      ctx.fill();
    }
  }

  // Reset shadow
  ctx.shadowBlur = 0;

  // Draw the food as a circle
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(food.x + 12, food.y + 12, 12, 0, Math.PI * 2); // Draw food as a circle
  ctx.fill();
}
function randomFood() {
  const x = Math.floor(Math.random() * (canvas.width / 20)) * 20;
  const y = Math.floor(Math.random() * (canvas.height / 20)) * 20;
  return { x, y };
}

function endGame() {
  clearInterval(interval);
  gameOverSound.play();
  document.getElementById("gameScreen").style.display = "none";
  document.getElementById("gameOver").style.display = "block";
  document.getElementById("finalScore").textContent = score;

  const highScore = localStorage.getItem("highScore") || 0;
  if (score > highScore) {
    localStorage.setItem("highScore", score);
    document.getElementById("highScore").textContent = score;
  }
}

function restartGame() {
  document.getElementById("gameOver").style.display = "none";
  document.getElementById("gameScreen").style.display = "flex";
  startGame();
}

document.getElementById("pauseBtn").addEventListener("click", () => {
  isPaused = !isPaused;
  document.getElementById("pauseBtn").textContent = isPaused ? "Resume" : "Pause";
});
// Handle keyboard input for snake movement
document.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    e.preventDefault();
    isPaused = !isPaused;
    document.getElementById("pauseBtn").textContent = isPaused ? "Resume" : "Pause";
    return;
  }

  switch (e.key) {
    case "ArrowUp":
      if (dy === 0) { // Prevent reversing direction
        dx = 0;
        dy = -20;
      }
      break;
    case "ArrowDown":
      if (dy === 0) { // Prevent reversing direction
        dx = 0;
        dy = 20;
      }
      break;
    case "ArrowLeft":
      if (dx === 0) { // Prevent reversing direction
        dx = -20;
        dy = 0;
      }
      break;
    case "ArrowRight":
      if (dx === 0) { // Prevent reversing direction
        dx = 20;
        dy = 0;
      }
      break;
  }
});