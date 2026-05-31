const tower1 = document.getElementById('tower1');
const tower2 = document.getElementById('tower2');
const tower3 = document.getElementById('tower3');

let diskCount = 3;
const diskColors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688'];
let selectedDisk = null;

function initGame() {
    const diff = GameManager.currentLevel;
    diskCount = 2 + diff;
    GameManager.setGame('hanoi', false, 'Dificultad ' + diff);

    [tower1, tower2, tower3].forEach(t => {
        t.innerHTML = '<div class="pole"></div><div class="base"></div>';
        t.onclick = () => handleTowerClick(t);
    });

    const poleHeight = diskCount * 26 + 40;
    document.querySelectorAll('.pole').forEach(p => p.style.height = `${poleHeight}px`);

    for (let i = diskCount; i >= 1; i--) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.style.width = `${40 + i * 20}px`;
        disk.style.backgroundColor = diskColors[(i - 1) % diskColors.length];
        disk.dataset.size = i;

        disk.addEventListener('touchstart', handleTouchStart, {passive: false});
        disk.addEventListener('touchmove', handleTouchMove, {passive: false});
        disk.addEventListener('touchend', handleTouchEnd);

        tower1.appendChild(disk);
    }
}

// CLICK LOGIC (PC)
function handleTowerClick(tower) {
    if (selectedDisk) {
        if (isValidMove(tower, selectedDisk)) {
            tower.appendChild(selectedDisk);
            selectedDisk.classList.remove('dragging');
            selectedDisk = null;
            checkWin();
        } else {
            selectedDisk.classList.remove('dragging');
            selectedDisk = null;
        }
    } else {
        const disks = Array.from(tower.children).filter(c => c.classList.contains('disk'));
        if (disks.length > 0) {
            selectedDisk = disks[disks.length - 1];
            selectedDisk.classList.add('dragging');
        }
    }
}

// TOUCH LOGIC (MOBILE)
let touchDisk = null;
let startTower = null;

function handleTouchStart(e) {
    const disk = e.target;
    if (!disk.classList.contains('disk')) return;
    const tower = disk.parentElement;
    if (tower.lastElementChild !== disk) return;

    touchDisk = disk;
    startTower = tower;
    disk.classList.add('dragging');
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!touchDisk) return;
    const touch = e.touches[0];
    touchDisk.style.position = 'fixed';
    touchDisk.style.left = (touch.clientX - touchDisk.offsetWidth / 2) + 'px';
    touchDisk.style.top = (touch.clientY - touchDisk.offsetHeight / 2) + 'px';
    touchDisk.style.zIndex = '1000';
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (!touchDisk) return;
    touchDisk.classList.remove('dragging');
    touchDisk.style.position = '';
    touchDisk.style.left = '';
    touchDisk.style.top = '';
    touchDisk.style.zIndex = '';

    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetTower = dropTarget ? dropTarget.closest('.tower') : null;

    if (targetTower && isValidMove(targetTower, touchDisk)) {
        targetTower.appendChild(touchDisk);
        checkWin();
    } else {
        startTower.appendChild(touchDisk);
    }

    touchDisk = null;
    startTower = null;
}

function isValidMove(tower, disk) {
    const disks = Array.from(tower.children).filter(c => c.classList.contains('disk'));
    if (disks.length === 0) return true;
    const topDisk = disks[disks.length - 1];
    return parseInt(disk.dataset.size) < parseInt(topDisk.dataset.size);
}

function checkWin() {
    const disksInTower3 = Array.from(tower3.children).filter(c => c.classList.contains('disk')).length;
    if (disksInTower3 === diskCount) {
        setTimeout(() => GameManager.showResult('win', '¡Torre completada!'), 500);
    }
}
