const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
let frameDivider = 6;
let score = 0;
let gameState = false;
let killInput = false;
let ranX;
let ranY;

let w = canvas.getBoundingClientRect().width;
let h = canvas.getBoundingClientRect().height;
const pixelSize = 16;
let grid = Math.floor(w / pixelSize);

// Get random int from 0 to max
let getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
};

let snake = {
    // Snake starting pos
    x: 160,
    y: 160,

    // Snake velocity (moves 1 grid per frame)
    dx: grid,
    dy: 0,
    cells: [],
    // Snake starting size
    maxCells: 3,
};

ranX = getRandomInt(pixelSize);
ranY = getRandomInt(pixelSize);
let burger = {
    // TODO: start at random position not ocuppied by snake
    x: ranX * grid,
    y: ranY * grid,
    image: new Image(),
};
burger.image.src = "./img/b0.png";

// change grid according to canvas width and heigth so number of grid remains constant
// this can only work if aspect ratio remains constant (it does)
// const grid = 25; // Size is 500*500 so 40x40grid
// How the function works, i need the grid to alwyas be 20x20(pixels?), so if y divide 650 by 26 i get 25,
// so i divide the the current width to always get 25, later on, grid WILL divide the width, so
// grid is just a divider number(25) because 650/25 = 26, and 500/25 = 20, so grid stays at 26x20

function calcGridDivider() {
    w = canvas.getBoundingClientRect().width;
    h = canvas.getBoundingClientRect().height;
    canvas.setAttribute("height", h);
    canvas.setAttribute("width", w);
    grid = Math.floor(w / pixelSize); // w numero de pixeles que quiero
    if (snake.dx !== 0) {
        if (snake.dx < 0) {
            snake.dx = -grid;
        } else {
            snake.dx = grid;
        }
    }
    if (snake.dy !== 0) {
        if (snake.dy < 0) {
            snake.dy = -grid;
        } else {
            snake.dy = grid;
        }
    }
    burger.x = ranX * grid;
    burger.y = ranY * grid;
}

window.onload = calcGridDivider();
window.addEventListener("resize", () => {
    calcGridDivider();
});

function gameRestart() {
    gameState = 1;
    snake.x = 160;
    snake.y = 160;
    snake.cells = [];
    snake.maxCells = 3;
    burger.x = getRandomInt(pixelSize) * grid;
    burger.y = getRandomInt(pixelSize) * grid;
    score = 0;
    frameDivider = 6;
    gameStart();
}

let endReq;
let blinkFrameCount = 0;
let toggle = true;

function gameEnd() {
    cancelAnimationFrame(req);
    endReq = requestAnimationFrame(gameEnd);
    let fontSize;
    // Display score and add overlay
    context.clearRect(0, 0, w, h); // Clear canvas
    context.shadowBlur = 10;
    context.shadowColor = "white";
    context.fillStyle = "white";
    fontSize = w / 12.5;
    context.font = `${fontSize}px 'Press Start 2P'`;
    context.fillText("Game over", w / 6.666, w / 2.5);
    fontSize = w / 40;
    context.font = `${fontSize}px 'Press Start 2P'`;
    context.fillText(`Obtuviste un puntaje de ${score} pts`, w / 7, w / 2);

    window.setTimeout(() => {
        killInput = false;
    }, 1000);

    if (gameState === 1) {
        cancelAnimationFrame(endReq);
        return;
    }
    blinkFrameCount++;
    if (blinkFrameCount >= 30) {
        toggle = !toggle;
        blinkFrameCount = 0;
    }
    if (toggle) {
        context.fillText("Oprime una tecla para continuar", w / 8, w / 1.666);
    }
}

function gameStart() {
    requestAnimationFrame(gameloop);
}

let req;
let frameCount = 0;
function gameloop() {
    req = requestAnimationFrame(gameloop); // Request a frame before it renders, call itself so it always updates

    if (++frameCount < frameDivider) {
        return; // Wait until x requestAnimations frames
    }
    frameCount = 0;
    context.clearRect(0, 0, w, h); // Clear canvas

    snake.x += snake.dx;
    snake.y += snake.dy;

    // wrap snake position horizontally on edge of screen
    if (snake.x < 0) {
        snake.x = w - grid;
    } else if (snake.x >= w) {
        snake.x = 0;
    }

    // wrap snake position vertically on edge of screen
    if (snake.y < 0) {
        snake.y = h - grid;
    } else if (snake.y >= h) {
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

// Input on desktop
// Prevent snake from eating itself, and ignore double preses
document.addEventListener("keydown", (e) => {
    if (gameState === 0 && !killInput) {
        cancelAnimationFrame(endReq);
        gameRestart();
    }
    if ((e.key === "a" || e.key === "ArrowLeft") && snake.dx === 0) {
        snake.dx = -grid;
        snake.dy = 0;
    }
    // up arrow key
    else if ((e.key === "w" || e.key === "ArrowUp") && snake.dy === 0) {
        snake.dy = -grid;
        snake.dx = 0;
    }
    // right arrow key
    else if ((e.key === "d" || e.key === "ArrowRight") && snake.dx === 0) {
        snake.dx = grid;
        snake.dy = 0;
    }
    // down arrow key
    else if ((e.key === "s" || e.key === "ArrowDown") && snake.dy === 0) {
        snake.dy = grid;
        snake.dx = 0;
    }
});

let mousePos = { x: 0, y: 0 };
canvas.addEventListener(
    "touchmove",
    function (e) {
        let touch = e.touches[0];
        let mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY,
        });
        canvas.dispatchEvent(mouseEvent);
    },
    false
);

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top,
    };
}

// Input for mobile
function handleInput(input) {
    document.getElementById("l").classList.remove("growAnimation");
    document.getElementById("u").classList.remove("growAnimation");
    document.getElementById("r").classList.remove("growAnimation");
    document.getElementById("d").classList.remove("growAnimation");

    // Check gamestate, if games is running (gameState === 1), skip next block
    if (gameState === 0 && !killInput) {
        cancelAnimationFrame(endReq);
        gameRestart();
    }
    if (input === "l" && snake.dx === 0) {
        snake.dx = -grid;
        snake.dy = 0;
        document.getElementById(input).classList.add("growAnimation");
    }
    // up arrow key
    else if (input === "u" && snake.dy === 0) {
        snake.dy = -grid;
        snake.dx = 0;
        document.getElementById(input).classList.add("growAnimation");
    }
    // right arrow key
    else if (input === "r" && snake.dx === 0) {
        snake.dx = grid;
        snake.dy = 0;
        document.getElementById(input).classList.add("growAnimation");
    }
    // down arrow key
    else if (input === "d" && snake.dy === 0) {
        snake.dy = grid;
        snake.dx = 0;
        document.getElementById(input).classList.add("growAnimation");
    }
}
function drawScreen() {
    context.fillStyle = "green";
    context.shadowBlur = 20;
    context.shadowColor = "green";
    snake.cells.forEach((cell, index) => {
        // drawing 1 px smaller than the grid creates a grid effect in the snake body so you can see how long it is
        context.fillRect(cell.x, cell.y, grid - 1, grid - 1);

        // snake ate burger
        if (cell.x === burger.x && cell.y === burger.y) {
            snake.maxCells++;
            score++;
            // Increase game speed according to score
            if (score > 15) {
                frameDivider = 5;
            } else if (score > 26) {
                frameDivider = 4;
            } else if (score > 50) {
                frameDivider = 3;
            }
            ranX = getRandomInt(pixelSize);
            ranY = getRandomInt(pixelSize);
            burger.x = ranX * grid;
            burger.y = ranY * grid;
        }
        for (let i = index + 1; i < snake.cells.length; i++) {
            // snake occupies same space as a body part reset game
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
    context.font = `${w / 38}px 'Press Start 2P'`;
    context.fillText(`SCORE ${score}`, w / 2.3809, w / 16.666);
}

gameStart();
