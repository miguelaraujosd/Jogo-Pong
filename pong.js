// 1. Configuração Inicial do Canvas
const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d") // O contexto 2D para desenhar

// 2. Variáveis do Jogo
const PADDLE_WIDTH = 10
const PADDLE_HEIGHT = 100
const BALL_SIZE = 10 // Raio da bola

let player1Score = 0
let player2Score = 0
const MAX_SCORE = 5

// Estado do jogo
let isPaused = false
let animationFrameId

// Configurações de dificuldade por nível
const DIFFICULTY_SETTINGS = {
  easy: {
    ballSpeed: 4,
    aiSpeed: 3,
  },
  medium: {
    ballSpeed: 6,
    aiSpeed: 5,
  },
  hard: {
    ballSpeed: 10,
    aiSpeed: 9,
  },
}

let currentDifficulty = "medium"
let ballSpeed
let aiSpeed

// Variáveis para modo de jogo
let gameMode = "ai" // "ai" ou "multiplayer"
let isMultiplayer = false

// Variáveis para estilos selecionados
let currentBallStyle = "white"
let player1PaddleColor = "white"
let player2PaddleColor = "white"
let currentScenario = "default"

// Objetos Image para as bolinhas texturizadas
const basketballImage = new Image()
basketballImage.src = "https://upload.wikimedia.org/wikipedia/commons/7/7a/Basketball.png"

const footballImage = new Image()
footballImage.src = "https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg"

// Certifique-se de que as imagens são carregadas antes de tentar desenhá-las
let imagesLoaded = 0
const totalImages = 2

function imageLoaded() {
  imagesLoaded++
  if (imagesLoaded === totalImages) {
    console.log("Todas as imagens carregadas. Iniciando o jogo.")
    initializeGame()
  }
}

basketballImage.onload = imageLoaded
footballImage.onload = imageLoaded

// Posição e velocidade da bola
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  dx: 0,
  dy: 0,
}

// Posição das raquetes
const player1 = {
  x: 0,
  y: (canvas.height - PADDLE_HEIGHT) / 2,
  dy: 0,
}

const player2 = {
  x: canvas.width - PADDLE_WIDTH,
  y: (canvas.height - PADDLE_HEIGHT) / 2,
  dy: 0,
}

// Teclas pressionadas
const keysPressed = {}

// 3. Funções de Desenho
function drawRect(x, y, width, height, color) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, width, height)
}

// Função para desenhar cenário de campo de futebol
function drawFootballField() {
  ctx.fillStyle = "#228B22"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = "white"
  ctx.lineWidth = 3

  ctx.beginPath()
  ctx.moveTo(canvas.width / 2, 0)
  ctx.lineTo(canvas.width / 2, canvas.height)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = "white"
  ctx.beginPath()
  ctx.arc(canvas.width / 2, canvas.height / 2, 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = "white"
  ctx.lineWidth = 3
  ctx.strokeRect(0, canvas.height / 2 - 80, 60, 160)
  ctx.strokeRect(0, canvas.height / 2 - 40, 20, 80)

  ctx.strokeRect(canvas.width - 60, canvas.height / 2 - 80, 60, 160)
  ctx.strokeRect(canvas.width - 20, canvas.height / 2 - 40, 20, 80)

  ctx.strokeRect(0, 0, canvas.width, canvas.height)

  const cornerRadius = 15
  ctx.beginPath()
  ctx.arc(0, 0, cornerRadius, 0, Math.PI / 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(canvas.width, 0, cornerRadius, Math.PI / 2, Math.PI)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0, canvas.height, cornerRadius, -Math.PI / 2, 0)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(canvas.width, canvas.height, cornerRadius, Math.PI, -Math.PI / 2)
  ctx.stroke()
}

// Função para desenhar cenário de quadra de basquete
function drawBasketballCourt() {
  ctx.fillStyle = "#DEB887"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = "#8B4513"
  ctx.lineWidth = 2

  ctx.beginPath()
  ctx.moveTo(canvas.width / 2, 0)
  ctx.lineTo(canvas.width / 2, canvas.height)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeRect(0, canvas.height / 2 - 90, 80, 180)
  ctx.strokeRect(canvas.width - 80, canvas.height / 2 - 90, 80, 180)

  ctx.beginPath()
  ctx.arc(80, canvas.height / 2, 60, -Math.PI / 2, Math.PI / 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(canvas.width - 80, canvas.height / 2, 60, Math.PI / 2, -Math.PI / 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0, canvas.height / 2, 120, -Math.PI / 3, Math.PI / 3)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(canvas.width, canvas.height / 2, 120, (Math.PI * 2) / 3, (Math.PI * 4) / 3)
  ctx.stroke()

  ctx.strokeRect(0, 0, canvas.width, canvas.height)
}

// Função para desenhar cenário espacial
function drawSpaceScenario() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, "#000011")
  gradient.addColorStop(0.5, "#000033")
  gradient.addColorStop(1, "#000011")

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = "white"
  for (let i = 0; i < 50; i++) {
    const x = (i * 17) % canvas.width
    const y = (i * 23) % canvas.height
    const size = (i % 3) + 1

    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.strokeStyle = "#00FFFF"
  ctx.lineWidth = 2
  ctx.setLineDash([10, 5])
  ctx.beginPath()
  ctx.moveTo(canvas.width / 2, 0)
  ctx.lineTo(canvas.width / 2, canvas.height)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.strokeStyle = "#00FFFF"
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(50, canvas.height / 2, 40, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(canvas.width - 50, canvas.height / 2, 40, 0, Math.PI * 2)
  ctx.stroke()
}

// Função para desenhar o cenário selecionado
function drawScenario() {
  switch (currentScenario) {
    case "football":
      drawFootballField()
      break
    case "basketball":
      drawBasketballCourt()
      break
    case "space":
      drawSpaceScenario()
      break
    case "default":
    default:
      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      drawRect(canvas.width / 2 - 2, 0, 4, canvas.height, "gray")
      break
  }
}

// Função para desenhar a bolinha com base no estilo
function drawBall(x, y, radius, style) {
  if (style === "white") {
    drawCircle(x, y, radius, "white")
  } else if (style === "basketball") {
    ctx.drawImage(basketballImage, x - radius, y - radius, radius * 2, radius * 2)
  } else if (style === "football") {
    ctx.drawImage(footballImage, x - radius, y - radius, radius * 2, radius * 2)
  }
}

function drawCircle(x, y, radius, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2, false)
  ctx.fill()
}

function drawText(text, x, y, color = "white", size = 40, align = "center") {
  ctx.fillStyle = color
  ctx.font = `${size}px Arial`
  ctx.textAlign = align
  ctx.fillText(text, x, y)
}

// 4. Lógica de Atualização do Jogo
function update() {
  if (isPaused) return

  ball.x += ball.dx
  ball.y += ball.dy

  if (ball.y + BALL_SIZE > canvas.height || ball.y < 0) {
    ball.dy *= -1
  }

  if (
    ball.x - BALL_SIZE < PADDLE_WIDTH &&
    ball.y + BALL_SIZE > player1.y &&
    ball.y - BALL_SIZE < player1.y + PADDLE_HEIGHT
  ) {
    ball.dx *= -1
    ball.dx *= currentDifficulty === "hard" ? 1.07 : 1.05
    ball.dy *= currentDifficulty === "hard" ? 1.07 : 1.05
    ball.x = PADDLE_WIDTH + BALL_SIZE
  }

  if (
    ball.x + BALL_SIZE > canvas.width - PADDLE_WIDTH &&
    ball.y + BALL_SIZE > player2.y &&
    ball.y - BALL_SIZE < player2.y + PADDLE_HEIGHT
  ) {
    ball.dx *= -1
    ball.dx *= currentDifficulty === "hard" ? 1.07 : 1.05
    ball.dy *= currentDifficulty === "hard" ? 1.07 : 1.05
    ball.x = canvas.width - PADDLE_WIDTH - BALL_SIZE
  }

  if (ball.x < 0) {
    player2Score++
    resetRound()
  } else if (ball.x + BALL_SIZE > canvas.width) {
    player1Score++
    resetRound()
  }

  // Controles do Jogador 1 (W/S)
  if (keysPressed["w"] && player1.y > 0) {
    player1.y -= 7
  }
  if (keysPressed["s"] && player1.y + PADDLE_HEIGHT < canvas.height) {
    player1.y += 7
  }

  // Controles do Jogador 2 (IA ou Multiplayer)
  if (isMultiplayer) {
    // Controles do Jogador 2 no modo multiplayer (Setas do teclado)
    if (keysPressed["arrowup"] && player2.y > 0) {
      player2.y -= 7
    }
    if (keysPressed["arrowdown"] && player2.y + PADDLE_HEIGHT < canvas.height) {
      player2.y += 7
    }
  } else {
    // IA do Jogador 2 (modo vs IA)
    const player2Center = player2.y + PADDLE_HEIGHT / 2
    if (ball.y > player2Center && player2.y + PADDLE_HEIGHT < canvas.height) {
      player2.y += aiSpeed
    } else if (ball.y < player2Center && player2.y > 0) {
      player2.y -= aiSpeed
    }
  }

  if (player1Score >= MAX_SCORE || player2Score >= MAX_SCORE) {
    const winner = player1Score >= MAX_SCORE ? "Jogador 1" : "Jogador 2"
    isPaused = true
    drawText(`${winner} Venceu!`, canvas.width / 2, canvas.height / 2, "gold", 60)
    drawText("Pressione Reiniciar", canvas.width / 2, canvas.height / 2 + 70, "white", 25)
    return
  }
}

function resetRound() {
  ball.x = canvas.width / 2
  ball.y = canvas.height / 2

  ball.dx = (Math.random() > 0.5 ? 1 : -1) * ballSpeed
  ball.dy = (Math.random() > 0.5 ? 1 : -1) * ballSpeed

  player1.y = (canvas.height - PADDLE_HEIGHT) / 2
  player2.y = (canvas.height - PADDLE_HEIGHT) / 2
}

// 5. Função de Desenho Principal
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  drawScenario()

  drawRect(player1.x, player1.y, PADDLE_WIDTH, PADDLE_HEIGHT, player1PaddleColor)
  drawRect(player2.x, player2.y, PADDLE_WIDTH, PADDLE_HEIGHT, player2PaddleColor)

  drawBall(ball.x, ball.y, BALL_SIZE, currentBallStyle)

  drawText(player1Score, canvas.width / 4, 50, "white", 50)
  drawText(player2Score, (3 * canvas.width) / 4, 50, "white", 50)

  if (isPaused && player1Score < MAX_SCORE && player2Score < MAX_SCORE) {
    drawText("PAUSADO", canvas.width / 2, canvas.height / 2, "red", 60)
  }
}

// 6. Game Loop
function gameLoop() {
  update()
  draw()
  animationFrameId = requestAnimationFrame(gameLoop)
}

// 7. Funções de Controle de Jogo
function togglePause() {
  isPaused = !isPaused
  const pauseButton = document.getElementById("pauseButton")
  if (isPaused) {
    pauseButton.textContent = "Continuar"
  } else {
    pauseButton.textContent = "Pause"
  }
}

function restartGame() {
  player1Score = 0
  player2Score = 0
  resetRound()
  isPaused = false
  document.getElementById("pauseButton").textContent = "Pause"
}

function setDifficulty(level) {
  currentDifficulty = level
  ballSpeed = DIFFICULTY_SETTINGS[currentDifficulty].ballSpeed
  aiSpeed = DIFFICULTY_SETTINGS[currentDifficulty].aiSpeed
  restartGame()
  console.log(`Dificuldade definida para: ${currentDifficulty}`)
}

// Função para definir o modo de jogo
function setGameMode(mode) {
  gameMode = mode
  isMultiplayer = mode === "multiplayer"

  // Atualizar as instruções de controle na interface
  updateControlsDisplay()

  restartGame()
  console.log(`Modo de jogo: ${isMultiplayer ? "Multiplayer" : "vs IA"}`)
}

// Função para atualizar as instruções de controle
function updateControlsDisplay() {
  const player2Controls = document.getElementById("player2Controls")

  if (isMultiplayer) {
    player2Controls.textContent = "Jogador 2: ↑ (cima) / ↓ (baixo)"
  } else {
    player2Controls.textContent = "Jogador 2: IA Automática"
  }
}

function setBallStyle(style) {
  currentBallStyle = style
  console.log(`Estilo da bolinha: ${currentBallStyle}`)
}

function setPlayer1PaddleColor(color) {
  player1PaddleColor = color
  console.log(`Cor da raquete do Jogador 1: ${player1PaddleColor}`)
}

function setPlayer2PaddleColor(color) {
  player2PaddleColor = color
  console.log(`Cor da raquete do Jogador 2: ${player2PaddleColor}`)
}

function setScenario(scenario) {
  currentScenario = scenario
  console.log(`Cenário definido para: ${currentScenario}`)
}

// 8. MODIFICADO: Manipulação de Eventos de Teclado
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase()
  keysPressed[key] = true

  // Prevenir scroll da página para teclas de movimento
  if (key === "arrowup" || key === "arrowdown" || key === "w" || key === "s") {
    event.preventDefault()
  }

  // MODIFICADO: Ambas as teclas P e ESC funcionam como toggle
  if (key === "p" || key === "escape") {
    togglePause()
    if (key === "escape") {
      console.log("Jogo pausado/despausado com ESC")
    } else {
      console.log("Jogo pausado/despausado com P")
    }
  }
})

document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase()
  keysPressed[key] = false

  // Prevenir scroll da página para teclas de movimento
  if (key === "arrowup" || key === "arrowdown" || key === "w" || key === "s") {
    event.preventDefault()
  }
})

// Event listener para clique direito do mouse (pausar jogo)
document.addEventListener("contextmenu", (event) => {
  // Verificar se o clique foi fora dos botões e seletores
  const target = event.target

  // Se não for um botão, select ou input, pausar o jogo
  if (target.tagName !== "BUTTON" && target.tagName !== "SELECT" && target.tagName !== "INPUT") {
    event.preventDefault() // Prevenir o menu de contexto padrão
    togglePause()
    console.log("Jogo pausado/despausado pelo clique direito")
  }
})

// 9. Manipulação de Eventos dos Botões e Seletores
document.getElementById("pauseButton").addEventListener("click", togglePause)
document.getElementById("restartButton").addEventListener("click", restartGame)

document.getElementById("difficulty").addEventListener("change", (event) => {
  setDifficulty(event.target.value)
})

// Event listener para o modo de jogo
document.getElementById("gameMode").addEventListener("change", (event) => {
  setGameMode(event.target.value)
})

document.getElementById("ballStyle").addEventListener("change", (event) => {
  setBallStyle(event.target.value)
})

document.getElementById("player1PaddleColor").addEventListener("change", (event) => {
  setPlayer1PaddleColor(event.target.value)
})

document.getElementById("player2PaddleColor").addEventListener("change", (event) => {
  setPlayer2PaddleColor(event.target.value)
})

document.getElementById("scenario").addEventListener("change", (event) => {
  setScenario(event.target.value)
})

// Função para inicializar o jogo
function initializeGame() {
  setDifficulty(document.getElementById("difficulty").value)
  setGameMode(document.getElementById("gameMode").value)
  setBallStyle(document.getElementById("ballStyle").value)
  setPlayer1PaddleColor(document.getElementById("player1PaddleColor").value)
  setPlayer2PaddleColor(document.getElementById("player2PaddleColor").value)
  setScenario(document.getElementById("scenario").value)

  resetRound()
  gameLoop()
}

if (totalImages === 0) {
  initializeGame()
}
