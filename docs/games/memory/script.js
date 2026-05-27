const gridElement = document.getElementById('grid');
const pairsElement = document.getElementById('pairs');
const resetBtn = document.getElementById('reset-btn');

const icons = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
let cards = [...icons, ...icons];
let flippedCards = [];
let matchedPairs = 0;
let lockBoard = false;

function initGame() {
    GameManager.setGame('memory');
    const level = GameManager.currentLevel;

    gridElement.innerHTML = '';
    matchedPairs = 0;
    pairsElement.innerText = '0';
    flippedCards = [];
    lockBoard = false;

    // Scaling: levels 1-50 can increase number of pairs or use same grid
    // For simplicity, we keep 8 pairs but can track time or level
    cards = shuffle([...icons, ...icons]);

    cards.forEach((icon, i) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.icon = icon;
        card.innerHTML = `
            <div class="front">${icon}</div>
            <div class="back">?</div>
        `;
        card.addEventListener('click', () => flipCard(card));
        gridElement.appendChild(card);
    });
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function flipCard(card) {
    if (lockBoard || flippedCards.includes(card) || card.classList.contains('matched')) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    lockBoard = true;
    const [card1, card2] = flippedCards;

    if (card1.dataset.icon === card2.dataset.icon) {
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            pairsElement.innerText = matchedPairs;
            resetTurn();
            if (matchedPairs === icons.length) {
                GameManager.showResult('win');
            }
        }, 500);
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            if (GameManager.loseLife()) {
                // Game over
            }
            resetTurn();
        }, 1000);
    }
}

function resetTurn() {
    flippedCards = [];
    lockBoard = false;
}

GameManager.setGame('memory');
resetBtn.addEventListener('click', initGame);
initGame();
