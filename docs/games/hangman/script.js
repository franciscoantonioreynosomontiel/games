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
    { w: 'ORQUESTA', h: 'Gran grupo de músicos que tocan diversos instrumentos dirigidos por un director' },
    { w: 'ASTRONAUTA', h: 'Persona entrenada para viajar al espacio exterior en una nave espacial' },
    { w: 'BIBLIOTECA', h: 'Lugar donde se guardan y prestan miles de libros de forma organizada' },
    { w: 'ESPECTACULO', h: 'Función o actuación que se realiza para entretener a un público' },
    { w: 'AVENTURERO', h: 'Alguien que busca experiencias nuevas y emocionantes, a menudo arriesgadas' },
    { w: 'DICCIONARIO', h: 'Libro donde puedes buscar el significado de todas las palabras' },
    { w: 'FERROCARRIL', h: 'Sistema de transporte de trenes que circulan sobre vías de metal' },
    { w: 'SUBMARINO', h: 'Vehículo capaz de navegar bajo el agua a grandes profundidades' },
    { w: 'TELESCOPIO', h: 'Instrumento óptico para observar estrellas y planetas muy lejanos' },
    { w: 'REFRIGERADOR', h: 'Aparato eléctrico de la cocina que mantiene los alimentos fríos' },
    { w: 'ESPAÑA', h: 'País de Europa famoso por la paella, el flamenco y el fútbol' },
    { w: 'MEXICO', h: 'País americano conocido por sus tacos, mariachis y pirámides' },
    { w: 'TECLADO', h: 'Conjunto de teclas que usas para escribir en una computadora' },
    { w: 'RATON', h: 'Animalito pequeño que come queso, o el aparato para mover la flecha en la PC' },
    { w: 'CIELO', h: 'Lo que vemos arriba de nosotros donde están las nubes y el sol' },
    { w: 'PLAYA', h: 'Lugar con mucha arena junto al mar donde vas a nadar en vacaciones' },
    { w: 'NIEVE', h: 'Agua helada y blanca que cae del cielo cuando hace mucho frío' },
    { w: 'QUESO', h: 'Alimento sólido que se hace con la leche y le gusta mucho a los ratones' },
    { w: 'PIZZA', h: 'Comida redonda de masa con queso y tomate muy famosa en Italia' },
    { w: 'DIBUJO', h: 'Imagen que haces en un papel usando lápices de colores o plumones' },
    { w: 'MUSICA', h: 'Arte de combinar sonidos que escuchas con audífonos para bailar o relajarte' },
    { w: 'VIAJE', h: 'Acción de ir a un lugar lejano en avión, auto o autobús' },
    { w: 'SUEÑO', h: 'Lo que imaginas en tu mente mientras estás profundamente dormido' },
    { w: 'RELOJ', h: 'Aparato pequeño que llevas en la muñeca para saber qué hora es' },
    { w: 'PUERTA', h: 'Objeto de madera o metal que abres y cierras para entrar a una habitación' },
    { w: 'VENTANA', h: 'Abertura en la pared con vidrio que sirve para mirar hacia afuera' },
    { w: 'CAMINO', h: 'Ruta o sendero por donde pasan las personas o los vehículos' },
    { w: 'ZAPATO', h: 'Prenda de cuero o tela que te pones en los pies para caminar por la calle' },
    { w: 'GUITARRA', h: 'Instrumento musical que tiene cuerdas y se toca con los dedos' },
    { w: 'ESTRELLA', h: 'Punto brillante que ves en el cielo durante la noche profunda' },
    { w: 'MANZANA', h: 'Fruta redonda que puede ser roja o verde y es muy saludable' },
    { w: 'NARANJA', h: 'Fruta cítrica redonda de color brillante con la que se hace jugo' },
    { w: 'PELOTA', h: 'Objeto redondo que rebota y se usa para jugar fútbol o básquetbol' },
    { w: 'AVION', h: 'Vehículo muy grande con alas que vuela por los aires llevando pasajeros' },
    { w: 'BARCO', h: 'Vehículo que flota y navega por los mares y océanos' },
    { w: 'TREN', h: 'Transporte largo que viaja sobre rieles de hierro por la tierra' },
    { w: 'BICICLETA', h: 'Vehículo de dos ruedas que mueves usando la fuerza de tus piernas' },
    { w: 'ESCUELA', h: 'Lugar a donde van los niños a aprender cosas nuevas con sus maestros' },
    { w: 'MAESTRO', h: 'Persona que tiene como profesión enseñar conocimientos a sus alumnos' },
    { w: 'MEDICO', h: 'Profesional de la salud que te ayuda a curarte cuando estás enfermo' },
    { w: 'DINERO', h: 'Billetes y monedas que usas para comprar cosas en las tiendas' },
    { w: 'AMIGO', h: 'Persona con la que te gusta jugar, platicar y compartir momentos divertidos' },
    { w: 'FAMILIA', h: 'Grupo de personas que viven juntas y se quieren mucho, como padres e hijos' },
    { w: 'CIUDAD', h: 'Lugar grande con muchos edificios, calles, tiendas y mucha gente' },
    { w: 'BOSQUE', h: 'Sitio lleno de muchos árboles, plantas y animales salvajes' },
    { w: 'MONTAÑA', h: 'Gran elevación natural del terreno mucho más alta que una colina' },
    { w: 'UNIVERSO', h: 'Todo lo que existe: planetas, estrellas, galaxias y el espacio infinito' },
    { w: 'CIENCIA', h: 'Conjunto de conocimientos que explican cómo funciona el mundo real' },
    { w: 'HISTORIA', h: 'Relato de los sucesos que ocurrieron en el pasado de la humanidad' },
    { w: 'FUTURO', h: 'El tiempo que todavía no ha llegado, lo que sucederá después de ahora' },
    { w: 'ARQUITECTURA', h: 'Arte y técnica de diseñar y construir edificios hermosos' },
    { w: 'ELECTRICIDAD', h: 'Forma de energía que ilumina nuestras casas y hace funcionar la TV' },
    { w: 'GASTRONOMIA', h: 'Conocimientos y actividades relacionados con la comida y el buen comer' },
    { w: 'PALEONTOLOGIA', h: 'Ciencia que estudia los fósiles de dinosaurios y seres muy antiguos' },
    { w: 'CONSTELACION', h: 'Grupo de estrellas que forman figuras imaginarias en el cielo nocturno' }
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

    // Pre-reveal some letters for every word (make it fill-in-the-blanks style)
    if (selectedWord.length > 3) {
        const revealCount = Math.max(1, Math.floor(selectedWord.length / 5));
        const uniqueLetters = [...new Set(selectedWord.split(''))];
        // Don't reveal vowels or common letters if possible, pick randomly
        for(let i=0; i<revealCount; i++) {
            const randIdx = Math.floor(Math.random() * uniqueLetters.length);
            const letter = uniqueLetters[randIdx];
            if (!guessedLetters.includes(letter)) {
                guessedLetters.push(letter);
            }
        }
        renderWord();
        renderKeyboard();
    }
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
