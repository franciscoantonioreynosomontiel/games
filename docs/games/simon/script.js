const colorButtons = [
    document.getElementById('green'),
    document.getElementById('red'),
    document.getElementById('yellow'),
    document.getElementById('blue')
];
const statusDisplay = document.getElementById('status-display');

let sequence = [];
let userSequence = [];
let isPlayingSequence = false;
let roundCount = 0;
const roundsPerLevel = 5; // Standard 5 rounds

function initGame() {
    GameManager.setGame('simon', true);
    sequence = [];
    userSequence = [];
    roundCount = 0;
    updateStatus();
    setTimeout(startRound, 1000);
}

function updateStatus() {
    if (statusDisplay) {
        statusDisplay.innerText = `Secuencia: ${roundCount + 1}/${roundsPerLevel}`;
    }
}

function startRound() {
    if (isPlayingSequence) return;
    userSequence = [];
    updateStatus();

    const speed = Math.max(800 - (GameManager.currentLevel * 40), 200);
    sequence.push(Math.floor(Math.random() * 4));

    playSequence(speed);
}

function playSequence(speed) {
    isPlayingSequence = true;
    if (statusDisplay) {
        statusDisplay.innerText = "¡Observa!";
        statusDisplay.className = "status-badge watching";
    }

    let i = 0;
    const interval = setInterval(() => {
        flashButton(sequence[i]);
        i++;
        if (i >= sequence.length) {
            clearInterval(interval);
            setTimeout(() => {
                isPlayingSequence = false;
                if (statusDisplay) {
                    statusDisplay.className = "status-badge playing";
                    updateStatus();
                }
            }, 500);
        }
    }, speed);
}

function flashButton(index) {
    const btn = colorButtons[index];
    if (btn) {
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 300);
    }
}

function handleInput(index) {
    if (isPlayingSequence) return;

    flashButton(index);
    userSequence.push(index);

    const lastIdx = userSequence.length - 1;
    if (userSequence[lastIdx] !== sequence[lastIdx]) {
        if (GameManager.loseLife()) {
            // End game handled by GM
        } else {
            userSequence = [];
            setTimeout(() => playSequence(Math.max(800 - (GameManager.currentLevel * 40), 200)), 1000);
        }
        return;
    }

    if (userSequence.length === sequence.length) {
        roundCount++;
        if (roundCount >= roundsPerLevel) {
            setTimeout(() => {
                GameManager.showResult('win', `¡Nivel ${GameManager.currentLevel} superado!`);
            }, 600);
        } else {
            // Automatic start of next round without user click
            setTimeout(startRound, 1200);
        }
    }
}

colorButtons.forEach((btn, i) => {
    if (btn) btn.onclick = () => handleInput(i);
});
