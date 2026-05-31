const wordList = [
    { word: "CASA" }, { word: "EL RATON DE LOS DIENTES" },
    { word: "PERRO" }, { word: "LA LUNA ESTA LLENA" },
    { word: "POSTRE" }, { word: "EL SOL SALE SIEMPRE" },
    { word: "PLANETA" }, { word: "AGUA QUE NO HAS DE BEBER" },
    { word: "ESTRELLA" }, { word: "CAMARON QUE SE DUERME" },
    { word: "MONTAÑA" }, { word: "MAS VALE TARDE QUE NUNCA" },
    { word: "GUITARRA" }, { word: "PERRO QUE LADRA NO MUERDE" },
    { word: "CELESTE" }, { word: "EN BOCA CERRADA NO ENTRAN MOSCAS" },
    { word: "BIBLIOTECA" }, { word: "EL QUE BUSCA ENCUENTRA" },
    { word: "DINOSAURIO" }, { word: "LA UNION HACE LA FUERZA" },
    { word: "MARIPOSA" }, { word: "CRIA CUERVOS Y TE SACARAN LOS OJOS" },
    { word: "TELEFONO" }, { word: "AL MAL TIEMPO BUENA CARA" },
    { word: "HELADO" }, { word: "MAS VALE PAJARO EN MANO" },
    { word: "BICICLETA" }, { word: "A CABALLO REGALADO NO LE MIRES EL DIENTE" },
    { word: "COCODRILO" }, { word: "DE TAL PALO TAL ASTILLA" },
    { word: "PIRAMIDE" }, { word: "HAZ EL BIEN SIN MIRAR A QUIEN" },
    { word: "UNIVERSO" }, { word: "LA CURIOSIDAD MATO AL GATO" },
    { word: "FUTBOL" }, { word: "OJO POR OJO DIENTE POR DIENTE" },
    { word: "CHOCOLATE" }, { word: "QUERER ES PODER" },
    { word: "ORQUESTA" }, { word: "EL TIEMPO ES ORO" },
    { word: "AVENTURA" }, { word: "CADA OVEJA CON SU PAREJA" },
    { word: "HORMIGA" }, { word: "MUCHO RUIDO Y POCAS NUECES" },
    { word: "ESPEJO" }, { word: "LO PROMETIDO ES DEUDA" },
    { word: "CAMINO" }, { word: "CADA LOCO CON SU TEMA" },
    { word: "SOMBRERO" }, { word: "SONREIR ES GRATIS" }
];

const wordDisplay = document.getElementById('word-display');
const hintDisplay = document.getElementById('hint-display');
const keyboard = document.getElementById('keyboard');
const canvas = document.getElementById('hangman-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let selectedWord = "";
let guessedLetters = [];
let mistakes = 0;
let gameMode = 'pva';

function initGame() {
    guessedLetters = [];
    hintDisplay.innerText = "";
    if (gameMode === 'pva') {
        GameManager.setGame('hangman', true);
        const levelData = wordList[(GameManager.currentLevel - 1) % wordList.length];
        selectedWord = levelData.word.toUpperCase();
        guessedLetters = getHelperLetters(selectedWord, GameManager.currentLevel);
    } else {
        GameManager.setGame('hangman', false, 'PVP');
    }

    mistakes = 0;
    GameManager.lives = 6;
    GameManager.maxLives = 6;
    GameManager.updateLivesUI();

    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBase();
    }

    renderWord();
    renderKeyboard();
}

function getHelperLetters(word, level) {
    const unique = [...new Set(word.replace(/\s/g, '').split(''))];
    const count = Math.min(3, Math.max(1, Math.floor(unique.length * 0.2)));
    let seed = level + 500;
    const helpers = [];
    const tempUnique = [...unique];
    for(let i=0; i<count; i++) {
        seed = (seed * 9301 + 49297) % 233280;
        const idx = Math.floor((seed / 233280) * tempUnique.length);
        const letter = tempUnique.splice(idx, 1)[0];
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
        <button class="key" onclick="makeGuess('${l}')" ${guessedLetters.includes(l) ? 'disabled' : ''}>${l}</button>
    `).join('');
}

function makeGuess(letter) {
    if (guessedLetters.includes(letter) || mistakes >= 6) return;

    guessedLetters.push(letter);
    if (!selectedWord.includes(letter)) {
        mistakes++;
        drawHangman(mistakes);
        GameManager.loseLife();
    }

    renderWord();
    renderKeyboard();
    checkWin();
}

function checkWin() {
    const isWon = selectedWord.split('').every(l => guessedLetters.includes(l) || l === ' ');
    if (isWon && mistakes < 6) {
        setTimeout(() => GameManager.showResult('win', '¡Palabra completada!'), 400);
    }
}

function drawBase() {
    if (!ctx) return;
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(20, 170); ctx.lineTo(160, 170);
    ctx.moveTo(40, 170); ctx.lineTo(40, 20);
    ctx.moveTo(40, 20); ctx.lineTo(120, 20);
    ctx.moveTo(120, 20); ctx.lineTo(120, 40);
    ctx.stroke();
}

function drawHangman(step) {
    if (!ctx) return;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    switch(step) {
        case 1: ctx.beginPath(); ctx.arc(120, 55, 15, 0, Math.PI*2); ctx.stroke(); break;
        case 2: ctx.beginPath(); ctx.moveTo(120, 70); ctx.lineTo(120, 120); ctx.stroke(); break;
        case 3: ctx.beginPath(); ctx.moveTo(120, 80); ctx.lineTo(100, 100); ctx.stroke(); break;
        case 4: ctx.beginPath(); ctx.moveTo(120, 80); ctx.lineTo(140, 100); ctx.stroke(); break;
        case 5: ctx.beginPath(); ctx.moveTo(120, 120); ctx.lineTo(100, 150); ctx.stroke(); break;
        case 6: ctx.beginPath(); ctx.moveTo(120, 120); ctx.lineTo(140, 150); ctx.stroke(); break;
    }
}
