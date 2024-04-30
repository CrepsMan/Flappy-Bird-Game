// Constants for different device types
const isMobile = false;

// Declare variables with appropriate scoping
let board;
let context;
let bird;
let pipeArray = [];
let highScores = [];

// Board dimensions
const boardWidth = 360;
const boardHeight = 640;

// Bird dimensions and initial position
const birdWidth = 34;
const birdHeight = 24;
const birdX = boardWidth / 8;
const birdY = boardHeight / 2;

// Pipe dimensions and initial position
const pipeWidth = 64;
const pipeHeight = 512;
const pipeX = boardWidth;

// Physics constants
const gravity = 0.4;
let velocityX = -2;
let velocityY = 0;

// Game state variables
let gameOver = false;
let score = 0;

// Image resources
const birdImg = new Image();
birdImg.src = "./flappybird.png";
const topPipeImg = new Image();
topPipeImg.src = "./toppipe.png";
const bottomPipeImg = new Image();
bottomPipeImg.src = "./bottompipe.png";

// Function to start the game
function startGame() {
    console.log("startGame() called");
    // Hide start screen, show game screen
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
    document.getElementById("scoreBoard").style.display = "none"; // Hide high scores
    document.getElementById("board").style.backgroundImage = "url('flappybirdbg.png')"; // Show game background
    
    // Add event listeners for keyboard and touch input
    document.removeEventListener("keydown", moveBird);
    document.getElementById("board").removeEventListener("touchstart", moveBirdTouch);
    document.addEventListener("keydown", moveBird);
    document.getElementById("board").addEventListener("touchstart", moveBirdTouch);
    
    // Reset game state
    resetGame();
}

// Function to reset the game
function resetGame() {
    bird = { x: birdX, y: birdY, width: birdWidth, height: birdHeight };
    pipeArray = [];
    score = 0;
    gameOver = false;
    velocityY = 0;
    requestAnimationFrame(update);
    // Clear input field after saving
    document.getElementById("playerName").value = "";
    // Hide end screen, show start screen, display scoreboard
    document.getElementById("endScreen").style.display = "none";
    document.getElementById("scoreBoard").style.display = "block";
    document.getElementById("startScreen").style.display = "flex";
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("endScreen").innerHTML = "";
    console.log("Refreshing webpage after delay...");
    // Delay before refreshing the webpage
    setTimeout(() => { location.reload(); }, 1000);
}

// Function to save high scores and reset the game
function saveHighScores() {
    let playerName = document.getElementById("playerName").value.trim() || "Anonymous";
    highScores.push({ name: playerName, score: score });
    highScores.sort((a, b) => b.score - a.score);
    if (highScores.length > 10) highScores.pop();
    localStorage.setItem("highScores", JSON.stringify(highScores));
    console.log("Saved high scores to localStorage.");
    displayScores();
    resetGame();
}

// Function to load high scores
function loadHighScores() {
    let storedScores = localStorage.getItem("highScores");
    if (storedScores) highScores = JSON.parse(storedScores);
    displayScores();
}

// Function to display high scores
function displayScores() {
    let scoresDisplay = document.getElementById("scoresDisplay");
    if (!scoresDisplay) return console.error("Element with ID 'scoresDisplay' not found.");
    scoresDisplay.innerHTML = highScores.map(entry => `<li>${entry.name}: ${entry.score}</li>`).join('');
    scoresDisplay.style.display = "block";
}

// Initialize game on window load
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
    birdImg.onload = function() { context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height); };
    topPipeImg.onload = bottomPipeImg.onload = function() { document.getElementById("startButton").addEventListener("click", startGame); };
};

// Pipe spawn settings
let pipeSpawnCounter = 0;
const pipeSpawnDelay = 100;

// Main game loop
function update() {
    console.log("update function called");
    requestAnimationFrame(update);
    if (gameOver) {
        displayEndScores();
        return;
    }
    // Update bird position
    velocityY += gravity;
    bird.y += velocityY;
    // Update pipe positions
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        // Check for collision with pipes
        if (detectCollision(bird, pipe)) {
            gameOver = true;
            break;
        }
        // Increment score if bird passes pipe
        if (bird.x > pipe.x + pipe.width && !pipe.passed) {
            score += 0.5;
            pipe.passed = true;
        }
    }
    // Check for out of bounds
    if (bird.y > board.height || bird.y + bird.height < 0) gameOver = true;
    // Increment pipe spawn counter and spawn new pipes
    pipeSpawnCounter++;
    if (pipeSpawnCounter >= pipeSpawnDelay) {
        placePipes();
        pipeSpawnCounter = 0;
    }
    // Draw game elements
    draw();
}

// Function to draw game elements
function draw() {
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

// Function to place new pipes
function placePipes() {
    if (gameOver) return;
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;
    let topPipe = { img: topPipeImg, x: pipeX, y: randomPipeY, width: pipeWidth, height: pipeHeight, passed: false };
    let bottomPipe = { img: bottomPipeImg, x: pipeX, y: randomPipeY + pipeHeight + openingSpace, width: pipeWidth, height: pipeHeight, passed: false };
    pipeArray.push(topPipe, bottomPipe);
}

// Function to display end scores
function displayEndScores() {
    let endScreen = document.getElementById("endScreen");
    if (!endScreen) return console.error("Element with ID 'endScreen' not found.");
    endScreen.style.display = "block";
    let finalScore = document.getElementById("finalScore");
    if (!finalScore) return console.error("Element with ID 'finalScore' not found.");
    finalScore.textContent = score;
}

// Event listener for keyboard input
function moveBird(event) {
    console.log("Key pressed: " + event.code);
    if (event.code === "Space" && !gameOver) jump();
}

// Event listener for touch input
function moveBirdTouch(e) {
    e.preventDefault();
    jump();
}

// Function to handle bird jumping
function jump() {
    if (!gameOver) velocityY = -6;
    else resetGame();
}

// Function to detect collision between two objects
function detectCollision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
