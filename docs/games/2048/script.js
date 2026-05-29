const boardElement = document.getElementById('board');
const scoreDisplay = document.getElementById('score');

let score = 0;
let size = 4;
let board = [];
let goal = 2048;

function initGame() {
    const state = GameManager.setGame('2048');
    const level = state.level;

    // Level scaling logic
    if (level <= 10) { size = 4; goal = 2048; }
    else if (level <= 20) { size = 5; goal = 2048; }
    else if (level <= 30) { size = 4; goal = 4096; }
    else { size = 5; goal = 4096; }

    boardElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    boardElement.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    score = 0;
    scoreDisplay.innerText = score;
    board = Array(size * size).fill(0);
    addRandomTile();
    addRandomTile();
    renderBoard();
}

function addRandomTile() {
    const emptyCells = board.map((val, idx) => val === 0 ? idx : null).filter(val => val !== null);
    if (emptyCells.length > 0) {
        const randomIdx = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomIdx] = Math.random() < 0.9 ? 2 : 4;
    }
}

function renderBoard() {
    boardElement.innerHTML = '';
    const containerWidth = boardElement.offsetWidth || 300;
    const gap = 10;
    const tileSize = Math.floor((containerWidth - (size + 1) * gap) / size);

    board.forEach(val => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.width = `${tileSize}px`;
        tile.style.height = `${tileSize}px`;
        tile.style.lineHeight = `${tileSize}px`;
        tile.style.fontSize = val > 100 ? (val > 1000 ? '16px' : '20px') : '24px';

        if (val > 0) {
            tile.innerText = val;
            tile.dataset.value = val;
            tile.style.backgroundColor = getTileColor(val);
            tile.style.color = val > 4 ? '#f9f6f2' : '#776e65';
        } else {
            tile.style.backgroundColor = 'rgba(238, 228, 218, 0.35)';
        }
        boardElement.appendChild(tile);
    });
}

function getTileColor(val) {
    const colors = {
        2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
        32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
        512: '#edc850', 1024: '#edc53f', 2048: '#edc22e', 4096: '#3c3a32'
    };
    return colors[val] || '#3c3a32';
}

function slide(row) {
    let arr = row.filter(val => val !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            score += arr[i];
            arr[i + 1] = 0;
        }
    }
    arr = arr.filter(val => val !== 0);
    while (arr.length < size) arr.push(0);
    return arr;
}

function move(direction) {
    const oldBoard = [...board];

    if (direction === 'left' || direction === 'right') {
        for (let i = 0; i < size; i++) {
            let row = board.slice(i * size, (i + 1) * size);
            if (direction === 'right') row.reverse();
            let newRow = slide(row);
            if (direction === 'right') newRow.reverse();
            for (let j = 0; j < size; j++) board[i * size + j] = newRow[j];
        }
    } else {
        for (let i = 0; i < size; i++) {
            let col = [];
            for (let j = 0; j < size; j++) col.push(board[j * size + i]);
            if (direction === 'down') col.reverse();
            let newCol = slide(col);
            if (direction === 'down') newCol.reverse();
            for (let j = 0; j < size; j++) board[j * size + i] = newCol[j];
        }
    }

    if (board.some((val, idx) => val !== oldBoard[idx])) {
        addRandomTile();
        renderBoard();
        scoreDisplay.innerText = score;
        checkWin();
    }
}

function checkWin() {
    if (board.includes(goal)) {
        setTimeout(() => GameManager.showResult('win', `¡Has llegado al ${goal}! Puntos: ${score}`), 500);
    } else if (!board.includes(0)) {
        let canMove = false;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (j < size - 1 && board[i * size + j] === board[i * size + j + 1]) canMove = true;
                if (i < size - 1 && board[i * size + j] === board[(i + 1) * size + j]) canMove = true;
            }
        }
        if (!canMove) setTimeout(() => GameManager.showResult('loss'), 500);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') move('left');
    if (e.key === 'ArrowRight') move('right');
    if (e.key === 'ArrowUp') move('up');
    if (e.key === 'ArrowDown') move('down');
});

let startX, startY;
boardElement.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
}, {passive: false});

boardElement.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 30) move(dx > 0 ? 'right' : 'left');
    } else {
        if (Math.abs(dy) > 30) move(dy > 0 ? 'down' : 'up');
    }
}, {passive: false});
