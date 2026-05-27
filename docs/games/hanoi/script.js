const towers = [document.querySelectorAll('.tower')[0], document.querySelectorAll('.tower')[1], document.querySelectorAll('.tower')[2]];
const movesElement = document.getElementById('moves');
const lvlElement = document.getElementById('lvl');
const targetMovesElement = document.getElementById('target-moves');
const resetBtn = document.getElementById('reset-btn');

let towersData = [[], [], []];
let selectedTowerIdx = null;
let moves = 0;
let diskCount = 3;

function initGame() {
    GameManager.setGame('hanoi');
    const level = GameManager.currentLevel;
    lvlElement.innerText = level;

    // Scale disk count by level segments
    if (level < 10) diskCount = 3;
    else if (level < 20) diskCount = 4;
    else if (level < 30) diskCount = 5;
    else if (level < 40) diskCount = 6;
    else diskCount = 7;

    const minMoves = Math.pow(2, diskCount) - 1;
    targetMovesElement.innerText = `Mínimo de movimientos: ${minMoves}`;

    moves = 0;
    movesElement.innerText = moves;
    selectedTowerIdx = null;
    towersData = [[], [], []];

    for (let i = diskCount; i >= 1; i--) {
        towersData[0].push(i);
    }

    renderBoard();
}

function renderBoard() {
    towers.forEach((towerEl, tIdx) => {
        // Clear disks only, keep base and pole
        const existingDisks = towerEl.querySelectorAll('.disk');
        existingDisks.forEach(d => d.remove());

        towersData[tIdx].forEach((diskSize, dIdx) => {
            const disk = document.createElement('div');
            disk.classList.add('disk', `disk-${diskSize}`);
            disk.innerText = diskSize;
            if (selectedTowerIdx === tIdx && dIdx === towersData[tIdx].length - 1) {
                disk.classList.add('selected');
            }
            towerEl.appendChild(disk);
        });
    });
}

function handleTowerClick(idx) {
    if (selectedTowerIdx === null) {
        if (towersData[idx].length > 0) {
            selectedTowerIdx = idx;
            renderBoard();
        }
    } else {
        if (selectedTowerIdx === idx) {
            selectedTowerIdx = null;
            renderBoard();
            return;
        }

        const sourceTower = towersData[selectedTowerIdx];
        const targetTower = towersData[idx];
        const movingDisk = sourceTower[sourceTower.length - 1];

        if (targetTower.length === 0 || movingDisk < targetTower[targetTower.length - 1]) {
            targetTower.push(sourceTower.pop());
            moves++;
            movesElement.innerText = moves;
            selectedTowerIdx = null;
            renderBoard();
            checkWin();
        } else {
            UIManager.alert('Error', 'No puedes poner un disco grande sobre uno pequeño', 'warning');
            selectedTowerIdx = null;
            renderBoard();
        }
    }
}

function checkWin() {
    if (towersData[2].length === diskCount) {
        GameManager.showResult('win', moves);
    }
}

towers.forEach((t, i) => t.addEventListener('click', () => handleTowerClick(i)));
resetBtn.addEventListener('click', initGame);

initGame();
