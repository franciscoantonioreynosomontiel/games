const boardElement = document.getElementById('board');
const moveCountElement = document.getElementById('move-count');

let size = 3;
let board = [];
let moves = 0;

function initGame() {
    GameManager.setGame('sliding');

    // Size logic
    const lvl = GameManager.currentLevel;
    if (lvl <= 10) size = 3;
    else if (lvl <= 30) size = 4;
    else size = 5;

    const containerSize = Math.min(window.innerWidth * 0.9, 360);
    const tileSize = Math.floor((containerSize - (size * 8)) / size);

    boardElement.style.gridTemplateColumns = `repeat(${size}, ${tileSize}px)`;
    boardElement.style.gridTemplateRows = `repeat(${size}, ${tileSize}px)`;

    board = Array.from({length: size * size}, (_, i) => i);
    shuffleBoard();
    moves = 0;
    moveCountElement.innerText = moves;
    renderBoard(tileSize);
}

function shuffleBoard() {
    // Deterministic shuffle per level? Or just random valid moves?
    // Let's use random valid moves to ensure solvability
    for (let i = 0; i < size * size * 40; i++) {
        const emptyIdx = board.indexOf(size * size - 1);
        const neighbors = getNeighbors(emptyIdx);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        [board[emptyIdx], board[randomNeighbor]] = [board[randomNeighbor], board[emptyIdx]];
    }
}

function getNeighbors(idx) {
    const neighbors = [];
    const row = Math.floor(idx / size);
    const col = idx % size;
    if (row > 0) neighbors.push(idx - size);
    if (row < size - 1) neighbors.push(idx + size);
    if (col > 0) neighbors.push(idx - 1);
    if (col < size - 1) neighbors.push(idx + 1);
    return neighbors;
}

function renderBoard(tileSize) {
    boardElement.innerHTML = '';
    board.forEach((val, i) => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.width = `${tileSize}px`;
        tile.style.height = `${tileSize}px`;
        tile.style.fontSize = size > 4 ? '1.2rem' : '1.5rem';

        if (val === size * size - 1) {
            tile.classList.add('empty');
            tile.innerText = '';
        } else {
            tile.innerText = val + 1;
            tile.onclick = () => moveTile(i);
        }
        boardElement.appendChild(tile);
    });
}

function moveTile(idx) {
    const emptyIdx = board.indexOf(size * size - 1);
    const neighbors = getNeighbors(emptyIdx);
    if (neighbors.includes(idx)) {
        [board[emptyIdx], board[idx]] = [board[idx], board[emptyIdx]];
        moves++;
        moveCountElement.innerText = moves;
        renderBoard(parseInt(boardElement.children[0].style.width));
        checkWin();
    }
}

function checkWin() {
    if (board.every((val, i) => val === i)) {
        setTimeout(() => {
            GameManager.showResult('win', `¡Puzzle resuelto en ${moves} movimientos!`);
        }, 300);
    }
}
