// Configurações do jogo
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 600;

// Carregar imagens
const startScreenImage = new Image();
startScreenImage.src = 'imgs/teladeinicio.jpg';

const pigImage = new Image();
pigImage.src = 'imgs/pig2.png';

const platformImage = new Image();
platformImage.src = 'imgs/fundo.png';

const backgroundImage = new Image();
backgroundImage.src = 'imgs/fundo.jpg';

// Carregar sons
const jumpSound = document.getElementById("jumpSound");
const gameMusic = document.getElementById("gameMusic");
gameMusic.volume = 0.3;
jumpSound.volume = 0.5;
gameMusic.loop = true;

// Definição do porquinho-da-índia
const player = {
  x: 180,
  y: 550,
  width: 50,
  height: 50,
  velocityY: 0,
  velocityX: 0,
  speed: 5,
  gravity: 0.2,
  jumpPower: -8
};

// Lista de plataformas
const platforms = [];
const platformCount = 6;
const platformWidth = 80;
const platformHeight = 10;

// Variáveis do jogo
let isGameRunning = false;
let isStartScreen = true;
let isGameOver = false;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let timeElapsed = 0;
let gameInterval;

// Partículas da tela de início
const startScreenParticles = [];
const START_SCREEN_PARTICLE_COUNT = 50;

function initStartScreenParticles() {
  for (let i = 0; i < START_SCREEN_PARTICLE_COUNT; i++) {
    startScreenParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.2,
      color: `hsl(${Math.random() * 360}, 100%, 70%)`,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: Math.random() * 0.02 - 0.01
    });
  }
}

function updateStartScreenParticles() {
  ctx.save();
  for (const particle of startScreenParticles) {
    particle.angle += particle.rotationSpeed;
    particle.x += Math.cos(particle.angle) * particle.speed;
    particle.y += Math.sin(particle.angle) * particle.speed;
    if (particle.x < 0) particle.x = canvas.width;
    if (particle.x > canvas.width) particle.x = 0;
    if (particle.y < 0) particle.y = canvas.height;
    if (particle.y > canvas.height) particle.y = 0;
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(startScreenImage, -200, 0, canvas.width * 2, canvas.height);
  updateStartScreenParticles();
  ctx.save();
  ctx.fillStyle = '#FFC5C5';
  ctx.font = 'bold 26px "Press Start 2P", cursive';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 5;
  ctx.fillText('Cupcake e Seus Três Filhos', canvas.width / 2, canvas.height * 0.5);
  ctx.restore();
  ctx.save();
  ctx.fillStyle = '#FFC5C5';
  ctx.font = '20px "Press Start 2P", cursive';
  ctx.fillText('Pressione "Enter" para começar', canvas.width / 7, canvas.height * 0.8);
  ctx.restore();
}

function createPlatforms() {
  platforms.length = 0;
  for (let i = 0; i < platformCount; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - platformWidth),
      y: i * 100,
      width: platformWidth,
      height: platformHeight,
      direction: Math.random() < 0.5 ? 1 : -1,
      speed: Math.random() * 2 + 1
    });
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 1 + 2;
    this.speedY = Math.random() * -3 - 1;
    this.speedX = Math.random() * 2 - 1;
    this.alpha = 1;
    this.color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, ${this.alpha})`;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha -= 0.02;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
  }
}

const particles = [];
function createParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    particles.push(new Particle(x, y));
  }
}

function startGame() {
  if (!isGameRunning) {
    isGameRunning = true;
    isGameOver = false;
    score = 0;
    timeElapsed = 0;
    player.y = 550;
    player.velocityY = player.jumpPower;
    createPlatforms();
    gameLoop();
    gameInterval = setInterval(updateTime, 1000);
    document.getElementById("startButton").style.display = "none";
    gameMusic.play();
  }
}

function updateTime() {
  timeElapsed++;
  if (timeElapsed % 10 === 0) {
    platforms.forEach(platform => {
      platform.y += 1;
    });
  }
}

const MAX_JUMP_HEIGHT = 10;

function gameLoop() {
  if (isStartScreen) {
    drawStartScreen();
    requestAnimationFrame(gameLoop);
    return;
  }
  if (!isGameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  player.velocityY += player.gravity;
  player.y += player.velocityY;
  player.x += player.velocityX;
  player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));

  if (player.y > canvas.height) {
    endGame();
    return;
  }

  if (player.y < MAX_JUMP_HEIGHT) {
    player.y = MAX_JUMP_HEIGHT;
    player.velocityY = 0;
  }

  ctx.drawImage(pigImage, player.x, player.y, player.width, player.height);

  particles.forEach((particle, index) => {
    particle.update();
    particle.draw(ctx);
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    }
  });

  platforms.forEach(platform => {
    platform.y += 2;
    platform.x += platform.direction * platform.speed;
    if (platform.x <= 0 || platform.x + platform.width >= canvas.width) {
      platform.direction *= -1;
    }
    if (platform.y > canvas.height) {
      platform.y = -10;
      platform.x = Math.random() * (canvas.width - platform.width);
      score++;
      document.getElementById("score").innerText = "Pontuação: " + score;
    }
    ctx.drawImage(platformImage, platform.x, platform.y, platform.width, platform.height);
    if (
      player.velocityY > 0 &&
      player.y + player.height > platform.y &&
      player.y + player.height < platform.y + platform.height &&
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.width
    ) {
      player.velocityY = player.jumpPower;
      jumpSound.play();
      createParticles(player.x + player.width / 2, player.y + player.height);
    }
  });

  requestAnimationFrame(gameLoop);
}

function endGame() {
  isGameRunning = false;
  isGameOver = true;
  clearInterval(gameInterval);
  gameMusic.pause();
  gameMusic.currentTime = 0;

  // Atualiza o high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }

  // Exibe tela de game over
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);
  ctx.fillText("Pontuação: " + score, canvas.width / 2, canvas.height / 2 + 20);
  ctx.fillText("Recorde: " + highScore, canvas.width / 2, canvas.height / 2 + 60);
  ctx.fillText("Pressione Enter", canvas.width / 2, canvas.height / 2 + 100);
}

// Controles
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") {
    player.velocityX = -player.speed;
  } else if (e.key === "ArrowRight") {
    player.velocityX = player.speed;
  } else if (e.key === "Enter") {
    if (isStartScreen) {
      isStartScreen = false;
      startGame();
    } else if (isGameOver) {
      isGameOver = false;
      startGame();
    }
  }
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    player.velocityX = 0;
  }
});

// Iniciar partículas da tela de início
initStartScreenParticles();
gameLoop();
