const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 600;

// Definição do porquinho-da-índia
const player = {
  x: 180,
  y: 550, // Começa no chão
  width: 40,
  height: 40,
  color: "#ffcc00",
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

function createPlatforms() {
  platforms.length = 0; // Limpa a lista de plataformas
  for (let i = 0; i < platformCount; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - platformWidth),
      y: i * 100,
      width: platformWidth,
      height: platformHeight,
      color: "#ff00ff"
    });
  }
}

// Variáveis do jogo
let isGameRunning = false;
let score = 0;
let timeElapsed = 0;
let gameInterval;

// Inicia o jogo
document.getElementById("startButton").addEventListener("click", startGame);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    player.velocityX = -player.speed;
  } else if (event.key === "ArrowRight") {
    player.velocityX = player.speed;
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    player.velocityX = 0;
  }
});

function startGame() {
  isGameRunning = true;
  score = 0;
  timeElapsed = 0;
  player.y = 550; // Reseta a posição do jogador
  player.velocityY = player.jumpPower;
  createPlatforms();
  gameLoop();
  gameInterval = setInterval(updateTime, 1000); // Atualiza o tempo a cada segundo
}

function updateTime() {
  timeElapsed++;
  if (timeElapsed % 10 === 0) { // Aumenta a dificuldade a cada 10 segundos
    platforms.forEach(platform => {
      platform.y += 1; // Aumenta a velocidade das plataformas
    });
  }
}

function gameLoop() {
  if (!isGameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Atualiza a posição do jogador
  player.velocityY += player.gravity;
  player.y += player.velocityY;
  player.x += player.velocityX;

  // Mantém o jogador dentro da tela
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

  // Impede que caia da tela
  if (player.y > canvas.height) {
    endGame();
    return;
  }

  // Desenha o porquinho
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Atualiza plataformas e verifica colisão
  platforms.forEach((platform) => {
    platform.y += 2; // Move as plataformas para baixo
    if (platform.y > canvas.height) {
      platform.y = -10;
      platform.x = Math.random() * (canvas.width - platform.width);
      score++;
      document.getElementById("score").innerText = "Pontuação: " + score;
    }

    ctx.fillStyle = platform.color;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

    // Detecção de colisão
    if (
      player.velocityY > 0 &&
      player.y + player.height > platform.y &&
      player.y + player.height < platform.y + platform.height &&
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.width
    ) {
      player.velocityY = player.jumpPower;
    }
  });

  requestAnimationFrame(gameLoop);
}

function endGame() {
  isGameRunning = false;
  clearInterval(gameInterval);
  alert("Game Over! Sua pontuação: " + score);
  document.getElementById("startButton").innerText = "Reiniciar Jogo";
  document.getElementById("startButton").onclick = startGame; // Permite reiniciar o jogo
}