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
document.getElementById("saveScoreButton").addEventListener("click", saveScoresToLocal);

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
    document.getElementById('showScoresButton').addEventListener('click', function() {
        const scoresDisplay = document.getElementById('scoresDisplay');
        if (scoresDisplay.style.display === 'none') {
            // Show scores
            scoresDisplay.style.display = 'block';
            displayScores(); // Display scores when shown
            // Replace show button with hide button
            const showButton = document.getElementById('showScoresButton');
            showButton.textContent = 'Hide High Scores';
        } else {
            // Hide scores
            scoresDisplay.style.display = 'none';
            // Replace hide button with show button
            const showButton = document.getElementById('showScoresButton');
            showButton.textContent = 'Show High Scores';
        }
    });
    
    document.getElementById('resetGameButton').addEventListener('click', resetGame);
    document.getElementById('saveScoreButton').addEventListener('click', saveScoresToLocal);
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    } else {
        console.error("Element with ID 'startButton' not found.");
    }
    const saveScoreButton = document.getElementById('saveScoreButton');
    if (saveScoreButton) {
        saveScoreButton.addEventListener('click', saveScoresToLocal);
    } else {
        console.error("Save score button not found.");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
});

// Function to reset the game
function resetGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
    velocityY = 0; // Reset bird's vertical velocity
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

// Function to toggle the visibility of high scores display and show/hide buttons
function toggleScoresDisplay() {
    const scoresDisplay = document.getElementById("scoresDisplay");
    const hideScoresButton = document.getElementById("hideScoresButton");
    const showScoresButton = document.getElementById("showScoresButton");
    
    if (scoresDisplay && hideScoresButton && showScoresButton) {
        const isHidden = scoresDisplay.style.display === "none";
        scoresDisplay.style.display = isHidden ? "block" : "none";
        hideScoresButton.style.display = isHidden ? "none" : "block";
        showScoresButton.style.display = isHidden ? "block" : "none";
    } else {
        console.error("One or more elements not found.");
    }
}

// Event listener for the "Show High Scores" button
document.getElementById('showScoresButton').addEventListener('click', toggleScoresDisplay);

// Event listener for the "Hide High Scores" button
document.getElementById('hideScoresButton').addEventListener('click', toggleScoresDisplay);

// Function to display scores
function displayScores() {
    const scoresDisplay = document.getElementById("highScoresList");
    if (scoresDisplay) {
        scoresDisplay.innerHTML = ""; // Clear previous scores

        // Retrieve high scores from local storage or initialize an empty array if not present
        const existingScores = JSON.parse(localStorage.getItem("highScores")) || [];

        // Sort scores in descending order based on score
        existingScores.sort((a, b) => b.score - a.score);

        // Display only the top 10 scores
        const topScores = existingScores.slice(0, 10);

        topScores.forEach((entry, index) => {
            const li = document.createElement("li");
            li.textContent = entry.name + ": " + entry.score;
            scoresDisplay.appendChild(li);
        });

        // Show the scores display
        document.getElementById("scoresDisplay").style.display = "block";
    } else {
        console.error("Element with ID 'highScoresList' not found.");
    }
}


function saveScore() {
    const playerName = prompt("Enter your name:");
    if (playerName !== null) { // Check if the user entered a name or canceled the prompt
        const playerScore = score; // Assuming you have a variable named 'score' storing the current score
        const scoreEntry = { name: playerName, score: playerScore };

        // Retrieve existing scores from local storage or initialize an empty array
        const existingScores = JSON.parse(localStorage.getItem("highScores")) || [];

        // Add the new score entry to the array
        existingScores.push(scoreEntry);

        // Sort the scores array in descending order based on score
        existingScores.sort((a, b) => b.score - a.score);

        // Store the updated scores array back to local storage
        localStorage.setItem("highScores", JSON.stringify(existingScores));

        // Optionally, display a confirmation message
        alert("Score saved successfully!");

        // Update the high scores display
        displayScores();
    }
}

function saveScoresToLocal() {
    console.log("saveScoresToLocal() function called");
    
    const playerNameInput = document.getElementById("playerName");
    const playerName = playerNameInput.value.trim(); // Retrieve the player's name from the input field

    console.log("Player name:", playerName);

    if (!playerName) {
        alert("Please enter your name.");
        return; // Exit the function if the player's name is not provided
    }

    // Assuming you have a variable named 'score' storing the current score
    if (score > 0) { // Check if the score is greater than 0
        // Create an object with name and score
        const scoreEntry = { 
            name: playerName,
            score: score
        };

        console.log("Score entry:", scoreEntry);

        // Retrieve existing scores from local storage or initialize an empty array
        const existingScores = JSON.parse(localStorage.getItem("highScores")) || [];

        console.log("Existing scores:", existingScores);

        // Add the new score entry to the array
        existingScores.push(scoreEntry);

        console.log("Updated scores:", existingScores);

        // Sort the scores array in descending order based on score
        existingScores.sort((a, b) => b.score - a.score);

        console.log("Sorted scores:", existingScores);

        // Store the updated scores array back to local storage
        localStorage.setItem("highScores", JSON.stringify(existingScores));

        console.log("Scores saved to local storage");

        // Optionally, display a confirmation message
        alert("Score saved successfully!");

        // Restart the game after saving the score
        restartGame();
    } else {
        console.error("Score is zero.");
    }
}


// Function to load scores from local storage
function loadScoresFromLocal() {
    const storedScores = localStorage.getItem("flappyBirdHighScores");
    if (storedScores) {
        highScores = JSON.parse(storedScores);
        displayScores(); // Display loaded scores
    }
}

// Event listener for spacebar key to make the bird jump and start the game
function moveBird(event) {
    console.log("Key pressed: " + event.code);
    if (event.code === "Space") { // Only respond to spacebar key
        if (gameOver) {
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
        velocityY = -7; // Adjusted jump velocity
    } else {
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
    window.location.href = 'index.html'; // Replace 'index.html' with the actual filename of your start screen
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

// Load scores from local storage when the page is loaded
window.addEventListener("load", loadScoresFromLocal);
