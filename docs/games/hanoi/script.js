const poles = [document.getElementById('pole-0'), document.getElementById('pole-1'), document.getElementById('pole-2')];
const movesDisplay = document.getElementById('moves');

let moves = 0;
let diskCount = 3;
let selectedPole = null;

function initHanoi(lvl) {
    diskCount = 2 + Math.ceil(lvl / 7);
    GameManager.setGame('hanoi', true);
    resetHanoi();
}

function resetHanoi() {
    moves = 0;
    movesDisplay.innerText = moves;
    selectedPole = null;

    const poleHeight = Math.max(180, diskCount * 35 + 20);
    poles.forEach(p => {
        p.style.height = `${poleHeight}px`;
        p.innerHTML = '';
        p.classList.remove('selected');

        p.ontouchstart = handleTouchStart;
        p.ontouchmove = handleTouchMove;
        p.ontouchend = handleTouchEnd;
        p.onclick = () => handlePoleClick(p);
    });

    document.getElementById('board-container').style.minHeight = `${poleHeight + 30}px`;

    for (let i = diskCount; i > 0; i--) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.dataset.size = i;
        // visual width scaling
        disk.style.width = `${25 + (i * (75 / (diskCount + 1)))}%`;
        poles[0].appendChild(disk);
    }
    updateDiskPositions();
}

let draggedDisk = null;
let sourcePole = null;

function handleTouchStart(e) {
    const pole = e.currentTarget;
    const topDisk = getTopDisk(pole);
    if (!topDisk) return;

    draggedDisk = topDisk;
    sourcePole = pole;
    draggedDisk.style.transition = 'none';
    draggedDisk.style.zIndex = '1000';
    pole.classList.add('selected');
}

function handleTouchMove(e) {
    if (!draggedDisk) return;
    const touch = e.touches[0];
    draggedDisk.style.position = 'fixed';
    draggedDisk.style.left = (touch.clientX - (draggedDisk.offsetWidth / 2)) + 'px';
    draggedDisk.style.top = (touch.clientY - (draggedDisk.offsetHeight / 2)) + 'px';
}

function handleTouchEnd(e) {
    if (!draggedDisk) return;

    const touch = e.changedTouches[0];
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetPole = targetEl ? targetEl.closest('.pole') : null;

    if (targetPole && targetPole !== sourcePole) {
        const targetTop = getTopDisk(targetPole);
        if (!targetTop || parseInt(draggedDisk.dataset.size) < parseInt(targetTop.dataset.size)) {
            targetPole.appendChild(draggedDisk);
            moves++;
            movesDisplay.innerText = moves;
            checkWin();
        }
    }

    draggedDisk.style.position = 'absolute';
    draggedDisk.style.transition = 'all 0.3s';
    draggedDisk.style.zIndex = '1';
    sourcePole.classList.remove('selected');

    draggedDisk = null;
    sourcePole = null;
    updateDiskPositions();
}

function handlePoleClick(pole) {
    if (selectedPole === null) {
        if (getTopDisk(pole)) {
            selectedPole = pole;
            pole.classList.add('selected');
        }
    } else {
        if (selectedPole === pole) {
            selectedPole.classList.remove('selected');
            selectedPole = null;
        } else {
            const disk = getTopDisk(selectedPole);
            const targetTop = getTopDisk(pole);
            if (!targetTop || parseInt(disk.dataset.size) < parseInt(targetTop.dataset.size)) {
                pole.appendChild(disk);
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

function getTopDisk(p) {
    const disks = p.querySelectorAll('.disk');
    return disks.length > 0 ? disks[disks.length - 1] : null;
}

function updateDiskPositions() {
    poles.forEach(p => {
        const disks = p.querySelectorAll('.disk');
        disks.forEach((d, i) => {
            d.style.bottom = `${i * 32}px`;
            d.style.left = '50%';
            d.style.transform = 'translateX(-50%)';
        });
    });
}

function checkWin() {
    if (poles[2].querySelectorAll('.disk').length === diskCount) {
        setTimeout(() => GameManager.showResult('win', `¡Hanoi resuelto en ${moves} movimientos!`), 500);
    }
}

document.getElementById('reset-btn').onclick = resetHanoi;
