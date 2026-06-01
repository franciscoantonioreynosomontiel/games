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

        // Remove old listeners to prevent duplication
        t.onclick = null;
        t.onclick = (e) => {
            // Only trigger if not a disk touch (to avoid double events)
            if (e.pointerType === 'mouse' || e.pointerType === 'touch') {
                handleTowerInteraction(t);
            }
        };
    });

    const poleHeight = diskCount * 26 + 40;
    document.querySelectorAll('.pole').forEach(p => p.style.height = `${poleHeight}px`);

    for (let i = diskCount; i >= 1; i--) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.style.width = `${40 + i * 20}px`;
        disk.style.backgroundColor = diskColors[(i - 1) % diskColors.length];
        disk.dataset.size = i;

        // Touch Dragging (Specific for mobile)
        disk.addEventListener('touchstart', handleTouchStart, {passive: false});
        disk.addEventListener('touchmove', handleTouchMove, {passive: false});
        disk.addEventListener('touchend', handleTouchEnd);

        tower1.appendChild(disk);
    }
}

// HYBRID LOGIC
function handleTowerInteraction(tower) {
    if (selectedDisk) {
        if (isValidMove(tower, selectedDisk)) {
            tower.appendChild(selectedDisk);
            selectedDisk.classList.remove('dragging');
            selectedDisk = null;
            checkWin();
        } else {
            // Deselect if invalid or same tower
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

// TOUCH DRAG (Mobile)
let touchDisk = null;
let startTower = null;
let touchOffset = { x: 0, y: 0 };

function handleTouchStart(e) {
    const disk = e.target;
    if (!disk.classList.contains('disk')) return;
    const tower = disk.parentElement;
    if (tower.lastElementChild !== disk) return;

    // Clear click selection if dragging
    if (selectedDisk) selectedDisk.classList.remove('dragging');
    selectedDisk = null;

    touchDisk = disk;
    startTower = tower;

    const touch = e.touches[0];
    const rect = disk.getBoundingClientRect();
    touchOffset.x = touch.clientX - rect.left;
    touchOffset.y = touch.clientY - rect.top;

    // Prepare disk for GPU-accelerated dragging
    touchDisk.style.position = 'fixed';
    touchDisk.style.top = '0';
    touchDisk.style.left = '0';
    touchDisk.style.zIndex = '1000';
    touchDisk.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0) scale(1.1)`;

    disk.classList.add('dragging');
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!touchDisk) return;
    const touch = e.touches[0];
    const x = touch.clientX - touchOffset.x;
    const y = touch.clientY - touchOffset.y;
    touchDisk.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.1)`;
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (!touchDisk) return;

    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    let targetTower = dropTarget ? dropTarget.closest('.tower') : null;

    // Fallback: search for the closest tower if elementFromPoint failed or returned something else
    if (!targetTower) {
        const towers = [tower1, tower2, tower3];
        let closest = null;
        let minDistance = 150; // Increased threshold for easier drops

        towers.forEach(t => {
            const rect = t.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const distance = Math.abs(touch.clientX - centerX);
            if (distance < minDistance) {
                minDistance = distance;
                closest = t;
            }
        });
        targetTower = closest;
    }

    touchDisk.classList.remove('dragging');
    touchDisk.style.position = '';
    touchDisk.style.top = '';
    touchDisk.style.left = '';
    touchDisk.style.transform = '';
    touchDisk.style.zIndex = '';

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
