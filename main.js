const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const hud = document.getElementById('hud');
const goalCelebration = document.getElementById('goalCelebration');
const saveCelebration = document.getElementById('saveCelebration');
const scoreVal = document.getElementById('scoreVal');
const timerVal = document.getElementById('timerVal');
const finalScore = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Load Assets
function removeWhiteBackground(img) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width || img.naturalWidth;
    tempCanvas.height = img.height || img.naturalHeight;
    const tCtx = tempCanvas.getContext('2d');
    tCtx.drawImage(img, 0, 0);
    const imgData = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        // Remove white or very light pixels
        if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) {
            data[i+3] = 0; // Set alpha to 0
        }
    }
    tCtx.putImageData(imgData, 0, 0);
    return tempCanvas;
}

const fieldImg = new Image();
fieldImg.src = './public/field.png';

const ballImg = new Image();
let processedBallImg = null;
ballImg.onload = () => { processedBallImg = removeWhiteBackground(ballImg); };
ballImg.src = './public/ball.png';

const gkImg = new Image();
let processedGkImg = null;
gkImg.onload = () => { processedGkImg = removeWhiteBackground(gkImg); };
gkImg.src = './public/gk.png';

// Game constants
const GAME_DURATION = 45;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Game State
let gameState = 'START'; // START, PLAYING, GAMEOVER
let score = 0;
let timeLeft = GAME_DURATION;
let timerInterval = null;

// Input State
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

// Physics and Objects
const goalkeeper = {
    x: CANVAS_WIDTH / 2,
    y: 220, // Abaixado para ficar 'no chão' em frente ao gol
    width: 70,
    height: 90,
    speed: 4.5,
    direction: 1,
    reset() {
        this.x = CANVAS_WIDTH / 2;
    },
    update() {
        // Move side to side within goal bounds
        const leftBound = CANVAS_WIDTH / 2 - 110;
        const rightBound = CANVAS_WIDTH / 2 + 110;
        this.x += this.speed * this.direction;
        
        if (this.x > rightBound) {
            this.x = rightBound;
            this.direction = -1;
        } else if (this.x < leftBound) {
            this.x = leftBound;
            this.direction = 1;
        }
    },
    draw(ctx) {
        if (processedGkImg) {
            ctx.drawImage(processedGkImg, this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        } else {
            ctx.fillStyle = '#f97316';
            ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        }
    }
};

const ball = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 120,
    radius: 18,
    vx: 0,
    vy: 0,
    isShot: false,
    spin: 0,
    rotation: 0,
    reset() {
        this.x = CANVAS_WIDTH / 2;
        this.y = CANVAS_HEIGHT - 120;
        this.vx = 0;
        this.vy = 0;
        this.isShot = false;
        this.spin = 0;
        arrow.angle = -Math.PI / 2;
    },
    update() {
        if (this.isShot) {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.spin;
            
            // Friction/Drag
            this.vx *= 0.985;
            this.vy *= 0.985;
            this.spin *= 0.985;

            if (Math.abs(this.vx) < 0.2 && Math.abs(this.vy) < 0.2) {
                this.reset();
            }

            // --- GK Collision ---
            const gLeft = goalkeeper.x - goalkeeper.width/2 - this.radius;
            const gRight = goalkeeper.x + goalkeeper.width/2 + this.radius;
            const gTop = goalkeeper.y - goalkeeper.height/2 - this.radius;
            const gBottom = goalkeeper.y + goalkeeper.height/2 + this.radius;

            if (this.x > gLeft && this.x < gRight && this.y > gTop && this.y < gBottom) {
                triggerSave();
                return;
            }

            // --- Goal Detection ---
            const goalXMin = CANVAS_WIDTH / 2 - 140;
            const goalXMax = CANVAS_WIDTH / 2 + 140;
            const goalYMax = 220;

            if (this.y < goalYMax && this.x > goalXMin && this.x < goalXMax) {
                triggerGoal();
            } else if (this.y < 80 || this.x < 0 || this.x > CANVAS_WIDTH) {
                this.reset();
            }
        }
    },
    draw(ctx) {
        if (processedBallImg) {
            const size = this.radius * 2;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.drawImage(processedBallImg, -this.radius, -this.radius, size, size);
            ctx.restore();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#FFF';
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
};

const arrow = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 120,
    length: 80,
    angle: -Math.PI / 2,
    update() {
        if (!ball.isShot) {
            const rotationSpeed = 0.04;
            if (keys.ArrowLeft) {
                this.angle -= rotationSpeed;
            }
            if (keys.ArrowRight) {
                this.angle += rotationSpeed;
            }
            
            const minAngle = -Math.PI + 0.3;
            const maxAngle = -0.3;
            if (this.angle < minAngle) this.angle = minAngle;
            if (this.angle > maxAngle) this.angle = maxAngle;
        }
    },
    draw(ctx) {
        if (ball.isShot) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        ctx.moveTo(ball.radius + 10, 0);
        ctx.lineTo(this.length, 0);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.length + 2, 0);
        ctx.lineTo(this.length - 12, -8);
        ctx.lineTo(this.length - 12, 8);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;
        ctx.fill();

        ctx.restore();
    }
};

// Controls
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
    }
    
    if (e.code === 'Space' && gameState === 'PLAYING' && !ball.isShot) {
        shootBall();
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});

function shootBall() {
    ball.isShot = true;
    const power = 18;
    ball.vx = Math.cos(arrow.angle) * power;
    ball.vy = Math.sin(arrow.angle) * power;
    ball.spin = ball.vx * 0.05;
}

function triggerSave() {
    ball.reset();
    saveCelebration.classList.remove('hidden');
    saveCelebration.classList.remove('celebrate-anim');
    void saveCelebration.offsetWidth;
    saveCelebration.classList.add('celebrate-anim');

    setTimeout(() => {
        saveCelebration.classList.add('hidden');
    }, 1000);
}

function triggerGoal() {
    score++;
    scoreVal.innerText = score;
    ball.reset();
    
    goalCelebration.classList.remove('hidden');
    goalCelebration.classList.remove('celebrate-anim');
    void goalCelebration.offsetWidth;
    goalCelebration.classList.add('celebrate-anim');

    setTimeout(() => {
        goalCelebration.classList.add('hidden');
    }, 1000);
}

function startGame() {
    gameState = 'PLAYING';
    score = 0;
    timeLeft = GAME_DURATION;
    scoreVal.innerText = score;
    timerVal.innerText = timeLeft;
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    
    ball.reset();
    goalkeeper.reset();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerVal.innerText = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    gameState = 'GAMEOVER';
    clearInterval(timerInterval);
    hud.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScore.innerText = score;
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (gameState === 'PLAYING') {
        goalkeeper.update();
        arrow.update();
        ball.update();
    }
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (fieldImg.complete && fieldImg.naturalWidth > 0) {
        ctx.drawImage(fieldImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
        const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        grad.addColorStop(0, '#047857');
        grad.addColorStop(1, '#10b981');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 5;
        ctx.strokeRect(CANVAS_WIDTH/2 - 200, -10, 400, 250);
        ctx.strokeRect(CANVAS_WIDTH/2 - 100, -10, 200, 100);
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH/2, 180, 5, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
    }

    if (gameState === 'PLAYING' || gameState === 'GAMEOVER') {
        goalkeeper.draw(ctx);
        arrow.draw(ctx);
        ball.draw(ctx);
    }
}

gameLoop();
