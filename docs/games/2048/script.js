let grid = Array(16).fill(0);
let score = 0;
const gridElement = document.getElementById('grid');
const scoreElement = document.getElementById('score');
const newGameBtn = document.getElementById('new-game');

function initGame() {
    GameManager.setGame('2048');

    if (localStorage.getItem('2048_first') !== 'true') {
        GameManager.showInstructions('Cómo jugar', 'Desliza para mover las fichas. Cuando dos fichas con el mismo número se tocan, ¡se unen en una sola! Tu objetivo es llegar a 2048.');
        localStorage.setItem('2048_first', 'true');
    }

    grid = Array(16).fill(0);
    score = 0;
    addRandomTile();
    addRandomTile();
    updateUI();
}

function addRandomTile() {
    const emptyCells = grid.map((val, i) => val === 0 ? i : null).filter(val => val !== null);
    if (emptyCells.length > 0) {
        const randomIdx = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[randomIdx] = Math.random() < 0.9 ? 2 : 4;
    }
}

function updateUI() {
    scoreElement.innerText = score;
    const cells = gridElement.querySelectorAll('.grid-cell');
    grid.forEach((val, i) => {
        cells[i].innerText = val === 0 ? '' : val;
        cells[i].className = 'grid-cell';
        if (val > 0) cells[i].classList.add(`tile-${val}`);
    });
}

function move(direction) {
    let moved = false;
    const rows = [];
    for (let i = 0; i < 4; i++) {
        if (direction === 'left' || direction === 'right') rows.push(grid.slice(i * 4, (i + 1) * 4));
        else rows.push([grid[i], grid[i + 4], grid[i + 8], grid[i + 12]]);
    }

    const newRows = rows.map(row => {
        if (direction === 'right' || direction === 'down') row.reverse();
        let filtered = row.filter(val => val !== 0);
        for (let i = 0; i < filtered.length - 1; i++) {
            if (filtered[i] === filtered[i + 1]) {
                filtered[i] *= 2;
                score += filtered[i];
                filtered.splice(i + 1, 1);
            }
        }
        while (filtered.length < 4) filtered.push(0);
        if (direction === 'right' || direction === 'down') filtered.reverse();
        return filtered;
    });

    const newGrid = Array(16).fill(0);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (direction === 'left' || direction === 'right') newGrid[i * 4 + j] = newRows[i][j];
            else newGrid[j * 4 + i] = newRows[i][j];
        }
    }

    if (JSON.stringify(grid) !== JSON.stringify(newGrid)) {
        grid = newGrid;
        addRandomTile();
        updateUI();
        if (grid.includes(2048)) GameManager.showResult('win', score);
        else if (isGameOver()) GameManager.showResult('loss', score);
    }
}

function isGameOver() {
    if (grid.includes(0)) return false;
    for (let i = 0; i < 16; i++) {
        if (i % 4 < 3 && grid[i] === grid[i + 1]) return false;
        if (i < 12 && grid[i] === grid[i + 4]) return false;
    }
    return true;
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') move('left');
    if (e.key === 'ArrowRight') move('right');
    if (e.key === 'ArrowUp') move('up');
    if (e.key === 'ArrowDown') move('down');
});

let touchStartX, touchStartY;
gridElement.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

gridElement.addEventListener('touchend', e => {
    if (!touchStartX || !touchStartY) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 30) move('right'); else if (deltaX < -30) move('left');
    } else {
        if (deltaY > 30) move('down'); else if (deltaY < -30) move('up');
    }
});

newGameBtn.addEventListener('click', initGame);
initGame();
