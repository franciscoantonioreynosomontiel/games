const wordElement = document.getElementById('word-display');
const hintElement = document.getElementById('hint-display');
const keyboard = document.getElementById('keyboard');
const canvas = document.getElementById('hangman-canvas');
const ctx = canvas.getContext('2d');
const modeSelect = document.getElementById('game-mode');
const p2Input = document.getElementById('p2-custom-word');

let selectedWord = '';
let guessedLetters = [];
let mistakes = 0;
const maxMistakes = 6;
let gameMode = 'p1';

const p1Words = [
    'AJEDREZ', 'SUDOKU', 'PUZZLE', 'CASCADA', 'GALAXY',
    'DINOSAURIO', 'ELECTRICIDAD', 'PROGRAMACION', 'AVENTURA', 'MONTANA',
    'OCEANO', 'TECLADO', 'PANTALLA', 'CELULAR', 'GUITARRA',
    'PIANO', 'BATERIA', 'ESTRELLA', 'COMETA', 'PLANETA'
];

function initGame() {
    // Only call setGame in P1 mode to track levels
    if (gameMode === 'p1') {
        GameManager.setGame('hangman');
        const level = GameManager.currentLevel;
        selectedWord = p1Words[(level - 1) % p1Words.length];
    }

    guessedLetters = [];
    mistakes = 0;
    renderGame();
    drawHangman();
}

function renderGame() {
    wordElement.innerHTML = selectedWord.split('').map(letter =>
        `<span class="letter">${guessedLetters.includes(letter) ? letter : '_'}</span>`
    ).join(' ');

    hintElement.innerText = `Longitud: ${selectedWord.length} letras`;

    keyboard.innerHTML = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('').map(l =>
        `<button onclick="guess('${l}')" ${guessedLetters.includes(l) ? 'disabled' : ''}>${l}</button>`
    ).join('');
}

function guess(letter) {
    if (guessedLetters.includes(letter) || mistakes >= maxMistakes) return;
    guessedLetters.push(letter);

    if (!selectedWord.includes(letter)) {
        mistakes++;
        drawHangman();
        if (mistakes >= maxMistakes) {
            setTimeout(() => endGame(false), 300);
        }
    } else {
        if (selectedWord.split('').every(l => guessedLetters.includes(l))) {
            setTimeout(() => endGame(true), 300);
        }
    }
    renderGame();
}

function endGame(won) {
    if (gameMode === 'p1') {
        GameManager.showResult(won ? 'win' : 'loss');
    } else {
        UIManager.alert(won ? '¡Ganaste!' : 'Perdiste', `La palabra era: ${selectedWord}`, won ? 'success' : 'error').then(() => {
            // Reset to splash for 2P mode
            location.reload();
        });
    }
}

function drawHangman() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#333';

    // Base
    if (mistakes > 0) { ctx.beginPath(); ctx.moveTo(10, 180); ctx.lineTo(190, 180); ctx.stroke(); }
    // Post
    if (mistakes > 1) { ctx.beginPath(); ctx.moveTo(50, 180); ctx.lineTo(50, 20); ctx.lineTo(120, 20); ctx.lineTo(120, 40); ctx.stroke(); }
    // Head
    if (mistakes > 2) { ctx.beginPath(); ctx.arc(120, 60, 20, 0, Math.PI * 2); ctx.stroke(); }
    // Body
    if (mistakes > 3) { ctx.beginPath(); ctx.moveTo(120, 80); ctx.lineTo(120, 130); ctx.stroke(); }
    // Arms
    if (mistakes > 4) {
        ctx.beginPath(); ctx.moveTo(120, 90); ctx.lineTo(90, 110); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(120, 90); ctx.lineTo(150, 110); ctx.stroke();
    }
    // Legs
    if (mistakes > 5) {
        ctx.beginPath(); ctx.moveTo(120, 130); ctx.lineTo(90, 160); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(120, 130); ctx.lineTo(150, 160); ctx.stroke();
    }
}
