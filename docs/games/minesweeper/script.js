const boardElement = document.getElementById('board');
const mineCountElement = document.getElementById('mine-count');
const resetBtn = document.getElementById('reset-btn');

let board = [];
let gameOver = false;
let size = 8;
let mines = 10;

function initGame() {
    GameManager.setGame('minesweeper');

    // Level scaling (1-50)
    const level = GameManager.currentLevel;
    size = 8 + Math.floor(level / 10); // 8x8 to 13x13
    mines = 10 + level; // 10 to 60 mines

    document.documentElement.style.setProperty('--cols', size);
    document.documentElement.style.setProperty('--rows', size);

    board = [];
    gameOver = false;
    boardElement.innerHTML = '';
    mineCountElement.innerText = mines;

    // First time?
    if (localStorage.getItem('ms_first') !== 'true') {
        GameManager.showInstructions('Cómo jugar', 'Revela celdas sin tocar las minas. El número indica cuántas minas hay alrededor. Usa clic derecho o mantén presionado para poner una bandera.');
        localStorage.setItem('ms_first', 'true');
    }

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
        div.addEventListener('click', () => revealCell(i));
        div.addEventListener('contextmenu', (e) => { e.preventDefault(); toggleFlag(i); });

        let timer;
        div.addEventListener('touchstart', () => timer = setTimeout(() => toggleFlag(i), 500));
        div.addEventListener('touchend', () => clearTimeout(timer));

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
        endGame(false);
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
    boardElement.children[idx].classList.toggle('flagged');
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

resetBtn.addEventListener('click', initGame);
initGame();
