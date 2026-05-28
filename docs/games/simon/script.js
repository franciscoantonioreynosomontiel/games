const gameBoard = document.getElementById('game-board');
const startBtn = document.getElementById('start-btn');
const statusDisplay = document.getElementById('status-display');

const colors = ['red', 'blue', 'green', 'yellow'];
let sequence = [];
let userSequence = [];
let isPlaying = false;
let speed = 600;

function initGame() {
    GameManager.setGame('simon');
    sequence = [];
    userSequence = [];
    isPlaying = false;
    statusDisplay.innerText = 'Presiona comenzar';
    speed = Math.max(200, 600 - (GameManager.currentLevel * 20));
}

async function startRound() {
    userSequence = [];
    isPlaying = false;
    statusDisplay.innerText = 'Observa...';

    // Add random color to sequence
    sequence.push(colors[Math.floor(Math.random() * colors.length)]);

    for (const color of sequence) {
        await flashColor(color);
        await new Promise(r => setTimeout(r, speed / 2));
    }

    isPlaying = true;
    statusDisplay.innerText = 'Tu turno';
}

function flashColor(color) {
    return new Promise(resolve => {
        const btn = document.getElementById(color);
        btn.classList.add('active');
        // Play sound if any
        setTimeout(() => {
            btn.classList.remove('active');
            resolve();
        }, speed);
    });
}

function handleColorClick(color) {
    if (!isPlaying) return;

    flashColor(color);
    userSequence.push(color);

    const currentIdx = userSequence.length - 1;
    if (userSequence[currentIdx] !== sequence[currentIdx]) {
        isPlaying = false;
        if (GameManager.loseLife()) {
            // Game Over
        } else {
            statusDisplay.innerText = '¡Error! Reintentando ronda...';
            userSequence = [];
            setTimeout(() => {
                isPlaying = true;
                statusDisplay.innerText = 'Tu turno';
            }, 1000);
        }
        return;
    }

    if (userSequence.length === sequence.length) {
        isPlaying = false;
        if (sequence.length >= 5 + Math.floor(GameManager.currentLevel / 2)) {
            GameManager.showResult('win');
        } else {
            statusDisplay.innerText = '¡Bien!';
            setTimeout(startRound, 1000);
        }
    }
}

startBtn.onclick = () => {
    initGame();
    startRound();
};

colors.forEach(color => {
    document.getElementById(color).onclick = () => handleColorClick(color);
});

initGame();
