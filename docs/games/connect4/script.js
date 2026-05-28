const grid = document.getElementById('grid');
const status = document.getElementById('status');
const gameModeSelect = document.getElementById('game-mode');
const difficultySelect = document.getElementById('difficulty');

let board = [];
let currentPlayer = 1;
let gameOver = false;
let gameMode = 'pva';
let difficulty = 'easy';

function initGame() {
    GameManager.setGame('connect4', difficulty);
    board = Array(6).fill().map(() => Array(7).fill(0));
    currentPlayer = 1;
    gameOver = false;
    status.innerText = "Turno: Jugador 1";
    renderBoard();
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
        if (!gameOver && gameMode === 'pva') {
            setTimeout(makeAIMove, 500);
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
                status.innerText = `Turno: Jugador ${currentPlayer}`;
            }
            return true;
        }
    }
    return false;
}

function makeAIMove() {
    if (gameOver) return;
    let col;
    if (difficulty === 'easy') {
        const available = board[0].map((v, i) => v === 0 ? i : null).filter(v => v !== null);
        col = available[Math.floor(Math.random() * available.length)];
    } else {
        col = getBestMove();
    }

    if (col !== undefined) makeMove(col);
}

function getBestMove() {
    // Try to win
    for (let c = 0; c < 7; c++) {
        if (board[0][c] === 0 && canWin(c, 2)) return c;
    }
    // Block player
    for (let c = 0; c < 7; c++) {
        if (board[0][c] === 0 && canWin(c, 1)) return c;
    }
    // Random
    const available = board[0].map((v, i) => v === 0 ? i : null).filter(v => v !== null);
    return available[Math.floor(Math.random() * available.length)];
}

function canWin(col, player) {
    for (let r = 5; r >= 0; r--) {
        if (board[r][col] === 0) {
            board[r][col] = player;
            const won = checkWin(r, col);
            board[r][col] = 0;
            return won;
        }
    }
    return false;
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

gameModeSelect.onchange = (e) => {
    gameMode = e.target.value;
    difficultySelect.style.display = gameMode === 'pva' ? 'block' : 'none';
    initGame();
};

difficultySelect.onchange = (e) => {
    difficulty = e.target.value;
    initGame();
};

initGame();
