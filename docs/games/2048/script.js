const boardElement = document.getElementById('board');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level-display');
const goalDisplay = document.getElementById('goal-display');

let score = 0;
let size = 4;
let goal = 2048;
let board = [];
let level = 1;

function initGame() {
    const gameState = GameManager.setGame('2048');
    level = gameState.level;
    levelDisplay.innerText = level;

    // Level Scaling
    if (level <= 10) {
        size = 4;
        goal = 2048;
    } else if (level <= 20) {
        size = 5;
        goal = 4096;
    } else if (level <= 30) {
        size = 6;
        goal = 4096;
    } else if (level <= 40) {
        size = 3;
        goal = 1024;
    } else {
        size = 4;
        goal = 4096;
    }

    goalDisplay.innerText = goal;
    boardElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    boardElement.style.width = `${Math.min(size * 80, 320)}px`;
    boardElement.style.height = `${Math.min(size * 80, 320)}px`;

    score = 0;
    scoreDisplay.innerText = score;
    board = Array(size * size).fill(0);
    addRandomTile();
    addRandomTile();
    renderBoard();
}

function addRandomTile() {
    const emptyCells = board.map((val, idx) => val === 0 ? idx : null).filter(val => val !== null);
    if (emptyCells.length > 0) {
        const randomIdx = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomIdx] = Math.random() < 0.9 ? 2 : 4;
    }
}

function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach(val => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        if (val > 0) {
            tile.innerText = val;
            tile.dataset.value = val;
            if (val > 2048) tile.dataset.value = "super";
        }
        boardElement.appendChild(tile);
    });
}

function slide(row) {
    let arr = row.filter(val => val !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            score += arr[i];
            arr[i + 1] = 0;
        }
    }
    arr = arr.filter(val => val !== 0);
    while (arr.length < size) arr.push(0);
    return arr;
}

function move(direction) {
    let hasChanged = false;
    const oldBoard = [...board];

    if (direction === 'left' || direction === 'right') {
        for (let i = 0; i < size; i++) {
            let row = board.slice(i * size, (i + 1) * size);
            if (direction === 'right') row.reverse();
            let newRow = slide(row);
            if (direction === 'right') newRow.reverse();
            for (let j = 0; j < size; j++) board[i * size + j] = newRow[j];
        }
    } else {
        for (let i = 0; i < size; i++) {
            let col = [];
            for (let j = 0; j < size; j++) col.push(board[j * size + i]);
            if (direction === 'down') col.reverse();
            let newCol = slide(col);
            if (direction === 'down') newCol.reverse();
            for (let j = 0; j < size; j++) board[j * size + i] = newCol[j];
        }
    }

    if (board.some((val, idx) => val !== oldBoard[idx])) {
        addRandomTile();
        renderBoard();
        scoreDisplay.innerText = score;
        checkGameStatus();
    }
}

function checkGameStatus() {
    if (board.includes(goal)) {
        GameManager.showResult('win');
        return;
    }

    // Check if any moves left
    let canMove = false;
    if (board.includes(0)) canMove = true;
    else {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let current = board[i * size + j];
                if (j < size - 1 && current === board[i * size + j + 1]) canMove = true;
                if (i < size - 1 && current === board[(i + 1) * size + j]) canMove = true;
            }
        }
    }

    if (!canMove) {
        GameManager.showResult('loss');
    }
}

// Controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') move('left');
    if (e.key === 'ArrowRight') move('right');
    if (e.key === 'ArrowUp') move('up');
    if (e.key === 'ArrowDown') move('down');
});

// Touch controls
let touchStartX, touchStartY;
boardElement.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, false);

boardElement.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) move('right'); else if (dx < -30) move('left');
    } else {
        if (dy > 30) move('down'); else if (dy < -30) move('up');
    }
}, false);

document.getElementById('reset-btn').onclick = initGame;
initGame();
