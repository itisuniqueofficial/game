const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to fill the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isJumping = false;
let jumpHeight = 0;
let score = 0;
let gameOver = false;
let speed = 5;
const gravity = 0.5;
const MAX_JUMP_HEIGHT = 150;
const playerHealth = 3; // Initial health
let currentHealth = playerHealth;

const player = {
    x: 50,
    y: canvas.height - 70,
    width: 50,
    height: 50,
    velocityY: 0,
};

const obstacles = [];
let obstacleTimer = 0;
let scoreMultiplier = 1;
let lastJumpTime = 0;

// Handle jump on space key press or touch start
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !isJumping && !gameOver) {
        startJump();
    }
});

canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    if (!isJumping && !gameOver) {
        startJump();
    }
});

function startJump() {
    isJumping = true;
    player.velocityY = -12; // Adjust for a smoother jump arc
    lastJumpTime = Date.now();
}

// Spawn an obstacle with dynamic difficulty
function spawnObstacle() {
    const obstacleWidth = Math.random() * 40 + 20;
    const obstacleHeight = Math.random() * (70 - 30) + 30;
    obstacles.push({
        x: canvas.width,
        y: canvas.height - obstacleHeight - 30,
        width: obstacleWidth,
        height: obstacleHeight,
    });
}

// Update obstacles and collisions
function updateObstacles() {
    if (obstacleTimer % 100 === 0) spawnObstacle();
    
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= speed;

        // Check for player collision
        if (
            player.x < obstacles[i].x + obstacles[i].width &&
            player.x + player.width > obstacles[i].x &&
            player.y < obstacles[i].y + obstacles[i].height &&
            player.y + player.height > obstacles[i].y
        ) {
            currentHealth -= 1;
            if (currentHealth <= 0) {
                gameOver = true;
                alert(`Game Over! Your score: ${score}`);
                document.location.reload();
            }
        }

        // Remove obstacle if it leaves screen
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score += 1; // Increment score
            if (score % 5 === 0) speed += 0.5; // Increase speed every 5 points
        }
    }
}

// Handle jump logic with smooth arc
function jump() {
    if (isJumping) {
        player.velocityY += gravity;
        player.y += player.velocityY;

        if (jumpHeight < MAX_JUMP_HEIGHT) {
            player.velocityY = -10;
            jumpHeight += 10;
        }
    }

    if (player.y >= canvas.height - player.height - 30) {
        player.y = canvas.height - player.height - 30;
        isJumping = false;
        player.velocityY = 0;
        jumpHeight = 0;
    }
}

// Draw the game elements
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'lightblue');
    gradient.addColorStop(1, 'blue');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw obstacles
    ctx.fillStyle = 'red';
    for (let obstacle of obstacles) {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }

    // Display score and health
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Health: ${currentHealth}`, 10, 60);

    jump();
    updateObstacles();
}

// Game loop for smoother performance
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (!gameOver) {
        obstacleTimer++;
        draw();
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);