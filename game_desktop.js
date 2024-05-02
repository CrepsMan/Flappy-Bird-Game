// Constants
const boardWidth = 360;
const boardHeight = 640;
const birdWidth = 34;
const birdHeight = 24;
const pipeWidth = 64;
const pipeHeight = 512;
const pipeX = boardWidth;
const gravity = 0.4;
let velocityX = -2;
let velocityY = 0;

// Variables
let board;
let context;
let bird;
let pipeArray = [];
let highScores = [];
let gameOver = false;
let score = 0;

// Images
const birdImg = new Image();
birdImg.src = "./flappybird.png";
const topPipeImg = new Image();
topPipeImg.src = "./toppipe.png";
const bottomPipeImg = new Image();
bottomPipeImg.src = "./bottompipe.png";

// Event listeners
window.onload = function() {
    // Load high scores
    loadHighScores();

    // Attach event listener for the "Start Game" button
    document.getElementById("startButton").addEventListener("click", startGame);

    // Attach event listener for the "View High Scores" button
    document.getElementById("viewScoresButton").addEventListener("click", displayHighScores);

    // Get canvas context
    board = document.getElementById("board");
    context = board.getContext("2d");

    // Load images
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    topPipeImg.onload = bottomPipeImg.onload = function() {
        document.getElementById("startButton").addEventListener("click", startGame);
    };
};

function startGame() {
    console.log("Game started");
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
}

// Reset the game
function resetGame() {
    bird = { x: boardWidth / 8, y: boardHeight / 2, width: birdWidth, height: birdHeight };
    pipeArray = [];
    score = 0;
    gameOver = false;
    velocityY = 0;
    requestAnimationFrame(update);
}

// Main game loop
function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        displayEndScores();
        return;
    }
    velocityY += gravity;
    bird.y += velocityY;
    // Other game logic...
}

// Function to display end scores
function displayEndScores() {
    document.getElementById("endScreen").style.display = "block";
    document.getElementById("finalScore").textContent = score;
}

// Function to display high scores
function displayHighScores() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("endScreen").style.display = "none";
    document.getElementById("scoresDisplay").style.display = "block";
    populateHighScores();
}

// Function to populate high scores
function populateHighScores() {
    let highScoresList = document.getElementById("highScoresList");
    highScoresList.innerHTML = "";
    highScores.forEach((entry, index) => {
        let li = document.createElement("li");
        li.textContent = entry.name + ": " + entry.score;
        highScoresList.appendChild(li);
    });
}

// Other game functions...

// Function to handle bird jumping
function jump() {
    if (!gameOver) {
        velocityY = -6;
    } else {
        resetGame(); // Reset the game after game over
    }
}

// Event listener for keyboard input
function moveBird(event) {
    console.log("Key pressed: " + event.code);
    if (event.code === "Space") { // Only respond to spacebar key
        if (!gameOver) {
            jump();
        }
    }
}

// Event listener for touch input
function moveBirdTouch(e) {
    e.preventDefault(); // Prevent default touch behavior (like scrolling)
    jump();
}

// Function to place new pipes
function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

// Function to detect collision between two objects
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

// Function to save high scores and reset the game
function saveHighScores() {
    let playerName = document.getElementById("playerName").value;
    if (playerName.trim() === "") {
        playerName = "Anonymous"; // Set default name if no name is provided
    }
    highScores.push({ name: playerName, score: score });
    highScores.sort((a, b) => b.score - a.score);
    if (highScores.length > 10) {
        highScores.pop();
    }

    localStorage.setItem("highScores", JSON.stringify(highScores));
    console.log("Saved high scores to localStorage.");

    // Reset the game and display start screen
    resetGame();
    document.getElementById("playerName").value = ""; // Clear input field after saving
}

// Function to load high scores
function loadHighScores() {
    let storedScores = localStorage.getItem("highScores");
    if (storedScores) {
        highScores = JSON.parse(storedScores);
    }
}
