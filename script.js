// Canvas Setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width = window.innerWidth;
const CANVAS_HEIGHT = canvas.height = window.innerHeight;

// Collision Canvas Setup
const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');

const COLLISION_CANVAS_WIDTH = collisionCanvas.width = window.innerWidth;
const COLLISION_CANVAS_HEIGHT = collisionCanvas.height = window.innerHeight;

// Timestamp Variables
let timeToNextRaven = 0;
let ravenInterval = 700;
let lastTime = 0;


// Score setup
let score = 0;
// console.log(ctx);
ctx.font = '50px Impact';
let gameOver = false;
let gameOverCounter = 0;

// AI Setup
let ravens = [];
class Raven {
    constructor() {
        this.speedX = Math.random() * 5 + 3;
        this.speedY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = './assets/raven.png';
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.4 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = CANVAS_WIDTH;
        this.y = Math.random() * (CANVAS_HEIGHT - this.height);
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.ceil((Math.random() * 50) + 50);
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.5; // Returns true 50% of the time
    }

    update(deltaTime) {
        if (this.y < 0 || this.y > (canvas.height - this.height)) {
            this.speedY = this.speedY * -1;
        }
        this.x -= this.speedX;
        this.y += this.speedY;
        if (this.x < (0 - this.width)) {
            this.markedForDeletion = true;
            gameOverCounter++;
            if (gameOverCounter === 3) {
                gameOver = true;
            }
        };

        this.timeSinceFlap += deltaTime;
        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame > this.maxFrame) {
                this.frame = 0;
            } else {
                this.frame++;
            }
            this.timeSinceFlap = 0;
            if (this.hasTrail) {
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(this.x, this.y, this.width, this.color));
                }
            };
        }
        // if (this.x < (0 - this.width)) {

        // }
        // console.log(this.frame, this.maxFrame, this.timeSinceFlap, this.flapInterval);

    }

    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight,
            this.x, this.y, this.width, this.height);
        // ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Explosions Setup
let explosions = [];
class Explosion {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = './assets/boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = './assets/sfx/boom.wav';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.frameLimit = 3;
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > this.frameLimit) {
                this.markedForDeletion = true;
            }
        };
    }

    draw() {
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight,
            this.x, this.y - (this.size * 0.25), this.size, this.size)
    }
}

// Particles Setup
let particles = [];
class Particle {
    constructor(x, y, size, color) {
        this.size = size;
        this.x = x + (this.size * 0.7) + (Math.random() * 50 - 25);
        this.y = y + (this.size * 0.33) + (Math.random() * 50 - 25);
        this.color = color;
        this.radius = Math.random() * (this.size * 0.05);
        this.maxRadius = Math.random() * 20 + 35;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
    }

    update() {
        this.x += this.speedX;
        this.radius += 0.5;
        if (this.radius > (this.maxRadius - 5)) this.markedForDeletion = true;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = 1 - this.radius / this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 50, 75);
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 52, 80);
}

function drawGameOver() {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('Game Over! Your score is: ' + score, canvas.width * 0.5, canvas.height * 0.5);
    ctx.fillStyle = 'white';
    ctx.fillText('Game Over! Your score is: ' + score, canvas.width * 0.5 + 5, canvas.height * 0.5 + 5);
}

window.addEventListener('click', function (e) {
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1)
    const pixelColor = detectPixelColor.data;
    ravens.forEach(raven => {
        if (raven.randomColors[0] === pixelColor[0] && raven.randomColors[1] === pixelColor[1] && raven.randomColors[2] === pixelColor[2]) {
            raven.markedForDeletion = true;
            score++;
            explosions.push(new Explosion(raven.x, raven.y, raven.width));
            console.log(explosions);
        }
    })
})

function animate(timeStamp) {
    collisionCtx.clearRect(0, 0, COLLISION_CANVAS_WIDTH, COLLISION_CANVAS_HEIGHT);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    timeToNextRaven += deltaTime;
    if (timeToNextRaven > ravenInterval) {
        ravens.push(new Raven());
        timeToNextRaven = 0;

        ravens.sort(function (a, b) {
            return a.width - b.width; // Smaller ravens are pushed to the first into the array
        })
    };
    drawScore();
    [...particles, ...ravens, ...explosions].forEach(object => object.update(deltaTime));
    [...particles, ...ravens, ...explosions,].forEach(object => object.draw());
    // Filter out any raven that is marked for deletion and port the rest to the new ravens array
    ravens = ravens.filter(raven => !raven.markedForDeletion);
    explosions = explosions.filter(explosion => !explosion.markedForDeletion);
    particles = particles.filter(particle => !particle.markedForDeletion);
    // console.log(ravens);
    if (!gameOver) {
        requestAnimationFrame(animate);
    } else {
        drawGameOver();
    }
};

animate(0);