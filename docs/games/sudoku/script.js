const boardElement = document.getElementById('sudoku-board');
const newGameBtn = document.getElementById('new-game');
const difficultySelect = document.getElementById('difficulty');
const numpadBtns = document.querySelectorAll('.numpad-btn');

let selectedCell = null;
let board = [];
let solution = [];

function initGame() {
    generateSudoku();
    renderBoard();
}

function generateSudoku() {
    // Simple generator: fill a diagonal, solve, then remove
    board = Array(81).fill(0);
    solveSudoku(board);
    solution = [...board];

    let removeCount = 40;
    if (difficultySelect.value === 'medium') removeCount = 50;
    if (difficultySelect.value === 'hard') removeCount = 60;

    while (removeCount > 0) {
        let idx = Math.floor(Math.random() * 81);
        if (board[idx] !== 0) {
            board[idx] = 0;
            removeCount--;
        }
    }
}

function solveSudoku(b) {
    for (let i = 0; i < 81; i++) {
        if (b[i] === 0) {
            let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            for (let num of nums) {
                if (isValid(b, i, num)) {
                    b[i] = num;
                    if (solveSudoku(b)) return true;
                    b[i] = 0;
                }
            }
            return false;
        }
    }
    return true;
}

function isValid(b, idx, num) {
    let row = Math.floor(idx / 9);
    let col = idx % 9;
    let boxRow = Math.floor(row / 3) * 3;
    let boxCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 9; i++) {
        if (b[row * 9 + i] === num) return false;
        if (b[i * 9 + col] === num) return false;
        if (b[(boxRow + Math.floor(i / 3)) * 9 + (boxCol + i % 3)] === num) return false;
    }
    return true;
}

function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach((val, i) => {
        const cell = document.createElement('div');
        cell.classList.add('sudoku-cell');
        if (val !== 0) {
            cell.innerText = val;
            cell.classList.add('fixed');
        }
        cell.dataset.index = i;
        cell.addEventListener('click', () => selectCell(cell));
        boardElement.appendChild(cell);
    });
}

function selectCell(cell) {
    if (selectedCell) selectedCell.classList.remove('selected');
    selectedCell = cell;
    selectedCell.classList.add('selected');
}

function handleInput(num) {
    if (!selectedCell || selectedCell.classList.contains('fixed')) return;

    const idx = parseInt(selectedCell.dataset.index);
    if (num === 'erase') {
        board[idx] = 0;
        selectedCell.innerText = '';
        selectedCell.classList.remove('wrong');
    } else {
        const n = parseInt(num);
        board[idx] = n;
        selectedCell.innerText = n;
        if (n !== solution[idx]) {
            selectedCell.classList.add('wrong');
            if (GameManager.loseLife()) {
                // Game over handled by GameManager
            }
        } else {
            selectedCell.classList.remove('wrong');
            checkWin();
        }
    }
}

function checkWin() {
    if (!board.includes(0) && !document.querySelector('.wrong')) {
        GameManager.showResult('win');
    }
}

GameManager.setGame('sudoku', difficultySelect.value);

newGameBtn.addEventListener('click', initGame);
numpadBtns.forEach(btn => {
    btn.addEventListener('click', () => handleInput(btn.dataset.num));
});

document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '9') handleInput(e.key);
    if (e.key === 'Backspace' || e.key === 'Delete') handleInput('erase');
});

initGame();
