const boardElement = document.getElementById('board');
const mineCountElement = document.getElementById('mine-count');

let board = [];
let gameOver = false;
let size = 8;
let mines = 10;

function initGame() {
    GameManager.setGame('minesweeper');

    boardElement.style.display = 'grid';
    boardElement.style.gridTemplateColumns = `repeat(${size}, 30px)`;
    boardElement.style.gridTemplateRows = `repeat(${size}, 30px)`;
    boardElement.style.width = `${size * 30}px`;
    boardElement.style.height = `${size * 30}px`;
    boardElement.style.margin = '20px auto';
    boardElement.style.border = '2px solid #999';

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
            if (r >= 0 && r < size && c >= 0 && c < size) neighbors.push(r * size + c);
        }
    }
    return neighbors;
}

function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach((cell, i) => {
        const div = document.createElement('div');
        div.classList.add('cell');
        div.style.width = '30px';
        div.style.height = '30px';
        div.style.boxSizing = 'border-box';
        div.style.border = '1px solid #ccc';
        div.style.backgroundColor = '#ddd';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'center';
        div.style.fontSize = '14px';
        div.style.fontWeight = 'bold';
        div.style.cursor = 'pointer';

        div.addEventListener('click', () => revealCell(i));
        div.addEventListener('contextmenu', (e) => { e.preventDefault(); toggleFlag(i); });

        let timer;
        div.addEventListener('touchstart', (e) => {
            timer = setTimeout(() => {
                toggleFlag(i);
                timer = null;
            }, 500);
        });
        div.addEventListener('touchend', () => {
            if (timer) clearTimeout(timer);
        });

        boardElement.appendChild(div);
    });
}

function revealCell(idx) {
    if (gameOver || board[idx].revealed || board[idx].flagged) return;

    board[idx].revealed = true;
    const el = boardElement.children[idx];
    el.style.backgroundColor = '#eee';

    if (board[idx].isMine) {
        el.style.backgroundColor = '#f44336';
        el.innerText = '💣';
        if (GameManager.loseLife()) {
            endGame(false);
        }
    } else {
        if (board[idx].neighborCount > 0) {
            el.innerText = board[idx].neighborCount;
            const colors = ['', 'blue', 'green', 'red', 'darkblue', 'brown', 'cyan', 'black', 'grey'];
            el.style.color = colors[board[idx].neighborCount];
        } else {
            getNeighbors(idx).forEach(nIdx => revealCell(nIdx));
        }
        checkWin();
    }
}

function toggleFlag(idx) {
    if (gameOver || board[idx].revealed) return;
    board[idx].flagged = !board[idx].flagged;
    const el = boardElement.children[idx];
    if (board[idx].flagged) {
        el.innerText = '🚩';
        el.style.color = 'red';
    } else {
        el.innerText = '';
    }
}

function checkWin() {
    const safeCells = board.filter(c => !c.isMine);
    if (safeCells.every(c => c.revealed)) endGame(true);
}

function endGame(won) {
    gameOver = true;
    if (won) {
        GameManager.showResult('win');
    } else {
        board.forEach((cell, i) => {
            if (cell.isMine) {
                const el = boardElement.children[i];
                el.style.backgroundColor = '#f44336';
                el.innerText = '💣';
            }
        });
        GameManager.showResult('loss');
    }
}
