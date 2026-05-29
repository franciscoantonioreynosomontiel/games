const startBtn = document.getElementById('start-btn');
const statusDisplay = document.getElementById('status-display');

const colors = ['red', 'blue', 'green', 'yellow'];
let sequence = [];
let userSequence = [];
let isPlaying = false;
let speed = 700;

function initGame() {
    GameManager.setGame('simon');
    sequence = [];
    userSequence = [];
    isPlaying = false;
    statusDisplay.innerText = 'Listo para el nivel ' + GameManager.currentLevel;
    statusDisplay.className = 'status-badge';

    // Level scaling
    speed = Math.max(250, 750 - (GameManager.currentLevel * 10));
}

async function startRound() {
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    userSequence = [];
    isPlaying = false;
    statusDisplay.innerText = 'Observa...';
    statusDisplay.className = 'status-badge watching';

    // Sequence length grows with level
    const targetLength = 3 + Math.floor(GameManager.currentLevel / 2);

    // Generate full sequence for this round if it's the start
    if (sequence.length === 0) {
        for (let i = 0; i < targetLength; i++) {
            sequence.push(colors[Math.floor(Math.random() * colors.length)]);
        }
    }

    for (const color of sequence) {
        await flashColor(color);
        await new Promise(r => setTimeout(r, speed / 3));
    }

    isPlaying = true;
    statusDisplay.innerText = 'Tu turno (' + sequence.length + ' colores)';
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
            setTimeout(startRound, 1200);
        }
        return;
    }

    if (userSequence.length === sequence.length) {
        isPlaying = false;
        setTimeout(() => {
            GameManager.showResult('win', `¡Excelente! Secuencia de ${sequence.length} completada.`);
        }, 500);
    }
}

startBtn.onclick = startRound;

colors.forEach(color => {
    document.getElementById(color).onclick = () => handleColorClick(color);
});
