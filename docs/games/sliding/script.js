const boardElement = document.getElementById('board');
const moveCountElement = document.getElementById('move-count');
const resetBtn = document.getElementById('reset-btn');

let size = 3;
let board = [];
let moves = 0;

function initGame() {
    GameManager.setGame('sliding');
    const level = GameManager.currentLevel;

    // Scale grid size with levels
    if (level <= 10) size = 3;
    else if (level <= 20) size = 4;
    else if (level <= 30) size = 5;
    else if (level <= 40) size = 6;
    else size = 7;

    boardElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    boardElement.style.width = '300px';
    boardElement.style.height = '300px';

    board = Array.from({length: size * size}, (_, i) => i);
    shuffleBoard();
    moves = 0;
    moveCountElement.innerText = moves;
    renderBoard();
}

function shuffleBoard() {
    for (let i = 0; i < size * size * 20; i++) {
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

function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach((val, i) => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.border = '1px solid #ccc';
        tile.style.display = 'flex';
        tile.style.alignItems = 'center';
        tile.style.justifyContent = 'center';
        tile.style.fontSize = '20px';
        tile.style.fontWeight = 'bold';
        tile.style.cursor = 'pointer';
        tile.style.backgroundColor = '#6200ee';
        tile.style.color = 'white';

        if (val === size * size - 1) {
            tile.classList.add('empty');
            tile.style.backgroundColor = '#eee';
            tile.style.cursor = 'default';
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
        renderBoard();
        checkWin();
    }
}

function checkWin() {
    if (board.every((val, i) => val === i)) {
        GameManager.showResult('win');
    }
}

resetBtn.onclick = initGame;
initGame();
