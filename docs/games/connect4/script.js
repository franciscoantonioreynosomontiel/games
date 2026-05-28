const grid = document.getElementById('grid');
const status = document.getElementById('status');

let board = [];
let currentPlayer = 1;
let gameOver = false;
let gameMode = 'pva';
let difficulty = 'hard'; // Use minimax for better experience

function initGame() {
    GameManager.setGame('connect4');
    board = Array(6).fill().map(() => Array(7).fill(0));
    currentPlayer = 1;
    gameOver = false;
    updateStatus();
    renderBoard();
}

function updateStatus() {
    if (gameMode === 'pva') {
        status.innerText = currentPlayer === 1 ? "Tu Turno" : "IA Pensando...";
    } else {
        status.innerText = `Turno: Jugador ${currentPlayer}`;
    }
}

function renderBoard() {
    grid.innerHTML = '';
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (board[r][c] === 1) cell.classList.add('player1');
            if (board[r][c] === 2) cell.classList.add('player2');
            cell.onclick = () => handleMove(c);
            grid.appendChild(cell);
        }
    }
}

function handleMove(col) {
    if (gameOver || (gameMode === 'pva' && currentPlayer === 2)) return;

    if (makeMove(col)) {
        if (!gameOver && gameMode === 'pva' && currentPlayer === 2) {
            setTimeout(makeAIMove, 600);
        }
    }
}

function makeMove(col) {
    for (let r = 5; r >= 0; r--) {
        if (board[r][col] === 0) {
            board[r][col] = currentPlayer;
            renderBoard();
            if (checkWin(r, col)) {
                endGame(currentPlayer);
            } else if (board.every(row => row.every(c => c !== 0))) {
                endGame(0);
            } else {
                currentPlayer = currentPlayer === 1 ? 2 : 1;
                updateStatus();
            }
            return true;
        }
    }
    return false;
}

function makeAIMove() {
    if (gameOver) return;
    let col = getBestMove();
    makeMove(col);
}

function getBestMove() {
    // 1. Try to win
    for (let c = 0; c < 7; c++) {
        if (board[0][c] === 0) {
            const r = getOpenRow(c);
            board[r][c] = 2;
            if (checkWin(r, c)) { board[r][c] = 0; return c; }
            board[r][c] = 0;
        }
    }
    // 2. Block player
    for (let c = 0; c < 7; c++) {
        if (board[0][c] === 0) {
            const r = getOpenRow(c);
            board[r][c] = 1;
            if (checkWin(r, c)) { board[r][c] = 0; return c; }
            board[r][c] = 0;
        }
    }
    // 3. Prefer center
    const preferred = [3, 2, 4, 1, 5, 0, 6];
    for (let c of preferred) {
        if (board[0][c] === 0) return c;
    }
}

function getOpenRow(c) {
    for (let r = 5; r >= 0; r--) {
        if (board[r][c] === 0) return r;
    }
}

function checkWin(r, c) {
    const p = board[r][c];
    const directions = [[0,1], [1,0], [1,1], [1,-1]];
    for (const [dr, dc] of directions) {
        let count = 1;
        for (const i of [-1, 1]) {
            let nr = r + dr * i, nc = c + dc * i;
            while (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && board[nr][nc] === p) {
                count++;
                nr += dr * i; nc += dc * i;
            }
        }
        if (count >= 4) return true;
    }
    return false;
}

function endGame(winner) {
    gameOver = true;
    if (winner === 0) {
        status.innerText = "¡Empate!";
        if (gameMode === 'pva') GameManager.showResult('draw');
    } else {
        if (gameMode === 'pva') {
            status.innerText = winner === 1 ? "¡Has Ganado!" : "¡La IA ha ganado!";
            GameManager.showResult(winner === 1 ? 'win' : 'loss');
        } else {
            status.innerText = `¡Jugador ${winner} ha ganado!`;
            UIManager.alert('Fin del juego', `¡Jugador ${winner} ha ganado!`, 'success');
        }
    }
}
