const wordList = [
    { word: "EL RATON DE LOS DIENTES" }, { word: "LA LUNA ESTA LLENA" },
    { word: "EL SOL SALE SIEMPRE" }, { word: "AGUA QUE NO HAS DE BEBER" },
    { word: "CAMARON QUE SE DUERME" }, { word: "MAS VALE TARDE QUE NUNCA" },
    { word: "PERRO QUE LADRA NO MUERDE" }, { word: "EN BOCA CERRADA NO ENTRAN MOSCAS" },
    { word: "EL QUE BUSCA ENCUENTRA" }, { word: "LA UNION HACE LA FUERZA" },
    { word: "CRIA CUERVOS Y TE SACARAN LOS OJOS" }, { word: "AL MAL TIEMPO BUENA CARA" },
    { word: "MAS VALE PAJARO EN MANO" }, { word: "A CABALLO REGALADO NO LE MIRES EL DIENTE" },
    { word: "DE TAL PALO TAL ASTILLA" }, { word: "HAZ EL BIEN SIN MIRAR A QUIEN" },
    { word: "LA CURIOSIDAD MATO AL GATO" }, { word: "OJO POR OJO DIENTE POR DIENTE" },
    { word: "QUERER ES PODER" }, { word: "EL TIEMPO ES ORO" },
    { word: "CADA OVEJA CON SU PAREJA" }, { word: "MUCHO RUIDO Y POCAS NUECES" },
    { word: "LO PROMETIDO ES DEUDA" }, { word: "CADA LOCO CON SU TEMA" },
    { word: "SONREIR ES GRATIS" }, { word: "EL QUE RIE AL ULTIMO RIE MEJOR" },
    { word: "A QUIEN MADRUGA DIOS LE AYUDA" }, { word: "NO HAY MAL QUE POR BIEN NO VENGA" },
    { word: "TRAS LA TORMENTA LLEGA LA CALMA" }, { word: "EL SABER NO OCUPA LUGAR" },
    { word: "MAS VALE MAÑA QUE FUERZA" }, { word: "TODO LO QUE BRILLA NO ES ORO" },
    { word: "LA PACIENCIA ES LA MADRE DE LA CIENCIA" }, { word: "A FALTA DE PAN BUENAS SON TORTAS" },
    { word: "QUIEN TIENE UN AMIGO TIENE UN TESORO" }, { word: "EN LA VARIEDAD ESTA EL GUSTO" },
    { word: "DEL DICHO AL HECHO HAY MUCHO TRECHO" }, { word: "CADA MONEDA TIENE DOS CARAS" },
    { word: "EL HABITO NO HACE AL MONJE" }, { word: "NO DEJES PARA MAÑANA LO QUE PUEDAS HACER HOY" },
    { word: "PIENSA MAL Y ACERTARAS" }, { word: "EL QUE NO ARRIESGA NO GANA" },
    { word: "LA FE MUEVE MONTAÑAS" }, { word: "A BUEN ENTENDEDOR POCAS PALABRAS BASTAN" },
    { word: "NUNCA ES TARDE SI LA DICHA ES BUENA" }, { word: "CABALLO GRANDE ANDE O NO ANDE" },
    { word: "CADA UNO CUENTA LA FERIA COMO LE VA EN ELLA" }, { word: "DONDE HAY CAPITAN NO MANDA MARINERO" },
    { word: "LA CARIDAD BIEN ENTENDIDA EMPIEZA POR UNO MISMO" }, { word: "OBRAS SON AMORES Y NO BUENAS RAZONES" }
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
        <div class="${letter === ' ' ? '' : 'letter-box'}" style="${letter === ' ' ? 'width: 20px;' : ''}">${guessedLetters.includes(letter) || letter === ' ' ? letter : ''}</div>
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
