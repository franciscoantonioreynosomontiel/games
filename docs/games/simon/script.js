const colorButtons = [
    document.getElementById('green'),
    document.getElementById('red'),
    document.getElementById('yellow'),
    document.getElementById('blue')
];
const statusDisplay = document.getElementById('status-display');
const startBtn = document.getElementById('start-btn');

let sequence = [];
let userSequence = [];
let isPlayingSequence = false;
let roundCount = 0;
const roundsPerLevel = 3;

function initGame() {
    GameManager.setGame('simon', true);
    sequence = [];
    userSequence = [];
    roundCount = 0;
    updateStatus();
    startBtn.style.display = 'block';
}

function updateStatus() {
    statusDisplay.innerText = `Ronda ${roundCount + 1}/${roundsPerLevel}`;
}

function startRound() {
    startBtn.style.display = 'none';
    userSequence = [];
    updateStatus();

    const speed = Math.max(800 - (GameManager.currentLevel * 40), 200);
    sequence.push(Math.floor(Math.random() * 4));

    playSequence(speed);
}

function playSequence(speed) {
    isPlayingSequence = true;
    statusDisplay.innerText = "¡Observa!";
    statusDisplay.className = "status-badge watching";

    let i = 0;
    const interval = setInterval(() => {
        flashButton(sequence[i]);
        i++;
        if (i >= sequence.length) {
            clearInterval(interval);
            setTimeout(() => {
                isPlayingSequence = false;
                statusDisplay.innerText = "¡Tu turno!";
                statusDisplay.className = "status-badge playing";
            }, 500);
        }
    }, speed);
}

function flashButton(index) {
    const btn = colorButtons[index];
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 300);
}

function handleInput(index) {
    if (isPlayingSequence) return;

    flashButton(index);
    userSequence.push(index);

    const lastIdx = userSequence.length - 1;
    if (userSequence[lastIdx] !== sequence[lastIdx]) {
        if (GameManager.loseLife()) {
            // GM handles loss
        } else {
            // Restart sequence
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
            }, 500);
        } else {
            setTimeout(() => {
                updateStatus();
                startBtn.style.display = 'block';
            }, 1000);
        }
    }
}

colorButtons.forEach((btn, i) => btn.onclick = () => handleInput(i));
