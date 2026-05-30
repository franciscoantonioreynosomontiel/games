const wordList = [
    { word: "CASA", hint: "Lugar donde vives" },
    { word: "PERRO", hint: "El mejor amigo del hombre" },
    { word: "TECLADO", hint: "Periférico para escribir" },
    { word: "POSTRE", hint: "Se come al final de la comida" },
    { word: "PLANETA", hint: "La Tierra es uno" },
    { word: "ESTRELLA", hint: "Brilla en el cielo nocturno" },
    { word: "MONTAÑA", hint: "Elevación natural del terreno" },
    { word: "GUITARRA", hint: "Instrumento de seis cuerdas" },
    { word: "CELESTE", hint: "Color del cielo despejado" },
    { word: "BIBLIOTECA", hint: "Lugar lleno de libros" },
    { word: "DINOSAURIO", hint: "Animal prehistórico extinto" },
    { word: "MARIPOSA", hint: "Insecto con alas coloridas" },
    { word: "TELEFONO", hint: "Dispositivo para llamar" },
    { word: "HELADO", hint: "Dulce frío de muchos sabores" },
    { word: "BICICLETA", hint: "Vehículo de dos ruedas" },
    { word: "COCODRILO", hint: "Reptil de grandes mandíbulas" },
    { word: "PIRAMIDE", hint: "Construcción antigua de Egipto" },
    { word: "UNIVERSO", hint: "Todo lo que existe en el espacio" },
    { word: "FUTBOL", hint: "Deporte de once contra once" },
    { word: "CHOCOLATE", hint: "Dulce hecho de cacao" },
    { word: "ORQUESTA", hint: "Grupo de músicos dirigidos" },
    { word: "AVENTURA", hint: "Experiencia emocionante" },
    { word: "HORMIGA", hint: "Insecto pequeño y trabajador" },
    { word: "ESPEJO", hint: "Refleja tu imagen" },
    { word: "CAMINO", hint: "Por donde se transita" },
    { word: "SOMBRERO", hint: "Se usa en la cabeza" },
    { word: "CABALLO", hint: "Animal que se monta" },
    { word: "PUERTA", hint: "Se abre para entrar" },
    { word: "VENTANA", hint: "Se mira a través de ella" },
    { word: "RELOJ", hint: "Mide el tiempo" },
    { word: "LAMPARA", hint: "Da luz en la oscuridad" },
    { word: "CASCADA", hint: "Caída de agua natural" },
    { word: "BOSQUE", hint: "Lugar con muchos árboles" },
    { word: "DESIERTO", hint: "Lugar con mucha arena" },
    { word: "OCEANO", hint: "Gran masa de agua salada" },
    { word: "TIBURON", hint: "Pez depredador del mar" },
    { word: "BALLENA", hint: "Mamífero marino gigante" },
    { word: "DELFIN", hint: "Animal marino inteligente" },
    { word: "PINGÜINO", hint: "Ave que no vuela y vive en el frío" },
    { word: "LEON", hint: "El rey de la selva" },
    { word: "TIGRE", hint: "Felino con rayas" },
    { word: "ELEFANTE", hint: "Animal con trompa larga" },
    { word: "JIRAFA", hint: "Animal con cuello largo" },
    { word: "CEBRA", hint: "Animal con rayas blancas y negras" },
    { word: "PANDA", hint: "Oso de China blanco y negro" },
    { word: "CANGURO", hint: "Animal que salta y tiene bolsa" },
    { word: "KOALA", hint: "Marsupial que come eucalipto" },
    { word: "AGUILA", hint: "Ave de rapiña majestuosa" },
    { word: "BUHO", hint: "Ave nocturna sabia" },
    { word: "LORO", hint: "Ave que puede hablar" }
];

const wordDisplay = document.getElementById('word-display');
const hintDisplay = document.getElementById('hint-display');
const keyboard = document.getElementById('keyboard');
const hangmanParts = document.querySelectorAll('.part');

let selectedWord = "";
let guessedLetters = [];
let mistakes = 0;
let gameMode = 'pva';

function initGame() {
    if (gameMode === 'pva') {
        GameManager.setGame('hangman', true);
        const levelData = wordList[(GameManager.currentLevel - 1) % wordList.length];
        selectedWord = levelData.word.toUpperCase();
        hintDisplay.innerText = "Pista: " + levelData.hint;

        // Helper letters: always the same for the same level
        guessedLetters = getHelperLetters(selectedWord, GameManager.currentLevel);
    } else {
        GameManager.setGame('hangman', false, 'PVP');
        // Selected via prompt or similar in PVP
    }

    mistakes = 0;
    hangmanParts.forEach(p => p.style.display = 'none');
    renderWord();
    renderKeyboard();
}

function getHelperLetters(word, level) {
    // Deterministic helper letters based on level
    const unique = [...new Set(word.replace(/\s/g, '').split(''))];
    const count = Math.max(1, Math.floor(unique.length * 0.2)); // Show 20%

    // Simple LCG to pick letters deterministically
    let seed = level + 500;
    const helpers = [];
    for(let i=0; i<count; i++) {
        seed = (seed * 9301 + 49297) % 233280;
        const idx = Math.floor((seed / 233280) * unique.length);
        const letter = unique.splice(idx, 1)[0];
        if(letter) helpers.push(letter);
    }
    return helpers;
}

function renderWord() {
    wordDisplay.innerHTML = selectedWord.split('').map(letter => `
        <div class="letter-box">${guessedLetters.includes(letter) || letter === ' ' ? letter : ''}</div>
    `).join('');
}

function renderKeyboard() {
    const letters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    keyboard.innerHTML = letters.split('').map(l => `
        <button class="key ${guessedLetters.includes(l) ? 'disabled' : ''}" onclick="makeGuess('${l}')" ${guessedLetters.includes(l) ? 'disabled' : ''}>${l}</button>
    `).join('');
}

function makeGuess(letter) {
    if (guessedLetters.includes(letter) || mistakes >= 6) return;

    guessedLetters.push(letter);
    if (!selectedWord.includes(letter)) {
        mistakes++;
        hangmanParts[mistakes - 1].style.display = 'block';
        if (mistakes >= 6) {
            setTimeout(() => GameManager.showResult('loss', `La palabra era: ${selectedWord}`), 500);
        }
    }

    renderWord();
    renderKeyboard();
    checkWin();
}

function checkWin() {
    const isWon = selectedWord.split('').every(l => guessedLetters.includes(l) || l === ' ');
    if (isWon) {
        setTimeout(() => GameManager.showResult('win', '¡Palabra completada!'), 500);
    }
}
