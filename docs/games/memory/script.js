const boardElement = document.getElementById('board');

let cards = [];
let flippedCards = [];
let matchedCount = 0;
let pairs = 8;
let canFlip = true;

function initGame() {
    GameManager.setGame('memory');

    cards = [];
    flippedCards = [];
    matchedCount = 0;
    canFlip = true;
    boardElement.innerHTML = '';

    const icons = ['star', 'favorite', 'home', 'face', 'anchor', 'pets', 'sunny', 'cloud', 'rocket', 'build', 'lightbulb', 'eco', 'extension', 'palette', 'camera', 'music_note'];
    const selectedIcons = icons.slice(0, Math.min(pairs, icons.length));
    const gameIcons = [...selectedIcons, ...selectedIcons].sort(() => Math.random() - 0.5);

    gameIcons.forEach((icon, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.icon = icon;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"><span class="material-icons">help_outline</span></div>
                <div class="card-back"><span class="material-icons">${icon}</span></div>
            </div>
        `;
        card.onclick = () => flipCard(card);
        boardElement.appendChild(card);
    });
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
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedCount++;
        flippedCards = [];
        canFlip = true;
        if (matchedCount === pairs) {
            setTimeout(() => GameManager.showResult('win'), 500);
        }
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
