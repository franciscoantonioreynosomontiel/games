const boardElement = document.getElementById('board');

let flippedCards = [];
let matchedCount = 0;
let pairs = 8;
let canFlip = true;

const icons = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🦄', '🐝', '🐙', '🦋', '🐢', '🦖', '🐧', '🦀'];

function initGame() {
    // GameManager.setGame handles headers and state
    GameManager.setGame('memory', true);
    const level = GameManager.currentLevel;

    // Increase pairs with level: 1-2->4, 3-4->5, 5-6->6, etc.
    pairs = Math.min(4 + Math.floor((level - 1) / 2), 20);

    flippedCards = [];
    matchedCount = 0;
    canFlip = true;
    boardElement.innerHTML = '';

    // Responsive grid calculation
    let cols = 3;
    if (pairs > 12) cols = 6;
    else if (pairs > 8) cols = 5;
    else if (pairs > 6) cols = 4;

    const cardSize = pairs > 12 ? 55 : (pairs > 8 ? 65 : 75);

    boardElement.style.gridTemplateColumns = `repeat(${cols}, ${cardSize}px)`;

    // Select random icons but deterministic per level
    const shuffledIcons = deterministicShuffle([...icons], level + 100);
    const selectedIcons = shuffledIcons.slice(0, pairs);

    let gameIcons = [...selectedIcons, ...selectedIcons];
    gameIcons = deterministicShuffle(gameIcons, level);

    gameIcons.forEach((icon, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.width = `${cardSize}px`;
        card.style.height = `${cardSize}px`;
        card.dataset.icon = icon;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"><span class="material-icons" style="font-size: ${cardSize/2.5}px;">help</span></div>
                <div class="card-back" style="font-size: ${cardSize/2}px;">${icon}</div>
            </div>
        `;
        card.onclick = () => flipCard(card);
        boardElement.appendChild(card);
    });
}

function deterministicShuffle(array, seed) {
    let m = array.length, t, i;
    let s = seed;
    while (m) {
        s = (s * 9301 + 49297) % 233280;
        let rnd = s / 233280;
        i = Math.floor(rnd * m--);
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
                setTimeout(() => GameManager.showResult('win', '¡Nivel ' + GameManager.currentLevel + ' superado!'), 500);
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
