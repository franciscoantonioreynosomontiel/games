const startBtn = document.getElementById('start-btn');
const statusDisplay = document.getElementById('status-display');

const colors = ['red', 'blue', 'green', 'yellow'];
let sequence = [];
let userSequence = [];
let isPlaying = false;
let speed = 700;
let roundsToComplete = 3;
let currentRound = 0;

function initGame() {
    GameManager.setGame('simon', true);
    const lvl = GameManager.currentLevel;
    sequence = [];
    userSequence = [];
    isPlaying = false;
    currentRound = 0;

    // Difficulty scaling
    roundsToComplete = 2 + Math.floor(lvl / 10); // 2 to 7 rounds
    speed = Math.max(250, 750 - (lvl * 10));

    statusDisplay.innerText = `Ronda 1 de ${roundsToComplete}`;
    statusDisplay.className = 'status-badge';
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
}

async function startRound() {
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    userSequence = [];
    isPlaying = false;
    currentRound++;
    statusDisplay.innerText = `Observa... (${currentRound}/${roundsToComplete})`;
    statusDisplay.className = 'status-badge watching';

    // Add 1 color to existing sequence or create new sequence
    // To make it a "series of sequences", we add to it
    sequence.push(colors[Math.floor(Math.random() * colors.length)]);

    for (const color of sequence) {
        await flashColor(color);
        await new Promise(r => setTimeout(r, speed / 3));
    }

    isPlaying = true;
    statusDisplay.innerText = 'Tu turno';
    statusDisplay.className = 'status-badge playing';
}

function flashColor(color) {
    return new Promise(resolve => {
        const btn = document.getElementById(color);
        btn.classList.add('active');
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
        } else {
            statusDisplay.innerText = '¡Error! Repitiendo...';
            statusDisplay.className = 'status-badge watching';
            // Backtrack 1 step in sequence to help player or just repeat
            setTimeout(() => {
                currentRound--; // Reset round count for this attempt
                startRound();
            }, 1200);
        }
        return;
    }

    if (userSequence.length === sequence.length) {
        isPlaying = false;
        if (currentRound >= roundsToComplete) {
            setTimeout(() => {
                GameManager.showResult('win', `¡Excelente! Nivel superado.`);
            }, 500);
        } else {
            statusDisplay.innerText = '¡Bien!';
            setTimeout(startRound, 1000);
        }
    }
}

startBtn.onclick = startRound;

colors.forEach(color => {
    document.getElementById(color).onclick = () => handleColorClick(color);
});
