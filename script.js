// Configurações do jogo
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 600;

let gameOverParticles = [];

// Carregar imagens
const startScreenImage = new Image();
startScreenImage.src = "imgs/teladeinicio.jpg";

const pigImage = new Image();
pigImage.src = "imgs/pig2.png";

const platformImage = new Image();
platformImage.src = "imgs/fundo.png";

const backgroundImage = new Image();
backgroundImage.src = "imgs/fundo.jpg";

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
  jumpPower: -8,
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
      rotationSpeed: Math.random() * 0.02 - 0.01,
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
  // Limpa a tela
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenha o background esticado
  ctx.drawImage(startScreenImage, -275, 0, canvas.width * 2.4, canvas.height);

  // Atualiza partículas
  updateStartScreenParticles();

  // --------- TÍTULO ESTILIZADO ---------
  ctx.save();
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "#FF9EE7"); // rosa
  gradient.addColorStop(0.5, "#C7AFFF"); // roxo claro
  gradient.addColorStop(1, "#9EEFFF"); // azul claro

  ctx.fillStyle = gradient;
  ctx.font = 'bold 28px "Press Start 2P", cursive';
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.strokeText("Cupcake e Seus Três Filhos", canvas.width / 2, canvas.height * 0.5);
  ctx.fillText("Cupcake e Seus Três Filhos", canvas.width / 2, canvas.height * 0.5);
  ctx.restore();

  // --------- TEXTO "Pressione Enter" COM PISCAR ---------
  ctx.save();
  ctx.font = '16px "Press Start 2P", cursive';
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 5;

  // Efeito de piscar (alfa alternando)
  const blinkAlpha = 0.6 + 0.4 * Math.sin(Date.now() * 0.005);
  ctx.globalAlpha = blinkAlpha;

  ctx.fillStyle = "#FFC5C5";
  ctx.fillText('Pressione "Enter" para começar', canvas.width / 2, canvas.height * 0.75);
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
      speed: Math.random() * 2 + 1,
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
    this.color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
      Math.random() * 255
    }, ${this.alpha})`;
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

// ------------------- PARTICULAS DO GAME OVER ---------------------
class GameOverParticle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 2;
    this.speedX = (Math.random() - 0.5) * 2;
    this.speedY = (Math.random() - 0.5) * 2;
    this.alpha = 1;
    this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha -= 0.005;
    if (this.alpha < 0) this.alpha = 0;
  }
  draw() {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function initGameOverParticles() {
  gameOverParticles = [];
  for (let i = 0; i < 100; i++) {
    gameOverParticles.push(new GameOverParticle());
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

function drawArcadeText(text, y) {
  ctx.save();
  ctx.translate(canvas.width / 2, y);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Fonte pixelada retro
  ctx.font = 'bold 32px "Press Start 2P", cursive';

  // Contorno
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#000";
  ctx.strokeText(text, 0, 0);

  // Preenchimento principal
  ctx.fillStyle = "#FFC5C5";
  ctx.fillText(text, 0, 0);

  // Glow (brilho)
  ctx.shadowColor = "#FF5E5E";
  ctx.shadowBlur = 15;
  ctx.fillText(text, 0, 0);

  ctx.restore();
}


function updateTime() {
  timeElapsed++;
  if (timeElapsed % 10 === 0) {
    platforms.forEach((platform) => {
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

  platforms.forEach((platform) => {
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
    ctx.drawImage(
      platformImage,
      platform.x,
      platform.y,
      platform.width,
      platform.height
    );
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
  initGameOverParticles();

  // Atualiza o high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }

  // Exibe tela de Game Over com partículas e menu arcade
  function drawGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Partículas de game over
    gameOverParticles.forEach((p) => {
      p.update();
      p.draw();
    });

    // Texto em arco estilo fliperama
    drawArcadeText("GAME OVER", 100, canvas.height / 2 - 50);

    // Pontuação
    ctx.fillStyle = "white";
    ctx.font = "20px 'Press Start 2P', cursive";
    ctx.textAlign = "center";
    ctx.fillText(
      `Pontuação: ${score}`,
      canvas.width / 2,
      canvas.height / 2 + 50
    );
    ctx.fillText(
      `Recorde: ${highScore}`,
      canvas.width / 2,
      canvas.height / 2 + 80
    );
    ctx.fillText("Pressione Enter", canvas.width / 2, canvas.height / 2 + 130);

    if (isGameOver) requestAnimationFrame(drawGameOver);
  }

  drawGameOver();
}

// Controles
document.addEventListener("keydown", (e) => {
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

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    player.velocityX = 0;
  }
});

// Iniciar partículas da tela de início
initStartScreenParticles();
gameLoop();
