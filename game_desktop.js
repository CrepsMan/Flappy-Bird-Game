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
let birdImg; // Define birdImg in the outer scope

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

// Pipe spawn variables
let pipeSpawnCounter = 0;
const pipeSpawnDelay = 120; // Adjust as needed


// Function to initialize the game
function initializeGame() {
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
    birdImg = new Image(); // Define birdImg here
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
    // Ensure the start screen is displayed
    document.getElementById("startScreen").style.display = "flex";
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("endScreen").style.display = "none";
    document.getElementById("scoresDisplay").style.display = "none"; // Ensure high scores are hidden initially
    document.getElementById("gameOverScreen").style.display = "none";
    document.getElementById('showScoresButton').addEventListener('click', toggleScoresDisplay);
    document.getElementById('resetGameButton').addEventListener('click', resetGame);
    document.getElementById('saveScoreButton').addEventListener('click', saveScoresToServer);
    // Check if the element exists before adding the event listener
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    } else {
        console.error("Element with ID 'startButton' not found.");
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

// Function to start the game
function startGame() {
    // Initialize game state without instantly transitioning to game over screen
    resetGame(); 
    console.log("startGame() called");
    const startScreen = document.getElementById("startScreen");
    if (!startScreen) {
        console.error("Start screen element not found.");
        return;
    }

    startScreen.style.display = "none";
    console.log("startGame() called");
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
    document.getElementById("endScreen").style.display = "none";

    
    // Hide scores display when starting the game
    document.getElementById("scoresDisplay").style.display = "none"; // Add this line

    // Load background image
    const backgroundImage = new Image();
    backgroundImage.onload = function() {
        // Set the background image once it's loaded
        document.getElementById("board").style.backgroundImage = "url('flappybirdbg.png')";
        // Add event listeners after loading the background image
        document.removeEventListener("keydown", moveBird); // Remove existing event listeners
        document.getElementById("board").removeEventListener("touchstart", moveBirdTouch);
        document.addEventListener("keydown", moveBird);
        document.getElementById("board").addEventListener("touchstart", moveBirdTouch);
    };
    backgroundImage.src = "./flappybirdbg.png";
}


// Function to render the bird on the canvas
function renderBird() {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

// Function to move the bird
function moveBird() {
    // Move the bird up
    bird.y -= 30; // Adjust this value as needed for desired jump height
}

// Function to handle bird jumping
function jump() {
    if (!gameOver) {
        moveBird();
    } else {
        resetGame(); // Reset the game after game over
    }
}

// Event listener for spacebar key to make the bird jump and start the game
function moveBird(event) {
    console.log("Key pressed: " + event.code);
    if (event.code === "Space") { // Only respond to spacebar key
        if (gameOver) {
            restartGame(); // Restart the game if it's over
        } else {
            jump(); // Otherwise, make the bird jump
        }
    }
}

// Event listener for touch input to make the bird jump
function moveBirdTouch(e) {
    e.preventDefault(); // Prevent default touch behavior (like scrolling)
    jump();
}

// Function to toggle the visibility of high scores display
function toggleScoresDisplay() {
    const scoresDisplay = document.getElementById("scoresDisplay");
    if (scoresDisplay) {
        const displayStyle = scoresDisplay.style.display;
        scoresDisplay.style.display = displayStyle === "none" ? "block" : "none";
        const showScoresButton = document.getElementById("showScoresButton");
        if (showScoresButton) {
            if (displayStyle === "none") {
                // Create the hide scores button
                const hideScoresButton = document.createElement("button");
                hideScoresButton.id = "hideScoresButton";
                hideScoresButton.textContent = "Hide High Scores";
                hideScoresButton.addEventListener("click", toggleScoresDisplay);

                // Replace the show scores button with the hide scores button
                showScoresButton.parentNode.insertBefore(hideScoresButton, showScoresButton.nextSibling);
                showScoresButton.remove(); // Remove the show scores button
            } else {
                // Create the show scores button
                const showScoresButton = document.createElement("button");
                showScoresButton.id = "showScoresButton";
                showScoresButton.textContent = "Show High Scores";
                showScoresButton.addEventListener("click", toggleScoresDisplay);

                // Replace the hide scores button with the show scores button
                const hideScoresButton = document.getElementById("hideScoresButton");
                hideScoresButton.parentNode.insertBefore(showScoresButton, hideScoresButton.nextSibling);
                hideScoresButton.remove(); // Remove the hide scores button
            }
        }
    } else {
        console.error("Element with ID 'scoresDisplay' not found.");
    }
}








// Initialize the game when the window loads
window.onload = initializeGame;

function displayScores() {
    const scoresDisplay = document.getElementById("scoresDisplay");
    if (scoresDisplay) {
        scoresDisplay.style.display = "block";
        scoresDisplay.innerHTML = "";

        // Sort scores in descending order
        highScores.sort((a, b) => b.score - a.score);

        // Display only the top 10 scores
        const topScores = highScores.slice(0, 10);

        topScores.forEach((entry, index) => {
            const li = document.createElement("li");
            li.textContent = entry.name + ": " + entry.score;
            scoresDisplay.appendChild(li);
        });
    } else {
        console.error("Element with ID 'scoresDisplay' not found.");
    }
}


function saveScoresToServer(name, score) {
    fetch('http://localhost:3000/saveScores', { // Change the URL to match your server
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name, score: score }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save score');
        }
        console.log('Score saved successfully');
    })
    .catch(error => {
        console.error('Error saving score:', error);
    });
}

function loadScoresFromServer() {
    fetch('http://localhost:3000/loadScores') // Change the URL to match your server
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load scores');
        }
        return response.json();
    })
    .then(scores => {
        console.log('Scores loaded successfully:', scores);
        // Handle loading scores into your game interface
    })
    .catch(error => {
        console.error('Error loading scores:', error);
    });
}
// Event listener for the save score button
document.getElementById('saveScoreButton').addEventListener('click', saveHighScoresToServer);


// Event listener for spacebar key to make the bird jump and start the game
function moveBird(event) {
    console.log("Key pressed: " + event.code);
    if (event.code === "Space") { // Only respond to spacebar key
        if (gameOver) {
            restartGame(); // Restart the game if it's over
        } else {
            jump(); // Otherwise, make the bird jump
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

// Function to update game state
function update() {
    console.log("update function called");
    requestAnimationFrame(update);
    if (gameOver) {
        // Game over logic
        displayEndScores(); // Display high scores
        document.getElementById("gameOverScreen").style.display = "flex";
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
    renderBird(); // Render the bird

    // Drawing pipes
    for (let i = 0; i < pipeArray.length; i++) {
        const pipe = pipeArray[i];
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    }

    // Drawing score
    if (!gameOver) {
        context.fillStyle = "white";
        context.font = "20px sans-serif";
        context.fillText(score, 10, 30);
    }
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
        
        // Remove background image
        document.getElementById("board").style.backgroundImage = "none";
        context.clearRect(0, 0, board.width, board.height);

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

// Function to display the game over screen
function displayGameOverScreen() {
    document.getElementById("gameOverScreen").classList.remove("hidden");
    document.getElementById("board").classList.add("hidden");
}

// Function to hide the game over screen
function hideGameOverScreen() {
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("board").classList.remove("hidden");
}

