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
    statusDisplay.innerText = 'Listo';
    statusDisplay.className = 'status-badge';
    speed = Math.max(250, 700 - (GameManager.currentLevel * 15));
}

async function startRound() {
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    userSequence = [];
    isPlaying = false;
    statusDisplay.innerText = 'Observa...';
    statusDisplay.className = 'status-badge watching';

    // Add 1 random color per round
    sequence.push(colors[Math.floor(Math.random() * colors.length)]);

    for (const color of sequence) {
        await flashColor(color);
        await new Promise(r => setTimeout(r, speed / 2));
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
            // Game Over
        } else {
            statusDisplay.innerText = '¡Error!';
            statusDisplay.className = 'status-badge watching';
            setTimeout(() => {
                userSequence = [];
                startRound();
            }, 1000);
        }
        return;
    }

    if (userSequence.length === sequence.length) {
        isPlaying = false;
        // Level up every 3 rounds or based on sequence length
        if (sequence.length >= 4 + Math.floor(GameManager.currentLevel / 3)) {
            GameManager.showResult('win');
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
