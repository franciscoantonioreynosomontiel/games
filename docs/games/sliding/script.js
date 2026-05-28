const boardElement = document.getElementById('board');
const movesElement = document.getElementById('moves');
const resetBtn = document.getElementById('reset-btn');

let tiles = [];
let moves = 0;
let size = 4;

function initGame() {
    GameManager.setGame('sliding');
    const level = GameManager.currentLevel;

    // Level-based grid sizing
    if (level < 11) size = 3;
    else if (level < 21) size = 4;
    else if (level < 31) size = 5;
    else if (level < 41) size = 6;
    else size = 7;

    document.documentElement.style.setProperty('--size', size);

    moves = 0;
    movesElement.innerText = moves;

    const tileCount = size * size - 1;
    tiles = Array.from({length: tileCount}, (_, i) => i + 1);
    tiles.push(null); // Empty space

    shuffle();
    renderBoard();
}

function shuffle() {
    const level = GameManager.currentLevel;
    const moves_count = 50 + (level * 5);
    let emptyIdx = tiles.indexOf(null);

    for (let i = 0; i < moves_count; i++) {
        const neighbors = getNeighbors(emptyIdx);
        const moveIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
        [tiles[emptyIdx], tiles[moveIdx]] = [tiles[moveIdx], tiles[emptyIdx]];
        emptyIdx = moveIdx;
    }
}

function getNeighbors(idx) {
    const row = Math.floor(idx / size);
    const col = idx % size;
    const neighbors = [];
    if (row > 0) neighbors.push(idx - size);
    if (row < size - 1) neighbors.push(idx + size);
    if (col > 0) neighbors.push(idx - 1);
    if (col < size - 1) neighbors.push(idx + 1);
    return neighbors;
}

function renderBoard() {
    boardElement.innerHTML = '';
    tiles.forEach((num, i) => {
        const div = document.createElement('div');
        div.classList.add('tile');
        if (num === null) {
            div.classList.add('empty');
        } else {
            div.innerText = num;
            div.addEventListener('click', () => moveTile(i));
        }
        boardElement.appendChild(div);
    });
}

function moveTile(idx) {
    const emptyIdx = tiles.indexOf(null);
    const row = Math.floor(idx / size);
    const col = idx % size;
    const emptyRow = Math.floor(emptyIdx / size);
    const emptyCol = emptyIdx % size;

    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

    if (isAdjacent) {
        [tiles[emptyIdx], tiles[idx]] = [tiles[idx], tiles[emptyIdx]];
        moves++;
        movesElement.innerText = moves;
        renderBoard();
        checkWin();
    }
}

function checkWin() {
    const tileCount = size * size - 1;
    const isWin = tiles.slice(0, tileCount).every((num, i) => num === i + 1);
    if (isWin) {
        GameManager.showResult('win', moves);
    }
}

resetBtn.addEventListener('click', initGame);
initGame();
