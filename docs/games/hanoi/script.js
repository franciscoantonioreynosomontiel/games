const tower1 = document.getElementById('tower1');
const tower2 = document.getElementById('tower2');
const tower3 = document.getElementById('tower3');

let diskCount = 3;
let selectedDisk = null;

function initGame() {
    // Map levels 1-7 to 3-9 disks
    const level = GameManager.currentLevel;
    diskCount = 2 + level;
    GameManager.setGame('hanoi', true);
    GameManager.maxLevel = 7;

    tower1.innerHTML = '';
    tower2.innerHTML = '';
    tower3.innerHTML = '';

    // Adjust pole height based on disk count
    const poleHeight = diskCount * 25 + 40;
    document.querySelectorAll('.pole').forEach(p => p.style.height = `${poleHeight}px`);

    for (let i = diskCount; i >= 1; i--) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.style.width = `${40 + i * 20}px`;
        disk.dataset.size = i;
        disk.draggable = true;

        // Touch Dragging Logic
        disk.addEventListener('touchstart', handleTouchStart, {passive: false});
        disk.addEventListener('touchmove', handleTouchMove, {passive: false});
        disk.addEventListener('touchend', handleTouchEnd);

        tower1.appendChild(disk);
    }
}

let touchDisk = null;
let startTower = null;

function handleTouchStart(e) {
    const disk = e.target;
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
    const topDisk = tower.lastElementChild;
    if (!topDisk) return true;
    return parseInt(disk.dataset.size) < parseInt(topDisk.dataset.size);
}

function checkWin() {
    if (tower3.childElementCount === diskCount) {
        setTimeout(() => GameManager.showResult('win'), 500);
    }
}
