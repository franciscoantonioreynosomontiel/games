const boardElement = document.getElementById('board');
const mineCountElement = document.getElementById('mine-count');

let board = [];
let gameOver = false;
let size = 8;
let mines = 10;

function initGame() {
    GameManager.setGame('minesweeper', false, size + 'x' + size);
    // Standardized grid sizing for mobile
    const containerWidth = Math.min(window.innerWidth * 0.95, 360);
    const cellSize = Math.floor((containerWidth - 10) / size);

    boardElement.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
    boardElement.style.gridTemplateRows = `repeat(${size}, ${cellSize}px)`;
    boardElement.style.width = `${size * cellSize + 8}px`;

    board = [];
    gameOver = false;
    boardElement.innerHTML = '';
    mineCountElement.innerText = mines;

    for (let i = 0; i < size * size; i++) {
        board.push({ isMine: false, revealed: false, flagged: false, neighborCount: 0 });
    }

    let minesPlaced = 0;
    while (minesPlaced < mines) {
        let idx = Math.floor(Math.random() * size * size);
        if (!board[idx].isMine) {
            board[idx].isMine = true;
            minesPlaced++;
        }
    }

    for (let i = 0; i < size * size; i++) {
        if (!board[i].isMine) {
            board[i].neighborCount = getNeighbors(i).filter(idx => board[idx].isMine).length;
        }
    }

    renderBoard(cellSize);
}

function getNeighbors(idx) {
    const row = Math.floor(idx / size);
    const col = idx % size;
    const neighbors = [];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const r = row + i, c = col + j;
            if (r >= 0 && r < size && c >= 0 && c < size) neighbors.push(r * size + c);
        }
    }
    return neighbors;
}

function renderBoard(cellSize) {
    boardElement.innerHTML = '';
    board.forEach((cell, i) => {
        const div = document.createElement('div');
        div.className = 'cell';
        div.style.width = `${cellSize}px`;
        div.style.height = `${cellSize}px`;

        div.onclick = () => revealCell(i);
        div.oncontextmenu = (e) => { e.preventDefault(); toggleFlag(i); };

        // Mobile long press for flag
        let timer;
        div.ontouchstart = () => timer = setTimeout(() => toggleFlag(i), 500);
        div.ontouchend = () => clearTimeout(timer);

        boardElement.appendChild(div);
    });
}

function revealCell(idx) {
    if (gameOver || board[idx].revealed || board[idx].flagged) return;

    board[idx].revealed = true;
    const el = boardElement.children[idx];
    el.classList.add('revealed');

    if (board[idx].isMine) {
        el.classList.add('mine');
        el.innerText = '💣';
        if (GameManager.loseLife()) endGame(false);
    } else {
        if (board[idx].neighborCount > 0) {
            el.innerText = board[idx].neighborCount;
            el.classList.add(`n${board[idx].neighborCount}`);
        } else {
            getNeighbors(idx).forEach(nIdx => revealCell(nIdx));
        }
        checkWin();
    }
}

function toggleFlag(idx) {
    if (gameOver || board[idx].revealed) return;
    board[idx].flagged = !board[idx].flagged;
    boardElement.children[idx].innerText = board[idx].flagged ? '🚩' : '';
}

function checkWin() {
    const safeCells = board.filter(c => !c.isMine);
    if (safeCells.every(c => c.revealed)) endGame(true);
}

function endGame(won) {
    gameOver = true;
    if (won) GameManager.showResult('win');
    else {
        board.forEach((cell, i) => {
            if (cell.isMine) {
                boardElement.children[i].classList.add('revealed', 'mine');
                boardElement.children[i].innerText = '💣';
            }
        });
        GameManager.showResult('loss');
    }
}
