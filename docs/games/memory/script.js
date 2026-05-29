const boardElement = document.getElementById('board');

let flippedCards = [];
let matchedCount = 0;
let pairs = 8;
let canFlip = true;

// Animals SVGs / Emojis as requested
const icons = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'];

function initGame() {
    GameManager.setGame('memory');
    const level = GameManager.currentLevel;
    pairs = 4 + (level * 2); // Scales with level
    if (pairs > icons.length) pairs = icons.length;

    flippedCards = [];
    matchedCount = 0;
    canFlip = true;
    boardElement.innerHTML = '';

    // Grid columns based on pairs
    const cols = pairs <= 6 ? 3 : 4;
    boardElement.style.gridTemplateColumns = `repeat(${cols}, 80px)`;

    const selectedIcons = icons.slice(0, pairs);
    let gameIcons = [...selectedIcons, ...selectedIcons];

    // Fixed layout per level as requested
    // Seeded shuffle or just deterministic sort for levels
    gameIcons = deterministicShuffle(gameIcons, level);

    gameIcons.forEach((icon, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.icon = icon;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"><span class="material-icons" style="font-size: 2rem;">help</span></div>
                <div class="card-back" style="font-size: 2.5rem;">${icon}</div>
            </div>
        `;
        card.onclick = () => flipCard(card);
        boardElement.appendChild(card);
    });
}

function deterministicShuffle(array, seed) {
    let m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.abs(Math.sin(seed++)) * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

function flipCard(card) {
    if (!canFlip || flippedCards.includes(card) || card.classList.contains('matched') || card.classList.contains('flipped')) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        canFlip = false;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.icon === card2.dataset.icon) {
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedCount++;
            flippedCards = [];
            canFlip = true;
            if (matchedCount === pairs) {
                setTimeout(() => GameManager.showResult('win'), 500);
            }
        }, 600);
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            canFlip = true;
            GameManager.loseLife();
        }, 1000);
    }
}
