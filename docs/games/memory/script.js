const boardElement = document.getElementById('board');

let flippedCards = [];
let matchedCount = 0;
let pairs = 8;
let canFlip = true;

const icons = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'];

function initGame() {
    GameManager.setGame('memory', true);
    const level = GameManager.currentLevel;
    pairs = Math.min(4 + Math.floor(level / 3), icons.length);

    flippedCards = [];
    matchedCount = 0;
    canFlip = true;
    boardElement.innerHTML = '';

    const cols = pairs <= 6 ? 3 : (pairs <= 10 ? 4 : 5);
    boardElement.style.gridTemplateColumns = `repeat(${cols}, 70px)`;

    const selectedIcons = icons.slice(0, pairs);
    let gameIcons = [...selectedIcons, ...selectedIcons];
    gameIcons = deterministicShuffle(gameIcons, level);

    gameIcons.forEach((icon, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.width = '70px';
        card.style.height = '70px';
        card.dataset.icon = icon;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"><span class="material-icons" style="font-size: 1.5rem;">help</span></div>
                <div class="card-back" style="font-size: 2rem;">${icon}</div>
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
