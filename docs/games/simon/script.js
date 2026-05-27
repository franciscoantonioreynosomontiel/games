const levelElement = document.getElementById('level');
const startBtn = document.getElementById('start-btn');
const pads = document.querySelectorAll('.pad');

let sequence = [];
let userSequence = [];
let level = 0;
let playingSequence = false;

function startGame() {
    sequence = [];
    level = 0;
    nextLevel();
}

function nextLevel() {
    userSequence = [];
    level++;
    levelElement.innerText = level;
    sequence.push(Math.floor(Math.random() * 4));
    playSequence();
}

async function playSequence() {
    playingSequence = true;
    for (const id of sequence) {
        await flashPad(id);
        await sleep(400);
    }
    playingSequence = false;
}

function flashPad(id) {
    return new Promise(resolve => {
        const pad = document.querySelector(`.pad[data-id="${id}"]`);
        pad.classList.add('active');
        // Play sound could go here
        setTimeout(() => {
            pad.classList.remove('active');
            resolve();
        }, 500);
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
        alert('¡Juego Terminado! Te equivocaste.');
        sequence = [];
        level = 0;
        levelElement.innerText = 0;
        return;
    }

    if (userSequence.length === sequence.length) {
        setTimeout(nextLevel, 1000);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

pads.forEach(pad => pad.addEventListener('click', handlePadClick));
startBtn.addEventListener('click', startGame);
