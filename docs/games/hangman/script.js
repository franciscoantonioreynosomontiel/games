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
    { w: 'SOL', h: 'El gran astro que nos ilumina y nos da calor durante el día' },
    { w: 'LUNA', h: 'Cuerpo celeste que brilla de noche y cambia de forma cada mes' },
    { w: 'CASA', h: 'El lugar donde vives con tu familia y te proteges del clima' },
    { w: 'GATO', h: 'Mascota pequeña que maúlla y le gusta perseguir ratones' },
    { w: 'PERRO', h: 'Fiel animal doméstico que ladra y es el mejor amigo del hombre' },
    { w: 'ARBOL', h: 'Planta de tronco leñoso muy alta que tiene ramas y muchas hojas' },
    { w: 'LIBRO', h: 'Objeto con muchas hojas de papel escritas que sirve para leer historias' },
    { w: 'AGUA', h: 'Líquido transparente y vital que bebes cuando tienes sed' },
    { w: 'FUEGO', h: 'Fenómeno que quema, da luz y calor, pero es peligroso tocarlo' },
    { w: 'TIGRE', h: 'Gran felino salvaje de color naranja con rayas negras muy marcadas' },
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
    { w: 'FUTURO', h: 'El tiempo que todavía no ha llegado, lo que sucederá después de ahora' }
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
