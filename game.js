const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Adjust canvas size to fill the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isJumping = false;
let jumpHeight = 0;
let score = 0;
let gameOver = false;
let speed = 5; // Initial speed
const gravity = 0.5; // Gravity effect
const MAX_JUMP_HEIGHT = 150; // Maximum jump height
const SPEED_INCREASE_THRESHOLD = 3; // Score threshold for speed increase
const SPEED_INCREMENT = 0.7; // Speed increment for higher difficulty
let scoreMultiplier = 1; // Score multiplier for consecutive jumps
let lastJumpTime = 0; // Last jump time to track consecutive jumps

const player = {
    x: 50,
    y: canvas.height - 70,
    width: 50,
    height: 50,
    velocityY: 0, // Player's vertical speed
    health: 3, // Health points
};

const obstacles = [];
let obstacleTimer = 0;
const powerUps = [];
let powerUpTimer = 0;

// Handle jump on space key press
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !isJumping && !gameOver) {
        isJumping = true;
        player.velocityY = -10; // Set upward velocity for jump
        // Check for consecutive jumps
        if (lastJumpTime) {
            scoreMultiplier++; // Increase multiplier
        } else {
            scoreMultiplier = 1; // Reset multiplier
        }
        lastJumpTime = Date.now();
    }
});

// Function to spawn obstacles
function spawnObstacle() {
    const obstacleWidth = Math.random() * 40 + 20; // Width between 20 and 60
    const obstacleHeight = Math.random() * (70 - 30) + 30; // Height between 30 and 70
    obstacles.push({
        x: canvas.width,
        y: canvas.height - obstacleHeight - 30, // 30 for ground clearance
        width: obstacleWidth,
        height: obstacleHeight,
    });
}

// Function to spawn power-ups
function spawnPowerUp() {
    const powerUpSize = 30;
    powerUps.push({
        x: canvas.width,
        y: canvas.height - powerUpSize - 30, // 30 for ground clearance
        width: powerUpSize,
        height: powerUpSize,
    });
}

// Update obstacles and check for collisions
function updateObstacles() {
    if (obstacleTimer % 100 === 0) { // Increase frequency of obstacles
        spawnObstacle();
    }
    if (powerUpTimer % 300 === 0 && Math.random() < 0.2) { // 20% chance to spawn a power-up
        spawnPowerUp();
    }
    
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= speed; // Move obstacle left
        // Check for collision with player
        if (
            player.x < obstacles[i].x + obstacles[i].width &&
            player.x + player.width > obstacles[i].x &&
            player.y < obstacles[i].y + obstacles[i].height &&
            player.y + player.height > obstacles[i].y
        ) {
            // Reduce health on collision
            player.health--;
            if (player.health <= 0) {
                gameOver = true;
                alert('Game Over! Your score: ' + score);
                saveHighScore(score); // Save high score
                document.location.reload();
            }
        }
        // Remove obstacles that have left the canvas
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score += 1; // Increase score by 1 for each obstacle crossed
            // Increase speed based on score
            if (score % SPEED_INCREASE_THRESHOLD === 0) {
                speed += SPEED_INCREMENT; // Increase speed with score
            }
        }
    }
    
    for (let i = 0; i < powerUps.length; i++) {
        powerUps[i].x -= speed; // Move power-up left
        // Check for collision with player
        if (
            player.x < powerUps[i].x + powerUps[i].width &&
            player.x + player.width > powerUps[i].x &&
            player.y < powerUps[i].y + powerUps[i].height &&
            player.y + player.height > powerUps[i].y
        ) {
            powerUps.splice(i, 1); // Remove power-up
            score += 5; // Increase score for collecting a power-up
        }
        // Remove power-ups that have left the canvas
        if (powerUps[i].x + powerUps[i].width < 0) {
            powerUps.splice(i, 1);
        }
    }
}

// Handle jumping logic
function jump() {
    if (isJumping) {
        player.velocityY += gravity; // Apply gravity to the vertical speed
        player.y += player.velocityY; // Update player position

        // Ensure the jump height exceeds the maximum obstacle height
        if (jumpHeight < MAX_JUMP_HEIGHT) {
            player.velocityY = -10; // Set a strong upward velocity
            jumpHeight += 10; // Increase jump height
        }
    }
    
    // Reset jump when the player lands
    if (player.y >= canvas.height - player.height - 30) { // Check if player is on the ground
        player.y = canvas.height - player.height - 30; // Reset position to ground level
        isJumping = false; // Reset jumping status
        player.velocityY = 0; // Reset vertical speed
        jumpHeight = 0; // Reset jump height tracker
    }
}

// Draw game elements on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    ctx.fillStyle = 'blue'; // Player color
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw obstacles
    ctx.fillStyle = 'red'; // Obstacle color
    for (let obstacle of obstacles) {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }

    // Draw power-ups
    ctx.fillStyle = 'green'; // Power-up color
    for (let powerUp of powerUps) {
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    }

    // Draw score and health
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
    ctx.fillText('Health: ' + player.health, 10, 60);
    
    jump();
    updateObstacles();
}

// Save high score to local storage
function saveHighScore(newScore) {
    const highScore = localStorage.getItem('highScore');
    if (!highScore || newScore > highScore) {
        localStorage.setItem('highScore', newScore);
    }
}

// Load high score from local storage
function loadHighScore() {
    const highScore = localStorage.getItem('highScore');
    return highScore ? highScore : 0;
}

// Game loop with delta time for smoother movement
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (!gameOver) {
        obstacleTimer++;
        powerUpTimer++;
        draw();
    }
    requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);