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

    const poleHeight = diskCount * 25 + 30;
    poles.forEach(p => {
        p.style.height = `${poleHeight}px`;
        p.innerHTML = '';
        p.classList.remove('selected');

        // Touch Drag Events
        p.addEventListener('touchstart', handleTouchStart, {passive: false});
        p.addEventListener('touchmove', handleTouchMove, {passive: false});
        p.addEventListener('touchend', handleTouchEnd, {passive: false});

        // Click fallback
        p.onclick = () => handlePoleClick(p);
    });

    document.querySelector('.hanoi-board').style.minHeight = `${poleHeight + 30}px`;

    for (let i = diskCount; i > 0; i--) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        // Rounded pill width relative to disk size
        const w = 30 + (i * (70 / diskCount));
        disk.style.width = `${w}%`;
        disk.style.borderRadius = '15px';
        disk.dataset.size = i;
        poles[0].appendChild(disk);
    }
    updateDiskPositions();
}

// DRAG AND DROP LOGIC (Touch based)
let draggedDisk = null;
let startPole = null;

function handleTouchStart(e) {
    const pole = e.currentTarget;
    const topDisk = getTopDisk(pole);
    if (!topDisk) return;

    draggedDisk = topDisk;
    startPole = pole;
    draggedDisk.style.transition = 'none';
    draggedDisk.style.zIndex = '1000';
    pole.classList.add('selected');
}

function handleTouchMove(e) {
    if (!draggedDisk) return;
    e.preventDefault();
    const touch = e.touches[0];
    draggedDisk.style.position = 'fixed';
    draggedDisk.style.left = (touch.clientX - (draggedDisk.offsetWidth / 2)) + 'px';
    draggedDisk.style.top = (touch.clientY - (draggedDisk.offsetHeight / 2)) + 'px';
}

function handleTouchEnd(e) {
    if (!draggedDisk) return;

    const touch = e.changedTouches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetPole = targetElement ? targetElement.closest('.pole') : null;

    if (targetPole && targetPole !== startPole) {
        const topDisk = getTopDisk(targetPole);
        if (!topDisk || parseInt(draggedDisk.dataset.size) < parseInt(topDisk.dataset.size)) {
            targetPole.appendChild(draggedDisk);
            moves++;
            movesDisplay.innerText = moves;
            checkWin();
        }
    }

    draggedDisk.style.position = 'absolute';
    draggedDisk.style.transition = 'all 0.3s';
    draggedDisk.style.zIndex = '1';
    startPole.classList.remove('selected');

    draggedDisk = null;
    startPole = null;
    updateDiskPositions();
}

// Click Fallback
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
            disk.style.bottom = `${index * 25}px`;
            disk.style.left = '50%';
            disk.style.transform = 'translateX(-50%)';
            disk.style.position = 'absolute';
        });
    });
}

function checkWin() {
    const disksOnLastPole = poles[2].querySelectorAll('.disk');
    if (disksOnLastPole.length === diskCount) {
        setTimeout(() => GameManager.showResult('win', `¡Hanoi resuelto en ${moves} movimientos!`), 500);
    }
}

document.getElementById('reset-btn').onclick = resetHanoi;
