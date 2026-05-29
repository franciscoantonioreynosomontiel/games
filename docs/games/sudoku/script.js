const boardElement = document.getElementById('sudoku-board');
const newGameBtn = document.getElementById('new-game');
const numpad = document.getElementById('numpad');

let selectedCell = null;
let board = [];
let solution = [];
let size = 9;
let difficulty = 'medium';
let symbols = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

function initNumpad() {
    numpad.innerHTML = '';
    symbols.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'numpad-btn';
        btn.innerText = s;
        btn.onclick = () => handleInput(s);
        numpad.appendChild(btn);
    });
    const erase = document.createElement('button');
    erase.className = 'numpad-btn';
    erase.innerHTML = '<span class="material-icons">backspace</span>';
    erase.onclick = () => handleInput('erase');
    numpad.appendChild(erase);
}

function initGame() {
    GameManager.setGame('sudoku', difficulty);
    generateSudoku();
    renderBoard();
}

function generateSudoku() {
    board = Array(size * size).fill(null);
    solveSudoku(board);
    solution = [...board];

    let removeCount = size === 9 ? 40 : 120;
    if (difficulty === 'easy') removeCount -= 10;
    if (difficulty === 'hard') removeCount += 10;

    while (removeCount > 0) {
        let idx = Math.floor(Math.random() * size * size);
        if (board[idx] !== null) {
            board[idx] = null;
            removeCount--;
        }
    }
}

function solveSudoku(b) {
    for (let i = 0; i < size * size; i++) {
        if (b[i] === null) {
            let shuffled = [...symbols].sort(() => Math.random() - 0.5);
            for (let sym of shuffled) {
                if (isValid(b, i, sym)) {
                    b[i] = sym;
                    if (solveSudoku(b)) return true;
                    b[i] = null;
                }
            }
            return false;
        }
    }
    return true;
}

function isValid(b, idx, sym) {
    let row = Math.floor(idx / size);
    let col = idx % size;
    let boxSize = Math.sqrt(size);
    let boxRow = Math.floor(row / boxSize) * boxSize;
    let boxCol = Math.floor(col / boxSize) * boxSize;

    for (let i = 0; i < size; i++) {
        if (b[row * size + i] === sym) return false;
        if (b[i * size + col] === sym) return false;
        let r = boxRow + Math.floor(i / boxSize);
        let c = boxCol + (i % boxSize);
        if (b[r * size + c] === sym) return false;
    }
    return true;
}

function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach((val, i) => {
        const cell = document.createElement('div');
        cell.classList.add('sudoku-cell');
        if (val !== null) {
            cell.innerText = val;
            cell.classList.add('fixed');
        }
        cell.dataset.index = i;
        cell.onclick = () => {
            if (selectedCell) selectedCell.classList.remove('selected');
            selectedCell = cell;
            cell.classList.add('selected');
        };
        boardElement.appendChild(cell);
    });
}

function handleInput(sym) {
    if (!selectedCell || selectedCell.classList.contains('fixed')) return;
    const idx = parseInt(selectedCell.dataset.index);
    if (sym === 'erase') {
        board[idx] = null;
        selectedCell.innerText = '';
        selectedCell.classList.remove('wrong');
    } else {
        board[idx] = sym;
        selectedCell.innerText = sym;
        if (sym !== solution[idx]) {
            selectedCell.classList.add('wrong');
            GameManager.loseLife();
        } else {
            selectedCell.classList.remove('wrong');
            checkWin();
        }
    }
}

function checkWin() {
    if (!board.includes(null) && !document.querySelector('.wrong')) {
        GameManager.showResult('win');
    }
}

newGameBtn.onclick = initGame;
