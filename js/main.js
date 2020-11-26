const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

// change grid according to canvas width and heigth so number of grid remains constant
// this can only work if aspect ratio remains constant (it does)
// const grid = 25; // Size is 500*500 so 40x40grid
// How the function works, i need the grid to alwyas be 20x20(pixels?), so if y divide 650 by 26 i get 25,
// so i divide the the current width to always get 25, later on, grid WILL divide the width, so
// grid is just a divider number(25) because 650/25 = 26, and 500/25 = 20, so grid stays at 26x20
let grid;
const pixelSize = 25;
function calcGridDivider() {
  let w = canvas.getBoundingClientRect().width;
  let h = canvas.getBoundingClientRect().height;

  grid = w / pixelSize; // w numero de pixeles que quiero
}

window.onload = calcGridDivider();
window.addEventListener("resize", () => {
  calcGridDivider();
});

const snakeStartxPos = 160;
const snakeStartypos = 160;
const SnakeStartSize = 4;
const frameDivider = 4; // 60 / 4 = 15 fps
let score = 0;
let gameState = false;
let keyDownEvent;
let killInput = false;

// Get random int from 0 to max
let getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

var snake = {
  // Snake pos
  x: snakeStartxPos,
  y: snakeStartypos,

  // Snake velocity (moves 1 grid per frame)
  dx: grid,
  dy: 0,
  cells: [],
  maxCells: SnakeStartSize,
};

var burger = {
  // TODO: start at random position not ocuppied by snake
  x: getRandomInt(pixelSize) * grid,
  y: getRandomInt(pixelSize) * grid,
  image: new Image(),
};

burger.image.src = "./img/b0.png";

function gameRestart() {
  gameState = 1;
  snake.x = snakeStartxPos;
  snake.y = snakeStartypos;
  snake.cells = [];
  snake.maxCells = SnakeStartSize;
  burger.x = getRandomInt(pixelSize) * grid;
  burger.y = getRandomInt(pixelSize) * grid;
  score = 0;
  gameStart();
}
let blinkReq;
function gameEnd() {
  cancelAnimationFrame(req);
  let toggle = true;
  // Display score and add overlay
  //context.clearRect(0, 0, 500, 500); // Clear canvas
  context.shadowBlur = 10;
  context.shadowColor = "white";
  context.fillStyle = "white";
  context.font = "40px 'Press Start 2P'";
  context.fillText("Game over", 75, 200);
  context.font = "10px 'Press Start 2P'";
  context.fillText(`Obtuviste un puntaje de ${score} pts`, 100, 250);

  let blinkFrameCount = 0;

  window.setTimeout(function blink() {
    killInput = false;
    if (gameState === 1) {
      return;
    }
    blinkReq = requestAnimationFrame(blink);
    if (++blinkFrameCount < 30) {
      return;
    }
    blinkFrameCount = 0;

    if (toggle) {
      context.fillText("Oprime una tecla para continuar", 95, 300);
    } else {
      context.clearRect(0, 275, canvas.getBoundingClientRect().width, 40);
    }
    toggle = !toggle;
  }, 600);
}

function gameStart() {
  requestAnimationFrame(gameloop);
}

let req;

let frameCount = 0;
function gameloop() {
  req = requestAnimationFrame(gameloop); // Request a frame before it renders, call itself so it always updates

  if (++frameCount < 4) {
    return; // Wait until 4 requestAnimations frames, to get 15fps, current frame is the fourth
  }
  frameCount = 0;
  context.clearRect(
    0,
    0,
    canvas.getBoundingClientRect().width,
    canvas.getBoundingClientRect().height
  ); // Clear canvas

  snake.x += snake.dx;
  snake.y += snake.dy;

  // wrap snake position horizontally on edge of screen
  if (snake.x < 0) {
    snake.x = canvas.getBoundingClientRect().width - grid;
  } else if (snake.x >= canvas.getBoundingClientRect().height) {
    snake.x = 0;
  }

  // wrap snake position vertically on edge of screen
  if (snake.y < 0) {
    snake.y = canvas.getBoundingClientRect().height - grid;
  } else if (snake.y >= canvas.getBoundingClientRect().height) {
    snake.y = 0;
  }
  // remove cells as we move away from them
  if (snake.cells.length > snake.maxCells) {
    snake.cells.pop();
  }

  // keep track of where snake has been. front of the array is always the head
  snake.cells.unshift({ x: snake.x, y: snake.y });
  // draw snake one cell at a time

  if (gameState === 0) {
    gameEnd();
    return;
  }
  drawScreen();
}

// Prevent snake from eating itself, and ignore double preses
document.addEventListener("keydown", (keyDownEvent) => {
  if (gameState === 0 && !killInput) {
    cancelAnimationFrame(blinkReq);
    gameRestart();
  }
  if (
    (keyDownEvent.key === "a" || keyDownEvent.key === "ArrowLeft") &&
    snake.dx === 0
  ) {
    snake.dx = -grid;
    snake.dy = 0;
  }
  // up arrow key
  else if (
    (keyDownEvent.key === "w" || keyDownEvent.key === "ArrowUp") &&
    snake.dy === 0
  ) {
    snake.dy = -grid;
    snake.dx = 0;
  }
  // right arrow key
  else if (
    (keyDownEvent.key === "d" || keyDownEvent.key === "ArrowRight") &&
    snake.dx === 0
  ) {
    snake.dx = grid;
    snake.dy = 0;
  }
  // down arrow key
  else if (
    (keyDownEvent.key === "s" || keyDownEvent.key === "ArrowDown") &&
    snake.dy === 0
  ) {
    snake.dy = grid;
    snake.dx = 0;
  }
});

function drawScreen() {
  context.fillStyle = "green";
  context.shadowBlur = 10;
  context.shadowColor = "green";
  snake.cells.forEach((cell, index) => {
    // drawing 1 px smaller than the grid creates a grid effect in the snake body so you can see how long it is
    context.fillRect(cell.x, cell.y, grid - 1, grid - 1);

    // snake ate burger
    if (cell.x === burger.x && cell.y === burger.y) {
      snake.maxCells++;
      score++;
      // canvas is 400x400 which is 25x25 grids
      burger.x = getRandomInt(pixelSize) * grid;
      burger.y = getRandomInt(pixelSize) * grid;
    }
    for (let i = index + 1; i < snake.cells.length; i++) {
      // snake occupies same space as a body part. reset game
      if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
        gameState = 0;
        killInput = true;
        return;
      }
    }
  });
  // draw burger
  context.shadowBlur = 5;
  context.shadowColor = "#d6991e";
  context.drawImage(burger.image, burger.x, burger.y, grid, grid);

  // draw score
  context.fillStyle = "white";
  context.shadowColor = "white";
  context.font = "12px 'Press Start 2P'";
  context.fillText(`SCORE ${score}`, 210, 30);
}

gameStart();
