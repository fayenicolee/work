const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

function createInitialState(size = 20) {
  const center = Math.floor(size / 2);
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center }
  ];

  return {
    size,
    snake,
    direction: "right",
    pendingDirection: "right",
    food: placeFood(snake, size),
    score: 0,
    gameOver: false,
    paused: false,
    started: false
  };
}

function isOppositeDirection(current, next) {
  return (
    (current === "up" && next === "down") ||
    (current === "down" && next === "up") ||
    (current === "left" && next === "right") ||
    (current === "right" && next === "left")
  );
}

function applyDirection(state, nextDirection) {
  if (!DIRECTIONS[nextDirection]) return state;
  if (isOppositeDirection(state.direction, nextDirection)) return state;
  return { ...state, pendingDirection: nextDirection };
}

function tick(state, rng = Math.random) {
  if (state.gameOver || state.paused || !state.started) {
    return state;
  }

  const direction = state.pendingDirection;
  const velocity = DIRECTIONS[direction];
  const head = state.snake[0];
  const nextHead = { x: head.x + velocity.x, y: head.y + velocity.y };

  const hitWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.size ||
    nextHead.y >= state.size;

  if (hitWall || collidesWithBody(nextHead, state.snake)) {
    return { ...state, direction, gameOver: true };
  }

  const ateFood = nextHead.x === state.food.x && nextHead.y === state.food.y;
  const grownSnake = [nextHead, ...state.snake];
  const snake = ateFood ? grownSnake : grownSnake.slice(0, -1);

  return {
    ...state,
    snake,
    direction,
    food: ateFood ? placeFood(snake, state.size, rng) : state.food,
    score: ateFood ? state.score + 1 : state.score
  };
}

function togglePause(state) {
  if (!state.started || state.gameOver) return state;
  return { ...state, paused: !state.paused };
}

function startGame(state) {
  return { ...state, started: true, paused: false, gameOver: false };
}

function placeFood(snake, size, rng = Math.random) {
  const openCells = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!snake.some((segment) => segment.x === x && segment.y === y)) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return snake[0];
  }

  const index = Math.floor(rng() * openCells.length);
  return openCells[index];
}

function collidesWithBody(head, snake) {
  return snake.some((segment) => segment.x === head.x && segment.y === head.y);
}

const board = document.getElementById("board");
const ctx = board.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const touchButtons = document.querySelectorAll("[data-dir]");

const gridSize = 20;
const tickMs = 130;
const cellSize = board.width / gridSize;

let state = createInitialState(gridSize);
let highScore = 0;

const keyToDirection = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  a: "left",
  s: "down",
  d: "right"
};

function draw() {
  ctx.clearRect(0, 0, board.width, board.height);
  drawGrid();

  ctx.fillStyle = getCssVar("--food");
  ctx.fillRect(
    state.food.x * cellSize,
    state.food.y * cellSize,
    cellSize,
    cellSize
  );

  ctx.fillStyle = getCssVar("--snake");
  for (const segment of state.snake) {
    ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
  }

  scoreEl.textContent = String(state.score);
  highScoreEl.textContent = String(highScore);
  pauseBtn.textContent = state.paused ? "Resume" : "Pause";

  if (!state.started) {
    statusEl.textContent = "Press Start to play.";
  } else if (state.gameOver) {
    statusEl.textContent = "Game over. Press Start / Restart.";
  } else if (state.paused) {
    statusEl.textContent = "Paused.";
  } else {
    statusEl.textContent = "Playing.";
  }
}

function drawGrid() {
  ctx.strokeStyle = "#eef1f4";
  ctx.lineWidth = 1;

  for (let i = 1; i < gridSize; i += 1) {
    const p = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, board.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(board.width, p);
    ctx.stroke();
  }
}

function gameLoop() {
  state = tick(state);
  if (state.score > highScore) {
    highScore = state.score;
  }
  draw();
}

function restart() {
  state = startGame(createInitialState(gridSize));
  draw();
}

function handleDirection(direction) {
  if (!DIRECTIONS[direction]) return;
  state = applyDirection(state, direction);
  draw();
}

startBtn.addEventListener("click", restart);
pauseBtn.addEventListener("click", () => {
  state = togglePause(state);
  draw();
});

window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

  if (key === " ") {
    event.preventDefault();
    state = togglePause(state);
    draw();
    return;
  }

  const direction = keyToDirection[key];
  if (direction) {
    event.preventDefault();
    handleDirection(direction);
  }
});

for (const button of touchButtons) {
  button.addEventListener("click", () => {
    handleDirection(button.dataset.dir);
  });
}

setInterval(gameLoop, tickMs);
draw();

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
