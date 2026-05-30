const colorButtons = [
    document.getElementById('green'),
    document.getElementById('red'),
    document.getElementById('yellow'),
    document.getElementById('blue')
];

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
    startRound();
}

function startRound() {
    userSequence = [];
    // Levels affect playback speed
    const speed = Math.max(800 - (GameManager.currentLevel * 40), 200);

    // Add one new step to the sequence
    sequence.push(Math.floor(Math.random() * 4));

    playSequence(speed);
}

function playSequence(speed) {
    isPlayingSequence = true;
    let i = 0;
    const interval = setInterval(() => {
        flashButton(sequence[i]);
        i++;
        if (i >= sequence.length) {
            clearInterval(interval);
            isPlayingSequence = false;
        }
    }, speed);
}

function flashButton(index) {
    const btn = colorButtons[index];
    btn.classList.add('active');
    // Simple audio feedback simulation
    setTimeout(() => btn.classList.remove('active'), 300);
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
            // Restart current round
            userSequence = [];
            setTimeout(() => playSequence(800 - (GameManager.currentLevel * 40)), 1000);
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
            setTimeout(startRound, 1000);
        }
    }
}

colorButtons.forEach((btn, i) => btn.onclick = () => handleInput(i));
