const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');

const ROWS = 6;
const COLS = 7;
let board = [];
let currentPlayer = 'red';
let gameOver = false;

function initGame() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    currentPlayer = 'red';
    gameOver = false;
    statusElement.innerText = 'Turno: Rojo';
    renderBoard();
}

function renderBoard() {
    boardElement.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (board[r][c]) cell.classList.add(board[r][c]);
            cell.addEventListener('click', () => handleMove(c));
            boardElement.appendChild(cell);
        }
    }
}

function handleMove(col) {
    if (gameOver || (currentPlayer === 'yellow')) return;

    if (makeMove(col, 'red')) {
        if (!gameOver) {
            currentPlayer = 'yellow';
            statusElement.innerText = 'Turno: Amarillo (IA)';
            setTimeout(makeAIMove, 500);
        }
    }
}

function makeMove(col, player) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][col]) {
            board[r][col] = player;
            if (checkWin(board, r, col)) {
                statusElement.innerText = `¡${player === 'red' ? 'Rojo' : 'Amarillo'} Gana!`;
                gameOver = true;
            } else if (board.every(row => row.every(cell => cell))) {
                statusElement.innerText = 'Empate';
                gameOver = true;
            }
            renderBoard();
            return true;
        }
    }
    return false;
}

function makeAIMove() {
    if (gameOver) return;
    const bestMove = getBestMove();
    makeMove(bestMove, 'yellow');
    if (!gameOver) {
        currentPlayer = 'red';
        statusElement.innerText = 'Turno: Rojo';
    } else {
        if (statusElement.innerText.includes('Amarillo')) {
            GameManager.showResult('loss');
        } else if (statusElement.innerText.includes('Rojo')) {
            GameManager.showResult('win');
        }
    }
}

function getBestMove() {
    let bestScore = -Infinity;
    let move = 0;
    for (let c = 0; c < COLS; c++) {
        const r = getAvailableRow(board, c);
        if (r !== -1) {
            board[r][c] = 'yellow';
            let score = minimax(board, 4, false, -Infinity, Infinity);
            board[r][c] = null;
            if (score > bestScore) {
                bestScore = score;
                move = c;
            }
        }
    }
    return move;
}

function getAvailableRow(b, c) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!b[r][c]) return r;
    }
    return -1;
}

function minimax(b, depth, isMaximizing, alpha, beta) {
    if (depth === 0) return evaluateBoard(b);

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let c = 0; c < COLS; c++) {
            const r = getAvailableRow(b, c);
            if (r !== -1) {
                b[r][c] = 'yellow';
                if (checkWin(b, r, c)) {
                    b[r][c] = null;
                    return 1000 + depth;
                }
                let eval = minimax(b, depth - 1, false, alpha, beta);
                b[r][c] = null;
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) break;
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let c = 0; c < COLS; c++) {
            const r = getAvailableRow(b, c);
            if (r !== -1) {
                b[r][c] = 'red';
                if (checkWin(b, r, c)) {
                    b[r][c] = null;
                    return -1000 - depth;
                }
                let eval = minimax(b, depth - 1, true, alpha, beta);
                b[r][c] = null;
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha) break;
            }
        }
        return minEval;
    }
}

function evaluateBoard(b) {
    // Simple evaluation: center control
    let score = 0;
    for (let r = 0; r < ROWS; r++) {
        if (b[r][3] === 'yellow') score += 3;
        if (b[r][3] === 'red') score -= 3;
    }
    return score;
}

function checkWin(b, r, c) {
    const player = b[r][c];

    // Horizontal
    let count = 0;
    for (let j = 0; j < COLS; j++) {
        if (b[r][j] === player) {
            count++;
            if (count === 4) return true;
        } else count = 0;
    }
    // Vertical
    count = 0;
    for (let i = 0; i < ROWS; i++) {
        if (b[i][c] === player) {
            count++;
            if (count === 4) return true;
        } else count = 0;
    }
    // Diagonal \
    for (let i = 0; i <= ROWS - 4; i++) {
        for (let j = 0; j <= COLS - 4; j++) {
            if (b[i][j] === player && b[i+1][j+1] === player && b[i+2][j+2] === player && b[i+3][j+3] === player) return true;
        }
    }
    // Diagonal /
    for (let i = 3; i < ROWS; i++) {
        for (let j = 0; j <= COLS - 4; j++) {
            if (b[i][j] === player && b[i-1][j+1] === player && b[i-2][j+2] === player && b[i-3][j+3] === player) return true;
        }
    }
    return false;
}

GameManager.setGame('connect4');
resetBtn.addEventListener('click', initGame);
initGame();
