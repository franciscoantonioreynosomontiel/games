const levelElement = document.getElementById('level');
const startBtn = document.getElementById('start-btn');
const pads = document.querySelectorAll('.pad');

let sequence = [];
let userSequence = [];
let level = 0;
let playingSequence = false;
let playbackSpeed = 500;

function startGame() {
    GameManager.setGame('simon');
    sequence = [];
    level = GameManager.currentLevel - 1; // Start from saved level
    nextLevel();
}

function nextLevel() {
    userSequence = [];
    level++;
    levelElement.innerText = level;

    // Randomize first color or just build on top?
    // User asked to NOT always start with blue.
    // If it's a new level sequence, we can randomize.
    if (sequence.length === 0) {
        sequence.push(Math.floor(Math.random() * 4));
    } else {
        sequence.push(Math.floor(Math.random() * 4));
    }

    // Speed scaling: playback gets faster
    playbackSpeed = Math.max(150, 600 - (level * 15));

    playSequence();
}

async function playSequence() {
    playingSequence = true;

    // Challenge Mode: every 5 levels, something happens
    if (level % 5 === 0) {
        document.body.style.filter = 'invert(1)';
        setTimeout(() => document.body.style.filter = 'none', 500);
    }

    for (const id of sequence) {
        await flashPad(id);
        await sleep(playbackSpeed);
    }
    playingSequence = false;
}

function flashPad(id) {
    return new Promise(resolve => {
        const pad = document.querySelector(`.pad[data-id="${id}"]`);
        pad.classList.add('active');
        setTimeout(() => {
            pad.classList.remove('active');
            resolve();
        }, playbackSpeed);
    });
}

function handlePadClick(e) {
    if (playingSequence || sequence.length === 0) return;

    const id = parseInt(e.target.dataset.id);
    userSequence.push(id);
    flashPad(id);

    checkInput();
}

function checkInput() {
    const currentIdx = userSequence.length - 1;
    if (userSequence[currentIdx] !== sequence[currentIdx]) {
        GameManager.showResult('loss', level);
        sequence = [];
        level = 0;
        levelElement.innerText = 0;
        return;
    }

    if (userSequence.length === sequence.length) {
        if (level % 5 === 0) {
             GameManager.showResult('win', level);
        } else {
             setTimeout(nextLevel, 1000);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

GameManager.setGame('simon');
pads.forEach(pad => pad.addEventListener('click', handlePadClick));
startBtn.addEventListener('click', startGame);
