const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const modeSelect = document.getElementById('game-mode');
const difficultySelect = document.getElementById('difficulty');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let isGameActive = true;
let gameMode = 'pvp';
let difficulty = 'easy';

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !isGameActive) return;

    updateCell(clickedCell, clickedCellIndex);
    checkForWinner();

    if (isGameActive && gameMode === 'pva' && currentPlayer === 'O') {
        setTimeout(makeAIMove, 500);
    }
}

function updateCell(cell, index) {
    board[index] = currentPlayer;
    cell.innerText = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
}

function changePlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusElement.innerText = `Turno de ${currentPlayer}`;
}

function checkForWinner() {
    let roundWon = false;
    let winCombo = null;

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winCombo = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        winCombo.forEach(idx => cells[idx].classList.add('winner'));

        if (gameMode === 'pva') {
            if (currentPlayer === 'X') {
                statusElement.innerText = '¡Has Ganado!';
                setTimeout(() => GameManager.showResult('win'), 1000);
            } else {
                statusElement.innerText = '¡La IA ha ganado!';
                setTimeout(() => GameManager.showResult('loss'), 1000);
            }
        } else {
            statusElement.innerText = `¡Jugador ${currentPlayer} ha ganado!`;
        }
        isGameActive = false;
        return;
    }

    if (!board.includes('')) {
        statusElement.innerText = '¡Empate!';
        isGameActive = false;
        if (gameMode === 'pva') GameManager.saveResult('draw');
        return;
    }

    changePlayer();
}

function makeAIMove() {
    if (!isGameActive) return;
    let move;
    if (difficulty === 'easy') {
        move = getRandomMove();
    } else if (difficulty === 'medium') {
        move = getMediumMove();
    } else {
        move = getBestMove();
    }

    if (move !== null) {
        const cell = cells[move];
        updateCell(cell, move);
        checkForWinner();
    }
}

function getRandomMove() {
    const availableMoves = board.map((val, index) => val === '' ? index : null).filter(val => val !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getMediumMove() {
    const move = findWinningOrBlockingMove('O') || findWinningOrBlockingMove('X');
    return move !== null ? move : getRandomMove();
}

function findWinningOrBlockingMove(player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        const vals = [board[a], board[b], board[c]];
        const playerCount = vals.filter(v => v === player).length;
        const emptyCount = vals.filter(v => v === '').length;
        if (playerCount === 2 && emptyCount === 1) {
            if (board[a] === '') return a;
            if (board[b] === '') return b;
            if (board[c] === '') return c;
        }
    }
    return null;
}

function getBestMove() {
    let bestScore = -Infinity;
    let move = null;
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

const scores = { 'O': 10, 'X': -10, 'tie': 0 };

function minimax(board, depth, isMaximizing) {
    let result = checkWinnerForMinimax();
    if (result !== null) return scores[result];

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinnerForMinimax() {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    if (!board.includes('')) return 'tie';
    return null;
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    isGameActive = true;
    statusElement.innerText = `Turno de ${currentPlayer}`;
    cells.forEach(cell => {
        cell.innerText = '';
        cell.classList.remove('x', 'o', 'winner');
    });
}

modeSelect.addEventListener('change', (e) => {
    gameMode = e.target.value;
    difficultySelect.style.display = gameMode === 'pva' ? 'block' : 'none';
    resetGame();
});

difficultySelect.addEventListener('change', (e) => {
    difficulty = e.target.value;
    GameManager.setGame('tictactoe', difficulty);
    resetGame();
});

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);

// Initial set
GameManager.setGame('tictactoe', difficulty);
