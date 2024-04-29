// Constants for different device types
const isMobile = false;

let highScores = [];

// Initialize board dimensions
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Initialize bird properties
let bird = {
    x: boardWidth / 8,
    y: boardHeight / 2,
    width: 34,
    height: 24
};

// Initialize pipe properties
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;
let topPipeImg;
let bottomPipeImg;

// Initialize physics parameters
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;

// Function to start the game
function startGame() {
    console.log("startGame() called");
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
    document.getElementById("scoreBoard").style.display = "none";
    document.getElementById("board").style.backgroundImage = "url('flappybirdbg.png')";
    document.removeEventListener("keydown", moveBird);
    document.getElementById("board").removeEventListener("touchstart", moveBirdTouch);
    document.addEventListener("keydown", moveBird);
    document.getElementById("board").addEventListener("touchstart", moveBirdTouch);
    resetGame();
}

// Function to display scores
function displayScores() {
    let scoresDisplay = document.getElementById("scoresDisplay");
    scoresDisplay.innerHTML = "";
    highScores.forEach((entry, index) => {
        let li = document.createElement("li");
        li.textContent = entry.name + ": " + entry.score;
        scoresDisplay.appendChild(li);
    });
    scoresDisplay.style.display = "block"; // Ensure scores display is visible
}

// Function to reset the game
function resetGame() {
    bird.y = boardHeight / 2;
    pipeArray = [];
    score = 0;
    gameOver = false;
    velocityY = 0;
    requestAnimationFrame(update);
    document.removeEventListener("keydown", moveBird);
    document.getElementById("board").removeEventListener("touchstart", moveBirdTouch);
    document.addEventListener("keydown", moveBird);
    document.getElementById("board").addEventListener("touchstart", moveBirdTouch);
    displayScores();
}

// Function to save high scores and reset the game
function saveHighScores() {
    let playerName = document.getElementById("playerName").value;
    if (playerName.trim() === "") {
        playerName = "Anonymous";
    }
    highScores.push({ name: playerName, score: score });
    highScores.sort((a, b) => b.score - a.score);
    if (highScores.length > 10) {
        highScores.pop();
    }

    localStorage.setItem("highScores", JSON.stringify(highScores));
    console.log("Saved high scores to localStorage.");

    displayScores();

    resetGame();

    document.getElementById("playerName").value = "";
    document.getElementById("endScreen").style.display = "none";
    document.getElementById("scoreBoard").style.display = "block";
    document.getElementById("startScreen").style.display = "flex";
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("endScreen").innerHTML = "";

    console.log("Refreshing webpage after delay...");
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// Function to load high scores
function loadHighScores() {
    let storedScores = localStorage.getItem("highScores");
    if (storedScores) {
        highScores = JSON.parse(storedScores);
    }
    displayScores();
}

// Function to initialize game elements and event listeners
window.onload = function() {
    loadHighScores();
    document.getElementById("startScreen").style.display = "block";
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("endScreen").style.display = "none";
    document.getElementById("scoreBoard").style.display = "block";
    document.getElementById("saveButton").addEventListener("click", saveHighScores);

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }
    birdImg.src = "./flappybird.png";

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    document.getElementById("startButton").addEventListener("click", startGame);
    document.addEventListener("keydown", moveBird);
}

// Game loop function
function update() {
    console.log("update function called");
    requestAnimationFrame(update);
    if (gameOver) {
        displayEndScores();
        return;
    }

    velocityY += gravity;
    bird.y += velocityY;

    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            break;
        }

        if (bird.x > pipe.x + pipe.width && !pipe.passed) {
            score += 0.5;
            pipe.passed = true;
        }
    }

    if (bird.y > boardHeight || bird.y + bird.height < 0) {
        gameOver = true;
    }

    pipeSpawnCounter++;

    if (pipeSpawnCounter >= pipeSpawnDelay) {
        placePipes();
        pipeSpawnCounter = 0;
    }

    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    }

    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.fillText(score, 10, 30);
}

// Additional functions for game mechanics (e.g., jump, collision detection)...

// Event listener for spacebar key to make the bird jump
function moveBird(event) {
    console.log("Key pressed: " + event.code);
    if (event.code === "Space") { // Only respond to spacebar key
        if (!gameOver) {
            jump();
        }
    }
}

// Event listener for touch input to make the bird jump
function moveBirdTouch(e) {
    e.preventDefault(); // Prevent default touch behavior (like scrolling)
    jump();
}

// Function to handle bird jumping
function jump() {
    if (!gameOver) {
        velocityY = -6; // Adjusted jump velocity
    } else {
        resetGame(); // Reset the game after game over
    }
}

// Function to detect collision between two objects
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
