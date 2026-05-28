const poles = [document.getElementById('pole-0'), document.getElementById('pole-1'), document.getElementById('pole-2')];
const movesDisplay = document.getElementById('moves');
const levelDisplay = document.getElementById('level-display');

let disks = [];
let moves = 0;
let diskCount = 3;
let selectedPole = null;

function initGame() {
    const gameState = GameManager.setGame('hanoi');
    diskCount = 3 + Math.floor((gameState.level - 1) / 5); // Increase disk every 5 levels
    levelDisplay.innerText = gameState.level;

    moves = 0;
    movesDisplay.innerText = moves;
    selectedPole = null;

    poles.forEach(p => {
        p.innerHTML = '<div class="pole-line"></div>';
        p.classList.remove('selected');
        p.onclick = () => handlePoleClick(p);
    });

    disks = [];
    for (let i = diskCount; i > 0; i--) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.style.width = `${(i / diskCount) * 100}%`;
        disk.style.bottom = `${(diskCount - i) * 25}px`;
        disk.dataset.size = i;
        poles[0].appendChild(disk);
    }
    updateDiskPositions();
}

function handlePoleClick(pole) {
    const poleIndex = parseInt(pole.id.split('-')[1]);

    if (selectedPole === null) {
        // Select source
        const topDisk = getTopDisk(pole);
        if (topDisk) {
            selectedPole = pole;
            pole.classList.add('selected');
        }
    } else {
        // Select target
        if (selectedPole === pole) {
            selectedPole.classList.remove('selected');
            selectedPole = null;
        } else {
            const targetPole = pole;
            const diskToMove = getTopDisk(selectedPole);
            const targetTopDisk = getTopDisk(targetPole);

            if (!targetTopDisk || parseInt(diskToMove.dataset.size) < parseInt(targetTopDisk.dataset.size)) {
                targetPole.appendChild(diskToMove);
                moves++;
                movesDisplay.innerText = moves;
                checkWin();
            }

            selectedPole.classList.remove('selected');
            selectedPole = null;
            updateDiskPositions();
        }
    }
}

function getTopDisk(pole) {
    const disksOnPole = pole.querySelectorAll('.disk');
    if (disksOnPole.length === 0) return null;
    return disksOnPole[disksOnPole.length - 1];
}

function updateDiskPositions() {
    poles.forEach(pole => {
        const disksOnPole = pole.querySelectorAll('.disk');
        disksOnPole.forEach((disk, index) => {
            disk.style.bottom = `${index * 25}px`;
        });
    });
}

function checkWin() {
    const disksOnLastPole = poles[2].querySelectorAll('.disk');
    if (disksOnLastPole.length === diskCount) {
        setTimeout(() => GameManager.showResult('win'), 500);
    }
}

document.getElementById('reset-btn').onclick = initGame;
initGame();
