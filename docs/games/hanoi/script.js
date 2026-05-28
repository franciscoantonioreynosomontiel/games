const poles = [document.getElementById('pole-0'), document.getElementById('pole-1'), document.getElementById('pole-2')];
const movesDisplay = document.getElementById('moves');

let moves = 0;
let diskCount = 3;
let selectedPole = null;

function initGameWithDisks(d) {
    diskCount = d;
    GameManager.setGame('hanoi');
    resetHanoi();
}

function resetHanoi() {
    moves = 0;
    movesDisplay.innerText = moves;
    selectedPole = null;

    // Tighter pole height: height of all disks + a small margin
    const poleHeight = diskCount * 25 + 20;
    poles.forEach(p => {
        p.style.height = `${poleHeight}px`;
        p.style.width = `12px`; // Slightly thicker pole
        p.innerHTML = '';
        p.classList.remove('selected');
        p.onclick = () => handlePoleClick(p);
    });

    document.querySelector('.hanoi-board').style.minHeight = `${poleHeight + 30}px`;

    for (let i = diskCount; i > 0; i--) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.style.width = `${(i / (diskCount + 1)) * 100}%`;
        disk.style.height = `22px`;
        disk.dataset.size = i;
        poles[0].appendChild(disk);
    }
    updateDiskPositions();
}

function handlePoleClick(pole) {
    if (selectedPole === null) {
        const topDisk = getTopDisk(pole);
        if (topDisk) {
            selectedPole = pole;
            pole.classList.add('selected');
        }
    } else {
        if (selectedPole === pole) {
            selectedPole.classList.remove('selected');
            selectedPole = null;
        } else {
            const diskToMove = getTopDisk(selectedPole);
            const targetTopDisk = getTopDisk(pole);

            if (!targetTopDisk || parseInt(diskToMove.dataset.size) < parseInt(targetTopDisk.dataset.size)) {
                pole.appendChild(diskToMove);
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
            disk.style.bottom = `${index * 24}px`;
            disk.style.left = '50%';
            disk.style.transform = 'translateX(-50%)';
        });
    });
}

function checkWin() {
    const disksOnLastPole = poles[2].querySelectorAll('.disk');
    if (disksOnLastPole.length === diskCount) {
        setTimeout(() => GameManager.showResult('win'), 500);
    }
}

document.getElementById('reset-btn').onclick = resetHanoi;
