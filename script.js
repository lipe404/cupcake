const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 600;

// Carregar imagens
const pigImage = new Image();
pigImage.src = 'imgs/pig2.png'; // Substitua pelo caminho da sua imagem do porquinho

const platformImage = new Image();
platformImage.src = 'imgs/fundo.png'; // Substitua pelo caminho da sua imagem da plataforma

const backgroundImage = new Image();
backgroundImage.src = 'imgs/fundo.jpg'; // Substitua pelo caminho da sua imagem de fundo

// Definição do porquinho-da-índia
const player = {
  x: 180,
  y: 550, // Começa no chão
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

function createPlatforms() {
  platforms.length = 0; // Limpa a lista de plataformas
  for (let i = 0; i < platformCount; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - platformWidth),
      y: i * 100,
      width: platformWidth,
      height: platformHeight
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
  if (!isGameRunning) {
    isGameRunning = true;
    score = 0; // Reseta a pontuação
    timeElapsed = 0; // Reseta o tempo
    player.y = 550; // Reseta a posição do jogador
    player.velocityY = player.jumpPower; // Reseta a velocidade vertical
    createPlatforms(); // Cria novas plataformas
    gameLoop();
    gameInterval = setInterval(updateTime, 1000); // Atualiza o tempo a cada segundo
    document.getElementById("startButton").innerText = "Reiniciar Jogo"; // Muda o texto do botão
    document.getElementById("startButton").style.display = "none"; // Esconde o botão
  } else {
    endGame(); // Se o jogo já está rodando, termina o jogo
  }
}

function updateTime() {
  timeElapsed++;
  if (timeElapsed % 10 === 0) { // Aumenta a dificuldade a cada 10 segundos
    platforms.forEach(platform => {
      platform.y += 1; // Aumenta a velocidade das plataformas
    });
  }
}

const MAX_JUMP_HEIGHT = 10; // Altura máxima que o porquinho pode pular

function gameLoop() {
  if (!isGameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Desenha o fundo
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

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

  // Limita a altura do salto
  if (player.y < MAX_JUMP_HEIGHT) {
    player.y = MAX_JUMP_HEIGHT; // Impede que o porquinho suba além do teto
    player.velocityY = 0; // Reseta a velocidade vertical para evitar que continue subindo
  }

  // Desenha o porquinho
  ctx.drawImage(pigImage, player.x, player.y, player.width, player.height);

  // Atualiza plataformas e verifica colisão
  platforms.forEach((platform) => {
    platform.y += 2; // Move as plataformas para baixo
    if (platform.y > canvas.height) {
      platform.y = -10;
      platform.x = Math.random() * (canvas.width - platform.width);
      score++;
      document.getElementById("score").innerText = "Pontuação: " + score;
    }

    // Desenha a plataforma
    ctx.drawImage(platformImage, platform.x, platform.y, platform.width, platform.height);

    // Detecção de colisão
    if (
      player.velocityY > 0 &&
      player.y + player.height > platform.y &&
      player.y + player.height < platform.y + platform.height &&
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.width
    ) {
      player.velocityY = player.jumpPower; // Permite que o porquinho pule novamente
    }
  });

  requestAnimationFrame(gameLoop);
}

function endGame() {
  isGameRunning = false;
  clearInterval(gameInterval);

  // Atualiza a pontuação final
  document.getElementById("finalScore").innerText = score;

  // Exibe a mensagem de Game Over
  document.getElementById("gameOverMessage").classList.remove("hidden");
  document.getElementById("startButton").classList.add("hidden"); // Esconde o botão de iniciar

  // Adiciona evento para reiniciar o jogo
  document.getElementById("restartButton").onclick = function() {
      document.getElementById("gameOverMessage").classList.add("hidden");
      document.getElementById("startButton").classList.remove("hidden"); // Mostra o botão de iniciar novamente
      startGame(); // Reinicia o jogo
  };
}