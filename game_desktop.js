// Constants for different device types
const isMobile = false;

// Declare highScores only once
let highScores = [];

// Board
let board;
const boardWidth = 360;
const boardHeight = 640;
let context;

// Bird
const birdWidth = 34; // width/height ratio = 17/12
const birdHeight = 24;
const birdX = boardWidth / 8;
const birdY = boardHeight / 2;
let bird;

// Pipes
let pipeArray = [];
const pipeWidth = 64; // width/height ratio = 1/8
const pipeHeight = 512;
const pipeX = boardWidth;
const pipeY = 0;
let topPipeImg;
let bottomPipeImg;

// Physics
let velocityX = -2; // pipes moving left speed
let velocityY = 0; // Jump velocity
const gravity = 0.4;

let gameOver = false;
let score = 0;

// Function to initialize the game
function initializeGame() {
    // Load high scores
    loadHighScores();

    // Initialize canvas and context
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Create bird object
    bird = {
        x: birdX,
        y: birdY,
        width: birdWidth,
        height: birdHeight
    };

    // Load bird image
    const birdImg = new Image();
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };
    birdImg.src = "./flappybird.png";

    // Load top pipe image
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    // Load bottom pipe image
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // Add event listener for "Start Game" button click
    document.getElementById("startButton").addEventListener("click", startGame);
}

// Function to start the game
function startGame() {
    console.log("startGame() called");
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
    document.getElementById("scoreBoard").style.display = "none"; // Hide high scores
    document.getElementById("board").style.backgroundImage = "url('flappybirdbg.png')"; // Show game background
    document.removeEventListener("keydown", moveBird); // Remove existing event listeners
    document.getElementById("board").removeEventListener("touchstart", moveBirdTouch);
    document.addEventListener("keydown", moveBird);
    document.getElementById("board").addEventListener("touchstart", moveBirdTouch);
    // Initialize game state without instantly transitioning to game over screen
    resetGame();
}

// Function to display high scores
function displayScores() {
    const scoresDisplay = document.getElementById("scoresDisplay");
    if (scoresDisplay) {
        scoresDisplay.style.display = "block";
        scoresDisplay.innerHTML = "";
        highScores.forEach((entry, index) => {
            const li = document.createElement("li");
            li.textContent = entry.name + ": " + entry.score;
            scoresDisplay.appendChild(li);
        });
    } else {
        console.error("Element with ID 'scoresDisplay' not found.");
    }
}

// Function to reset the game
function resetGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
    velocityY = 0; // Reset jump velocity
    requestAnimationFrame(update);
    document.removeEventListener("keydown", moveBird);
    document.getElementById("board").removeEventListener("touchstart", moveBirdTouch);
    document.addEventListener("keydown", moveBird);
    document.getElementById("board").addEventListener("touchstart", moveBirdTouch);
    displayScores(); // Display high scores at the start of the game
}

// Function to save high scores and reset the game
function saveHighScores() {
    const playerName = document.getElementById("playerName").value.trim() || "Anonymous"; // Default name if not provided
    highScores.push({ name: playerName, score: score });
    highScores.sort((a, b) => b.score - a.score);
    if (highScores.length > 10) {
        highScores.pop();
    }

    localStorage.setItem("highScores", JSON.stringify(highScores));
    console.log("Saved high scores to localStorage.");

    displayScores();

    // Reset the game and display start screen
    resetGame();
    document.getElementById("playerName").value = ""; // Clear input field after saving
    document.getElementById("endScreen").style.display = "none"; // Hide end screen
    document.getElementById("scoreBoard").style.display = "block"; // Show scoreboard
    document.getElementById("startScreen").style.display = "flex"; // Show start screen
    document.getElementById("gameScreen").style.display = "none"; // Hide game screen
    document.getElementById("endScreen").innerHTML = ""; // Clear end screen content

    console.log("Refreshing webpage after delay...");
    // Delay before refreshing the webpage
    setTimeout(() => {
        location.reload(); // Refresh the webpage after a delay
    }, 1000); // Adjust the delay time as needed (in milliseconds)
}

// Function to load high scores
function loadHighScores() {
    const storedScores = localStorage.getItem("highScores");
    if (storedScores) {
        highScores = JSON.parse(storedScores);
    }
    displayScores(); // Call displayScores after loading high scores
}

// Event listener for spacebar key to make the bird jump
function moveBird(event) {
    console.log("Key pressed: " + event.code);
    if (event.code === "Space" && !gameOver) { // Only respond to spacebar key
        jump();
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

// Function to update game state
function update() {
    console.log("update function called");
    requestAnimationFrame(update);
    if (gameOver) {
        // Game over logic
        displayEndScores(); // Display high scores
        return;
    }

    // Update bird position
    velocityY += gravity;
    bird.y += velocityY;

    // Update pipe positions
    for (let i = 0; i < pipeArray.length; i++) {
        const pipe = pipeArray[i];
        pipe.x += velocityX;

        // Check for collision with pipes
        if (detectCollision(bird, pipe)) {
            gameOver = true;
            break; // Exit loop early since the game is over
        }

        // Check if bird passes the pipe to increment score
        if (bird.x > pipe.x + pipe.width && !pipe.passed) {
            score += 0.5;
            pipe.passed = true;
        }
    }

    // Check for out of bounds
    if (bird.y > board.height || bird.y + bird.height < 0) {
        gameOver = true;
    }

    // Increment pipe spawn counter
    pipeSpawnCounter++;

    // Spawn new pipes if counter reaches delay
    if (pipeSpawnCounter >= pipeSpawnDelay) {
        placePipes();
        pipeSpawnCounter = 0; // Reset the counter
    }

    // Drawing logic
    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Drawing pipes
    for (let i = 0; i < pipeArray.length; i++) {
        const pipe = pipeArray[i];
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    }

    // Drawing score
    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.fillText(score, 10, 30);
}

// Function to display high scores at the end of the game
function displayEndScores() {
    const endScreen = document.getElementById("endScreen");
    if (endScreen) {
        endScreen.style.display = "block";
        const finalScore = document.getElementById("finalScore");
        if (finalScore) {
            finalScore.textContent = score;
        } else {
            console.error("Element with ID 'finalScore' not found.");
        }
    } else {
        console.error("Element with ID 'endScreen' not found.");
    }
}

// Function to restart the game
function restartGame() {
    document.getElementById("endScreen").style.display = "none";
    resetGame();
    startGame();
}

// Function to place pipes
function placePipes() {
    if (gameOver) {
        return;
    }

    const randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    const openingSpace = board.height / 4;

    const topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    const bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

// Initialize the game when the window loads
window.onload = initializeGame;
