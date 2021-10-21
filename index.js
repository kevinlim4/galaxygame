const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.body.style.cursor = 'crosshair';

const scoreValue = document.querySelector('#scoreValue');
const levelValue = document.querySelector('#levelValue');
const lifeValue = document.querySelector('#lifeValue');

// Level up Modal
// const infoModal = document.querySelector('#infoModal');
// const infoModalValue = document.querySelector('#infoModalValue');

// Status Label
const statusLabel = document.querySelector('#statusLabel');

// Start Game Modal
const startGameBtn = document.querySelector('#startGameBtn');
const startGameModal = document.querySelector('#startGameModal');

// End Game Modal
const modalScoreValue = document.querySelector('#modalScoreValue');
const modalLevelValue = document.querySelector('#modalLevelValue');
const restartGameBtn = document.querySelector('#restartGameBtn');
const endGameModal = document.querySelector('#endGameModal');

const PLAYER_SPEED = 3;
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        if (keyW == true) {
            this.y -= PLAYER_SPEED;
        }
        if (keyA == true) {
            this.x -= PLAYER_SPEED;
        }
        if (keyS == true) {
            this.y += PLAYER_SPEED;
        }
        if (keyD == true) {
            this.x += PLAYER_SPEED;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    levelUp() {
        this.color = 'yellow';
        ctx.fillStyle = this.color;
        //infoModalValue.classList.add("text-yellow-400");
        //infoModalValue.innerHTML = "Level Up!";
        //infoModal.style.display = 'flex';
        setInterval(() => {
            this.color = 'white';
            ctx.fillStyle = this.color;
            //infoModalValue.classList.remove("text-yellow-400");
            //infoModal.style.display = 'none';
        }, 1000);
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.draw();

        // subtract
        var dx = player.x - this.x;
        var dy = player.y - this.y;

        // normalize
        var length = Math.sqrt(dx * dx + dy * dy);
        if (length) {
        dx /= length;
        dy /= length;
        }

        // move
        this.x += dx * level;
        this.y += dy * level;
    }
}

class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.draw();
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

let player;
let projectiles = [];
let enemies = [];
let particles = [];

let animationId;
let score;
let xp;
let level;
let life;

const starsQtde = 200;
const x = Array.from({length: starsQtde}, () => Math.random() * canvas.offsetWidth);
const y = Array.from({length: starsQtde}, () => Math.random() * canvas.offsetHeight);
const radius = Array.from({length: starsQtde}, () => Math.random() * 1.1);

function drawStars() {
    for (var i = 0; i < starsQtde; i++) {
        ctx.beginPath();
        ctx.arc(x[i], y[i], radius[i], 0, 360);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
    }
}
drawStars();

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.volume = 0.1;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);

    this.play = function(){
        this.sound.play();
    }

    this.stop = function(){
        this.sound.pause();
    }
}
//var laserSound = new sound("lasergun.mp3");
var gameThemeSound = new sound("gametheme.mp3");
//var explosionSound = new sound("explosion.mp3");;

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 8) + 8; // Enemies size 30-8
        let x;
        let y;

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(player.y - y, player.x - x);
        const velocity = { x: Math.cos(angle) * level, y: Math.sin(angle) * level };

        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
}

function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.17)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawStars();
    player.draw();

    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    });

    projectiles.forEach((projectile, index) => {
        projectile.update();
        
        // remove off-screen projectiles
        if (projectile.x + projectile.radius < 0 || 
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }
    });

    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();
        
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        
        // enemy hits player
        if (distance - enemy.radius - player.radius < 0.1) {
            const damage = Math.floor(enemy.radius);
            life -= damage;
            lifeValue.innerHTML = life;
            if (life <= 0) {
                // game over
                cancelAnimationFrame(animationId);
                gameThemeSound.stop();
                lifeValue.innerHTML = 0;
                modalScoreValue.innerHTML = score;
                modalLevelValue.innerHTML = level;
                endGameModal.style.display = 'flex';
                statusLabel.style.display = 'none';
            } else {
                setTimeout(() => {
                    enemies.splice(enemyIndex, 1);
                    projectiles.splice(projectileIndex, 1);
                }, 0);

                // create explosion on enemy hit
                for (let i = 0; i < player.radius * 2; i++) {
                    particles.push(
                        new Particle( player.x, player.y,  Math.random() * 2, player.color, 
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 4),
                            y: (Math.random() - 0.5) * (Math.random() * 6)
                        })
                    );
                }
            }
        }

        // when projectiles touch enemy
        projectiles.forEach((projectile, projectileIndex) => {
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

            if (distance - enemy.radius - projectile.radius < 1) {
                // create explosion on enemy hit
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(
                        new Particle( projectile.x, projectile.y,  Math.random() * 2, enemy.color, 
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 5),
                            y: (Math.random() - 0.5) * (Math.random() * 7)
                        })
                    );
                }

                // make enemy small or kill if already too small
                if (enemy.radius - 10 > 8) {
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    });
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                } else {
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                        enemies.splice(enemyIndex, 1);
                    }, 0);

                    // increase score/xp
                    score += 100;
                    xp += 50;
                    scoreValue.innerHTML = score;

                    // increase level, speed of enemies, reset life
                    if (xp === 2000) {
                        level++;
                        player.levelUp();
                        xp = 0;
                        life = 100;
                        levelValue.innerHTML = level;
                        lifeValue.innerHTML = life;
                    }
                }
            }
        })
    });
}

function init(){
    player = new Player(canvas.width / 2, canvas.height / 2, 15, 'white');
    gameThemeSound.play();
    projectiles = [];
    enemies = [];
    particles = [];

    score = 0;
    xp = 0;
    level = 1;
    life = 100;

    scoreValue.innerHTML = score;
    // add xp bar
    levelValue.innerHTML = level;
    lifeValue.innerHTML = life;
}

window.addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - player.y,
        event.clientX - player.x
    );
    const velocity = { 
        x: Math.cos(angle) * 6, 
        y: Math.sin(angle) * 6
    };

    projectiles.push(new Projectile(
        player.x, player.y, 
        5, 'white', velocity
    ));
});

startGameBtn.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
    startGameModal.style.display = 'none';
    statusLabel.style.display = 'block';
});

restartGameBtn.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
    endGameModal.style.display = 'none';
    statusLabel.style.display = 'block';
});

let keyW = false;
let keyA = false;
let keyS = false;
let keyD = false;

window.addEventListener("keydown", onKeyDown, false);
window.addEventListener("keyup", onKeyUp, false);

function onKeyDown(event) {
    let keyCode = event.keyCode;
    switch (keyCode) {
        case 87: //w
            keyW = true;
            break;
        case 65: //a
            keyA = true;
            break;
        case 83: //s
            keyS = true;
            break;
        case 68: //d
            keyD = true;
            break;
    }
}

function onKeyUp(event) {
    var keyCode = event.keyCode;
  
    switch (keyCode) {
        case 87: //w
            keyW = false;
            break;
        case 65: //a
            keyA = false;
            break;
        case 83: //s
            keyS = false;
            break;
        case 68: //d
            keyD = false;
            break;
    }
  }
  