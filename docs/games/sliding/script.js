const boardElement = document.getElementById('board');
const movesElement = document.getElementById('moves');
const resetBtn = document.getElementById('reset-btn');

let tiles = [];
let moves = 0;

function initGame() {
    moves = 0;
    movesElement.innerText = moves;
    tiles = Array.from({length: 15}, (_, i) => i + 1);
    tiles.push(null); // Empty space

    shuffle();
    renderBoard();
}

function shuffle() {
    GameManager.setGame('sliding');
    const level = GameManager.currentLevel;
    const moves_count = 50 + (level * 10);

    // Perform random valid moves based on level to ensure solvability
    let emptyIdx = 15;
    for (let i = 0; i < moves_count; i++) {
        const neighbors = getNeighbors(emptyIdx);
        const moveIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
        [tiles[emptyIdx], tiles[moveIdx]] = [tiles[moveIdx], tiles[emptyIdx]];
        emptyIdx = moveIdx;
    }
}

function getNeighbors(idx) {
    const row = Math.floor(idx / 4);
    const col = idx % 4;
    const neighbors = [];
    if (row > 0) neighbors.push(idx - 4);
    if (row < 3) neighbors.push(idx + 4);
    if (col > 0) neighbors.push(idx - 1);
    if (col < 3) neighbors.push(idx + 1);
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
    const row = Math.floor(idx / 4);
    const col = idx % 4;
    const emptyRow = Math.floor(emptyIdx / 4);
    const emptyCol = emptyIdx % 4;

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
    const isWin = tiles.slice(0, 15).every((num, i) => num === i + 1);
    if (isWin) {
        GameManager.showResult('win', moves);
    }
}

GameManager.setGame('sliding');
resetBtn.addEventListener('click', initGame);
initGame();
