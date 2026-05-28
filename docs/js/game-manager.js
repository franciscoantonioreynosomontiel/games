const GameManager = {
    lives: 3,
    currentGame: '',
    currentDifficulty: 'medium',
    currentLevel: 1,
    maxLevel: 50,

    init() {
        this.addPopupStyles();
        // Skip loadLevel here, games call setGame
    },

    loadLevel() {
        if (Auth.isLoggedIn()) {
            const saved = localStorage.getItem(`level_${Auth.currentUser.username}_${this.currentGame}`);
            this.currentLevel = saved ? parseInt(saved) : 1;
        }
    },

    setGame(gameName, difficulty = 'medium') {
        this.currentGame = gameName;
        this.currentDifficulty = difficulty;
        this.lives = 3;
        this.loadLevel();
        this.renderHeaderUI();
        return { level: this.currentLevel, lives: this.lives };
    },

    renderHeaderUI() {
        // Clean existing GM elements
        const oldBar = document.getElementById('gm-header-bar');
        if (oldBar) oldBar.remove();

        const bar = document.createElement('div');
        bar.id = 'gm-header-bar';
        bar.style.cssText = `
            display: flex; justify-content: space-between; align-items: center;
            padding: 8px 16px; background: #eee; border-bottom: 1px solid #ccc;
            font-size: 14px; font-weight: 500;
        `;

        // Lives
        const livesDiv = document.createElement('div');
        livesDiv.id = 'gm-lives';
        livesDiv.style.display = 'flex';
        this.updateLivesUI(livesDiv);

        // Level Info
        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `
            <span style="background: var(--primary-color); color: white; padding: 2px 8px; border-radius: 10px; margin-right: 8px;">NIVEL ${this.currentLevel}</span>
            <button onclick="GameManager.showLevelSelector()" style="background: none; border: 1px solid var(--primary-color); color: var(--primary-color); border-radius: 4px; padding: 2px 6px; cursor: pointer; font-size: 12px;">CAMBIAR</button>
        `;

        bar.appendChild(livesDiv);
        bar.appendChild(infoDiv);

        const header = document.querySelector('.app-header');
        if (header) {
            header.after(bar);
        } else {
            document.body.prepend(bar);
        }
    },

    updateLivesUI(container) {
        const target = container || document.getElementById('gm-lives');
        if (!target) return;
        target.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const heart = document.createElement('span');
            heart.className = 'material-icons';
            heart.style.fontSize = '20px';
            heart.style.marginRight = '2px';
            heart.innerText = i < this.lives ? 'favorite' : 'favorite_border';
            heart.style.color = i < this.lives ? '#f44336' : '#999';
            target.appendChild(heart);
        }
    },

    showLevelSelector() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';

        let levelsHtml = '';
        const unlocked = this.getUnlockedLevel();
        for (let i = 1; i <= this.maxLevel; i++) {
            const isLocked = i > unlocked;
            levelsHtml += `
                <button class="lvl-btn-mini ${isLocked ? 'locked' : ''}"
                        ${isLocked ? 'disabled' : `onclick="GameManager.goToLevel(${i})"`}
                        style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: ${isLocked ? '#eee' : 'white'}; cursor: ${isLocked ? 'default' : 'pointer'}; position: relative;">
                    ${i}
                    ${isLocked ? '<span class="material-icons" style="font-size: 12px; position: absolute; top: 2px; right: 2px;">lock</span>' : ''}
                </button>
            `;
        }

        overlay.innerHTML = `
            <div class="modal-content" style="max-width: 350px;">
                <h3 style="margin-bottom: 15px; text-align: center;">Seleccionar Nivel</h3>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; max-height: 300px; overflow-y: auto; padding: 5px;">
                    ${levelsHtml}
                </div>
                <button class="btn-premium" style="margin-top: 20px; width: 100%;" onclick="this.parentElement.parentElement.remove()">Cerrar</button>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    getUnlockedLevel() {
        if (!Auth.isLoggedIn()) return 1;
        const saved = localStorage.getItem(`max_unlocked_${Auth.currentUser.username}_${this.currentGame}`);
        return saved ? parseInt(saved) : 1;
    },

    goToLevel(lvl) {
        this.currentLevel = lvl;
        localStorage.setItem(`level_${Auth.currentUser.username}_${this.currentGame}`, lvl);
        location.reload();
    },

    loseLife() {
        this.lives--;
        this.updateLivesUI();
        if (this.lives <= 0) {
            this.showResult('loss');
            return true;
        }
        return false;
    },

    async saveResult(result, score = 0) {
        if (!window.Auth.isLoggedIn()) return;

        try {
            await window.appConfig.supabase
                .from('game_scores')
                .insert([{
                    user_id: window.Auth.currentUser.id,
                    game_id: this.currentGame,
                    score: score,
                    level: this.currentLevel,
                    difficulty: this.currentDifficulty
                }]);

            if (result === 'win') {
                const unlocked = this.getUnlockedLevel();
                if (this.currentLevel >= unlocked && this.currentLevel < this.maxLevel) {
                    localStorage.setItem(`max_unlocked_${Auth.currentUser.username}_${this.currentGame}`, this.currentLevel + 1);
                }
                if (this.currentLevel < this.maxLevel) {
                    localStorage.setItem(`level_${Auth.currentUser.username}_${this.currentGame}`, this.currentLevel + 1);
                }
            }
        } catch (e) {
            console.error("Error saving score", e);
        }
    },

    showResult(type, score = 0) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';

        const content = document.createElement('div');
        content.className = `modal-content animated ${type === 'win' ? 'bounceIn' : 'fadeInUp'}`;
        content.style.textAlign = 'center';

        const title = type === 'win' ? '¡FELICIDADES!' : (type === 'draw' ? 'EMPATE' : 'NIVEL FALLIDO');
        const msg = type === 'win' ? `Has superado el nivel ${this.currentLevel}.` : `Has fallado el nivel ${this.currentLevel}.`;
        const icon = type === 'win' ? 'emoji_events' : 'sentiment_very_dissatisfied';
        const color = type === 'win' ? '#4CAF50' : '#F44336';

        content.innerHTML = `
            <span class="material-icons" style="font-size: 80px; color: ${color}; margin-bottom: 20px;">${icon}</span>
            <h2 style="margin-bottom: 10px;">${title}</h2>
            <p style="color: #666; margin-bottom: 25px;">${msg}</p>
            <div style="display: flex; gap: 10px;">
                <button onclick="location.reload()" class="btn-premium" style="flex: 1;">${type === 'win' ? 'Siguiente' : 'Reintentar'}</button>
                <button onclick="location.href='../../index.html'" class="btn-premium" style="flex: 1; background: #eee; color: #333;">Menú</button>
            </div>
        `;

        overlay.appendChild(content);
        document.body.appendChild(overlay);

        this.saveResult(type, score);
    },

    addPopupStyles() {
        // We use modal-overlay from style.css now
    }
};

window.GameManager = GameManager;
GameManager.init();
