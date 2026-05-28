const wordElement = document.getElementById('word-display');
const hintElement = document.getElementById('hint-display');
const keyboard = document.getElementById('keyboard');
const canvas = document.getElementById('hangman-canvas');
const ctx = canvas.getContext('ctx');
const modeSelect = document.getElementById('game-mode');
const p2Input = document.getElementById('p2-custom-word');

let selectedWord = '';
let selectedHint = '';
let guessedLetters = [];
let mistakes = 0;
const maxMistakes = 6;
let gameMode = 'p1';

const p1Words = [
    { word: 'AJEDREZ', hint: 'Juego de mesa con reyes y reinas' },
    { word: 'SUDOKU', hint: 'Puzzle numérico japonés' },
    { word: 'PUZZLE', hint: 'Rompecabezas' },
    { word: 'CASCADA', hint: 'Caída de agua' },
    { word: 'GALAXY', hint: 'Conjunto de estrellas' }
];

function initGame() {
    if (gameMode === 'p1') {
        GameManager.setGame('hangman');
        const level = GameManager.currentLevel;
        // Basic words for now, in a real app we'd have a larger list or API
        const wordData = p1Words[(level - 1) % p1Words.length];
        selectedWord = wordData.word;
        selectedHint = wordData.hint;
    }

    guessedLetters = [];
    mistakes = 0;
    renderGame();
    drawHangman();
}

function renderGame() {
    wordElement.innerHTML = selectedWord.split('').map(letter =>
        `<span class="letter">${guessedLetters.includes(letter) ? letter : '_'}</span>`
    ).join('');

    // Auto-reveal some letters based on level in P1 mode if needed, or just keep it hard
    // User requested "letras de ayuda" instead of hints
    hintElement.innerText = `Longitud: ${selectedWord.length} letras`;

    keyboard.innerHTML = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('').map(l =>
        `<button onclick="guess('${l}')" ${guessedLetters.includes(l) ? 'disabled' : ''}>${l}</button>`
    ).join('');
}

function guess(letter) {
    if (guessedLetters.includes(letter)) return;
    guessedLetters.push(letter);

    if (!selectedWord.includes(letter)) {
        mistakes++;
        drawHangman();
        if (mistakes >= maxMistakes) {
            endGame(false);
        }
    } else {
        checkWin();
    }
    renderGame();
}

function checkWin() {
    if (selectedWord.split('').every(l => guessedLetters.includes(l))) {
        endGame(true);
    }
}

function endGame(won) {
    if (gameMode === 'p1') {
        GameManager.showResult(won ? 'win' : 'loss');
    } else {
        UIManager.alert(won ? '¡Ganaste!' : 'Perdiste', `La palabra era: ${selectedWord}`, won ? 'success' : 'error');
        p2Input.style.display = 'block';
    }
}

modeSelect.onchange = (e) => {
    gameMode = e.target.value;
    p2Input.style.display = gameMode === 'p2' ? 'block' : 'none';
    initGame();
};

document.getElementById('start-p2').onclick = () => {
    const word = document.getElementById('custom-word').value.toUpperCase();
    if (word.length < 3) {
        UIManager.alert('Error', 'Palabra muy corta', 'error');
        return;
    }
    selectedWord = word;
    gameMode = 'p2';
    p2Input.style.display = 'none';
    initGame();
};

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

initGame();
