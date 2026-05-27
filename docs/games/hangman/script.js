const wordElement = document.getElementById('word');
const keyboardElement = document.getElementById('keyboard');
const livesElement = document.getElementById('lives');
const lvlDisplay = document.getElementById('lvl-display');
const hintBox = document.getElementById('hint-box');
const mode1p = document.getElementById('mode-1p');
const mode2p = document.getElementById('mode-2p');
const modal2p = document.getElementById('word-entry-modal');
const start2pBtn = document.getElementById('start-2p');

const levels = [
    { w: 'SOL', h: 'Estrella central' },
    { w: 'LUNA', h: 'Satélite natural' },
    { w: 'CASA', h: 'Hogar' },
    { w: 'GATO', h: 'Mascota felina' },
    { w: 'PERRO', h: 'Mejor amigo del hombre' },
    { w: 'ARBOL', h: 'Planta alta' },
    { w: 'LIBRO', h: 'Para leer' },
    { w: 'AGUA', h: 'Vital para la vida' },
    { w: 'FUEGO', h: 'Quema' },
    { w: 'TIGRE', h: 'Felino rayado' },
    { w: 'ESPAÑA', h: 'País europeo' },
    { w: 'MEXICO', h: 'País del tequila' },
    { w: 'TECLADO', h: 'Para escribir' },
    { w: 'RATON', h: 'Animal pequeño o periférico' },
    { w: 'CIELO', h: 'Azul arriba' },
    { w: 'PLAYA', h: 'Arena y mar' },
    { w: 'NIEVE', h: 'Frio y blanco' },
    { w: 'QUESO', h: 'Viene de la leche' },
    { w: 'PIZZA', h: 'Comida italiana' },
    { w: 'DIBUJO', h: 'Arte con lápiz' },
    { w: 'MUSICA', h: 'Arte sonoro' },
    { w: 'VIAJE', h: 'Ir de un lugar a otro' },
    { w: 'SUEÑO', h: 'Al dormir' },
    { w: 'RELOJ', h: 'Da la hora' },
    { w: 'PUERTA', h: 'Para entrar' },
    { w: 'VENTANA', h: 'Para mirar afuera' },
    { w: 'CAMINO', h: 'Para andar' },
    { w: 'ZAPATO', h: 'En el pie' },
    { w: 'GUITARRA', h: 'Instrumento de cuerdas' },
    { w: 'ESTRELLA', h: 'Brilla en la noche' },
    { w: 'MANZANA', h: 'Fruta roja' },
    { w: 'NARANJA', h: 'Fruta cítrica' },
    { w: 'PELOTA', h: 'Para jugar fútbol' },
    { w: 'AVION', h: 'Vuela' },
    { w: 'BARCO', h: 'Navega' },
    { w: 'TREN', h: 'Por los rieles' },
    { w: 'BICICLETA', h: 'Dos ruedas' },
    { w: 'ESCUELA', h: 'Para aprender' },
    { w: 'MAESTRO', h: 'Enseña' },
    { w: 'MEDICO', h: 'Cura' },
    { w: 'DINERO', h: 'Para comprar' },
    { w: 'AMIGO', h: 'Compañero' },
    { w: 'FAMILIA', h: 'Vínculo de sangre' },
    { w: 'CIUDAD', h: 'Muchos edificios' },
    { w: 'BOSQUE', h: 'Muchos árboles' },
    { w: 'MONTAÑA', h: 'Muy alta' },
    { w: 'UNIVERSO', h: 'Todo lo que existe' },
    { w: 'CIENCIA', h: 'Conocimiento' },
    { w: 'HISTORIA', h: 'Pasado' },
    { w: 'FUTURO', h: 'Lo que vendrá' }
];

let selectedWord = '';
let guessedLetters = [];
let lives = 6;
let is2p = false;
const parts = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];

function initGame() {
    GameManager.setGame('hangman');
    lvlDisplay.innerText = GameManager.currentLevel;

    if (is2p) {
        modal2p.style.display = 'flex';
        return;
    }

    const current = levels[GameManager.currentLevel - 1] || levels[levels.length - 1];
    selectedWord = current.w;
    hintBox.innerText = `Pista: ${current.h}`;

    resetBoard();
}

function resetBoard() {
    guessedLetters = [];
    lives = 6;
    livesElement.innerText = lives;
    parts.forEach(id => document.getElementById(id).classList.remove('visible'));
    renderWord();
    renderKeyboard();
}

function renderWord() {
    wordElement.innerText = selectedWord
        .split('')
        .map(letter => guessedLetters.includes(letter) ? letter : '_')
        .join('');
}

function renderKeyboard() {
    keyboardElement.innerHTML = '';
    const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
    alphabet.split('').forEach(letter => {
        const key = document.createElement('div');
        key.classList.add('key');
        key.innerText = letter;
        if (guessedLetters.includes(letter)) key.classList.add('disabled');
        key.addEventListener('click', () => handleGuess(letter));
        keyboardElement.appendChild(key);
    });
}

function handleGuess(letter) {
    if (guessedLetters.includes(letter) || lives === 0 || wordElement.innerText.replace(/ /g, '') === selectedWord) return;

    guessedLetters.push(letter);
    renderKeyboard();

    if (selectedWord.includes(letter)) {
        renderWord();
        checkWin();
    } else {
        lives--;
        livesElement.innerText = lives;
        document.getElementById(parts[5 - lives]).classList.add('visible');
        if (lives === 0) {
            GameManager.showResult('loss');
        }
    }
}

function checkWin() {
    if (wordElement.innerText === selectedWord) {
        GameManager.showResult('win');
    }
}

mode1p.onclick = () => {
    is2p = false;
    mode1p.classList.add('active');
    mode2p.classList.remove('active');
    initGame();
};

mode2p.onclick = () => {
    is2p = true;
    mode2p.classList.add('active');
    mode1p.classList.remove('active');
    initGame();
};

start2pBtn.onclick = () => {
    const word = document.getElementById('custom-word').value.toUpperCase().trim();
    if (word.length < 2) {
        UIManager.alert('Error', 'Palabra muy corta', 'error');
        return;
    }
    selectedWord = word;
    hintBox.innerText = 'Modo 2 Jugadores';
    modal2p.style.display = 'none';
    resetBoard();
};

initGame();
