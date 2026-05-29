const wordElement = document.getElementById('word-display');
const hintElement = document.getElementById('hint-display');
const keyboard = document.getElementById('keyboard');
const canvas = document.getElementById('hangman-canvas');
const ctx = canvas.getContext('2d');

let selectedWord = '';
let guessedLetters = [];
let mistakes = 0;
const maxMistakes = 6;
let gameMode = 'p1';

const wordLibrary = [
    'EL RATON DE LOS DIENTES', 'SUDOKU', 'AJEDREZ', 'PROGRAMACION', 'CASCADA',
    'AVENTURA', 'DINOSAURIO', 'ELECTRICIDAD', 'PANTALLA', 'CELULAR',
    'GUITARRA', 'OCEANO', 'PLANETA', 'ESTRELLA', 'PIANO',
    'BATERIA', 'TECLADO', 'MONTANA', 'COMETA', 'CINE',
    'CHOCOLATE', 'ESCUELA', 'VACACIONES', 'VIAJE', 'BOSQUE',
    'JARDIN', 'RELOJ', 'VENTANA', 'PUERTA', 'SOPA',
    'DESAYUNO', 'ALMUERZO', 'COMIDA', 'CENA', 'PAN',
    'FRUTA', 'VERDURA', 'CARNE', 'PESCADO', 'AGUA',
    'JUGO', 'LECHE', 'DULCE', 'CARAMELO', 'HELADO',
    'PASTEL', 'FIESTA', 'CUMPLEANOS', 'REGALO', 'AMIGO'
];

function initGame() {
    if (gameMode === 'p1') {
        GameManager.setGame('hangman', true);
        const level = GameManager.currentLevel;
        selectedWord = wordLibrary[(level - 1) % wordLibrary.length];

        guessedLetters = [' ', '-', '.', ','];
        const uniqueLetters = [...new Set(selectedWord.replace(/[^A-ZÑ]/g, '').split(''))];

        // Helper letters logic
        let helpCount = 0;
        if (level < 10) helpCount = Math.floor(uniqueLetters.length * 0.25);
        else if (level < 30) helpCount = Math.floor(uniqueLetters.length * 0.15);
        else helpCount = 1;

        if (helpCount < 1) helpCount = 1;

        for(let i=0; i<helpCount; i++) {
            const idx = Math.floor(Math.random() * uniqueLetters.length);
            guessedLetters.push(uniqueLetters[idx]);
            uniqueLetters.splice(idx, 1);
        }
    } else {
        GameManager.setGame('hangman', false, 'PVP');
        guessedLetters = [' ', '-', '.', ','];
    }

    mistakes = 0;
    renderGame();
    drawHangman();
}

function renderGame() {
    wordElement.innerHTML = selectedWord.split(' ').map(word => {
        return `<div style="display: flex; gap: 5px;">` + word.split('').map(letter => {
            return `<span class="letter">${guessedLetters.includes(letter) ? letter : '_'}</span>`;
        }).join('') + `</div>`;
    }).join('&nbsp;&nbsp;');

    hintElement.innerText = `Longitud: ${selectedWord.length} caracteres`;

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
            setTimeout(() => endGame(false), 500);
        }
    } else {
        const isWin = selectedWord.split('').every(l => guessedLetters.includes(l));
        if (isWin) setTimeout(() => endGame(true), 500);
    }
    renderGame();
}

function endGame(won) {
    if (gameMode === 'p1') {
        GameManager.showResult(won ? 'win' : 'loss', won ? '¡Palabra completada!' : `La palabra era: ${selectedWord}`);
    } else {
        UIManager.alert(won ? '¡Ganaste!' : 'Perdiste', `La palabra era: ${selectedWord}`, won ? 'success' : 'error').then(() => {
            location.reload();
        });
    }
}

function drawHangman() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#333';

    if (mistakes > 0) { ctx.beginPath(); ctx.moveTo(10, 170); ctx.lineTo(170, 170); ctx.stroke(); }
    if (mistakes > 1) { ctx.beginPath(); ctx.moveTo(40, 170); ctx.lineTo(40, 20); ctx.lineTo(110, 20); ctx.lineTo(110, 40); ctx.stroke(); }
    if (mistakes > 2) { ctx.beginPath(); ctx.arc(110, 60, 20, 0, Math.PI * 2); ctx.stroke(); }
    if (mistakes > 3) { ctx.beginPath(); ctx.moveTo(110, 80); ctx.lineTo(110, 120); ctx.stroke(); }
    if (mistakes > 4) {
        ctx.beginPath(); ctx.moveTo(110, 90); ctx.lineTo(80, 110); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(110, 90); ctx.lineTo(140, 110); ctx.stroke();
    }
    if (mistakes > 5) {
        ctx.beginPath(); ctx.moveTo(110, 120); ctx.lineTo(80, 150); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(110, 120); ctx.lineTo(140, 150); ctx.stroke();
    }
}
