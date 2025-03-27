// Configurações do jogo
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 600;

// Carregar imagens
const pigImage = new Image();
pigImage.src = 'imgs/pig2.png';

const platformImage = new Image();
platformImage.src = 'imgs/fundo.png';

const backgroundImage = new Image();
backgroundImage.src = 'imgs/fundo.jpg';

// Carregar sons
const jumpSound = document.getElementById("jumpSound");
const gameMusic = document.getElementById("gameMusic");
gameMusic.volume = 0.3; // Define o volume
jumpSound.volume = 0.5; // Define o volume do som de pulo
gameMusic.loop = true; // Habilita o loop da música

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
let score = 0;
let timeElapsed = 0;
let gameInterval;

// Funções do jogo
function createPlatforms() {
  platforms.length = 0; // Limpa a lista de plataformas
  for (let i = 0; i < platformCount; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - platformWidth),
      y: i * 100,
      width: platformWidth,
      height: platformHeight,
      direction: Math.random() < 0.5 ? 1 : -1, // Direção aleatória (1 para direita, -1 para esquerda)
      speed: Math.random() * 2 + 1 // Velocidade aleatória entre 1 e 3
    });
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 1 + 2; // Tamanho aleatório da partícula
    this.speedY = Math.random() * -3 - 1; // Velocidade vertical aleatória
    this.speedX = Math.random() * 2 - 1; // Velocidade horizontal aleatória
    this.alpha = 1; // Opacidade inicial
    this.color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, ${this.alpha})`; // Cor aleatória
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha -= 0.02; // Diminui a opacidade
  }

  draw(ctx) {
    ctx.fillStyle = this.color; // Cor da partícula
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = this.color; // Adiciona sombra
    ctx.shadowBlur = 10; // Intensidade da sombra
  }
}

const particles = [];
function createParticles(x, y) {
  const particleCount = 10; // Número de partículas a serem geradas
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(x, y));
  }
}

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

    // Reproduz a música
    gameMusic.play(); // Inicia a música
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
  player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));

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

  // Atualiza e desenha partículas
  particles.forEach((particle, index) => {
    particle.update();
    particle.draw(ctx);
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    }
  });

  // Atualiza plataformas e verifica colisão
  platforms.forEach((platform) => {
    platform.y += 2; // Move as plataformas para baixo
    // Atualiza a posição horizontal da plataforma
    platform.x += platform.direction * platform.speed; // Move a plataforma na direção especificada
    
    // Verifica se a plataforma atingiu as bordas da tela
    if (platform.x <= 0 || platform.x + platform.width >= canvas.width) {
      platform.direction *= -1; // Inverte a direção
    }

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
      createParticles(player.x + player.width / 2, player.y + player.height); // Cria partículas na posição do porquinho
      jumpSound.currentTime = 0; // Reseta o tempo do som para que ele possa ser reproduzido novamente
      jumpSound.play(); // Inicia o som de pulo
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

// Eventos de controle
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