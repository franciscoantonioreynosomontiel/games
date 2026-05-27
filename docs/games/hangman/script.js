const wordElement = document.getElementById('word');
const keyboardElement = document.getElementById('keyboard');
const livesElement = document.getElementById('lives');
const resetBtn = document.getElementById('reset-btn');

const words = ['AJEDREZ', 'SUDOKU', 'PUZZLE', 'LOGICA', 'JUEGO', 'ANDROID', 'CODIGO', 'TABLERO', 'FICHAS', 'RETO'];
let selectedWord = '';
let guessedLetters = [];
let lives = 6;
const parts = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];

function initGame() {
    selectedWord = words[Math.floor(Math.random() * words.length)];
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
    if (guessedLetters.includes(letter) || lives === 0 || wordElement.innerText === selectedWord) return;

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

GameManager.setGame('hangman');
resetBtn.addEventListener('click', initGame);
initGame();
