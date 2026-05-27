const boardElement = document.getElementById('board');
const mineCountElement = document.getElementById('mine-count');
const resetBtn = document.getElementById('reset-btn');

const size = 10;
const mines = 15;
let board = [];
let gameOver = false;

function initGame() {
    board = [];
    gameOver = false;
    boardElement.innerHTML = '';
    mineCountElement.innerText = mines;

    // Create empty board
    for (let i = 0; i < size * size; i++) {
        board.push({
            isMine: false,
            revealed: false,
            flagged: false,
            neighborCount: 0
        });
    }

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < mines) {
        let idx = Math.floor(Math.random() * size * size);
        if (!board[idx].isMine) {
            board[idx].isMine = true;
            minesPlaced++;
        }
    }

    // Calculate neighbors
    for (let i = 0; i < size * size; i++) {
        if (!board[i].isMine) {
            board[i].neighborCount = getNeighbors(i).filter(idx => board[idx].isMine).length;
        }
    }

    renderBoard();
}

function getNeighbors(idx) {
    const row = Math.floor(idx / size);
    const col = idx % size;
    const neighbors = [];

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const r = row + i;
            const c = col + j;
            if (r >= 0 && r < size && c >= 0 && c < size) {
                neighbors.push(r * size + c);
            }
        }
    }
    return neighbors;
}

function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach((cell, i) => {
        const div = document.createElement('div');
        div.classList.add('cell');
        div.dataset.index = i;

        div.addEventListener('click', () => revealCell(i));
        div.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            toggleFlag(i);
        });

        // Long press for mobile flagging
        let timer;
        div.addEventListener('touchstart', () => {
            timer = setTimeout(() => toggleFlag(i), 500);
        });
        div.addEventListener('touchend', () => clearTimeout(timer));

        boardElement.appendChild(div);
    });
}

function revealCell(idx) {
    if (gameOver || board[idx].revealed || board[idx].flagged) return;

    board[idx].revealed = true;
    const cellElement = boardElement.children[idx];
    cellElement.classList.add('revealed');

    if (board[idx].isMine) {
        cellElement.classList.add('mine');
        cellElement.innerText = '💣';
        endGame(false);
    } else {
        if (board[idx].neighborCount > 0) {
            cellElement.innerText = board[idx].neighborCount;
            cellElement.classList.add(`n${board[idx].neighborCount}`);
        } else {
            getNeighbors(idx).forEach(nIdx => revealCell(nIdx));
        }
        checkWin();
    }
}

function toggleFlag(idx) {
    if (gameOver || board[idx].revealed) return;
    board[idx].flagged = !board[idx].flagged;
    boardElement.children[idx].classList.toggle('flagged');

    const flags = board.filter(c => c.flagged).length;
    mineCountElement.innerText = mines - flags;
}

function checkWin() {
    const safeCells = board.filter(c => !c.isMine);
    if (safeCells.every(c => c.revealed)) {
        endGame(true);
    }
}

function endGame(won) {
    gameOver = true;
    if (won) {
        alert('¡Felicidades! Has ganado.');
    } else {
        board.forEach((cell, i) => {
            if (cell.isMine) {
                boardElement.children[i].classList.add('revealed', 'mine');
                boardElement.children[i].innerText = '💣';
            }
        });
        alert('BOOM! Juego terminado.');
    }
}

resetBtn.addEventListener('click', initGame);
initGame();
