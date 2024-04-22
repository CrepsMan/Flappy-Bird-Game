// Define constants
const MS_PER_UPDATE = 16; // 60 FPS

// Variables
let accumulatedTime;
let lastTime;
let lastFrameTime;
let gameStarted = false;
let gameOver = false;
let bird;
let pipeArray = [];
let score = 0;
let playerName = ""; // Added player name variable
let highScores = []; // Array to store high scores

// Main game loop
function mainLoop(currentTime) {
    // Calculate elapsed time since last frame
    let deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Accumulate elapsed time
    accumulatedTime += deltaTime;
    
    // Update game logic in fixed time steps
    while (accumulatedTime >= MS_PER_UPDATE) {
        update();
        accumulatedTime -= MS_PER_UPDATE;
    }
    
    // Request the next frame
    requestAnimationFrame(mainLoop);
}

// Add event listeners
document.addEventListener("keydown", function(e) {
    if (!gameStarted && (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX")) {
        startGame();
    }
});

document.addEventListener("touchstart", function() {
    if (!gameStarted) {
        startGame();
    }
});

// Start the game
function startGame() {
    playerName = document.getElementById('playerName').value;
    gameStarted = true;
    gameOver = false;
    accumulatedTime = 0;
    lastTime = performance.now();
    lastFrameTime = performance.now();
    requestAnimationFrame(mainLoop);
}

// Rest of your game code...

//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipes
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Determine if the device is a mobile device
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

if (isMobileDevice()) {
    // Parameters for mobile devices
    gravity = 0.15;
    jumpVelocity = -6;
} else {
    // Parameters for desktop devices
    gravity = 0.4;
    jumpVelocity = -8;
}

velocityX = -2; //pipes moving left speed
velocityY = 0; //bird jump speed

window.onload = function () {
    board = document.getElementById("gameCanvas");
    context = board.getContext("2d"); //used for drawing on the board

    // Load images
    birdImg = new Image();
    birdImg.onload = function() {
        console.log("Flappy Bird image loaded successfully.");
    };
    birdImg.onerror = function() {
        console.error("Error loading Flappy Bird image.");
    };
    birdImg.src = "path/to/flappybird.png"; // Update path to flappybird.png

    topPipeImg = new Image();
    topPipeImg.onload = function() {
        console.log("Top pipe image loaded successfully.");
    };
    topPipeImg.onerror = function() {
        console.error("Error loading top pipe image.");
    };
    topPipeImg.src = "path/to/toppipe.png"; // Update path to toppipe.png

    bottomPipeImg = new Image();
    bottomPipeImg.onload = function() {
        console.log("Bottom pipe image loaded successfully.");
    };
    bottomPipeImg.onerror = function() {
        console.error("Error loading bottom pipe image.");
    };
    bottomPipeImg.src = "path/to/bottompipe.png"; // Update path to bottompipe.png
}

function update() {
    if (gameOver) {
        gameOverHandler();
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    let currentTime = Date.now();
    let deltaTime = (currentTime - lastFrameTime) / 1000 || 0; // Calculate deltaTime
    lastFrameTime = currentTime;

    velocityY += gravity * deltaTime; // Apply gravity with deltaTime
    bird.y += velocityY * deltaTime; // Update bird position with deltaTime

    // Clamp bird's position to the top of the canvas
    bird.y = Math.max(bird.y, 0);
    
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    e.preventDefault(); // Prevent default touch behavior (like scrolling)

    if (e.type === "keydown" && (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX")) {
        velocityY = jumpVelocity;
    } else if (e.type === "touchstart") {
        velocityY = jumpVelocity;
    }

    // Reset game if it's over
    if (gameOver) {
        resetGame();
    }
}

function resetGame() {
    bird.y = birdY;
    pipeArray = [];
    velocityY = 0;
    score = 0;
    gameOver = false;
    startGame();
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x && //a's top right corner passes b's top left corner
        a.y < b.y + b.height && //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y; //a's bottom left corner passes b's top left corner
}

// Function to handle game over
function gameOverHandler() {
    // Add the player's score to the high scores array
    highScores.push({name: playerName, score: score});
    // Sort high scores array by score in descending order
    highScores.sort((a, b) => b.score - a.score);
    // Show the top 10 high scores
    let leaderboard = "Top 10 High Scores:\n";
    for (let i = 0; i < Math.min(10, highScores.length); i++) {
        leaderboard += (i + 1) + ". " + highScores[i].name + ": " + highScores[i].score + "\n";
    }
    alert("Game Over!\nYour score: " + score + "\n\n" + leaderboard);
}
