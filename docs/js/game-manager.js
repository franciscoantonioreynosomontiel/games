const GameManager = {
    lives: 3,
    currentGame: '',
    currentDifficulty: 'medium',
    currentLevel: 1,
    maxLevel: 50,

    init() {
        this.addPopupStyles();
        this.loadLevel();
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
        this.renderLives();
        this.renderLevelInfo();
        return { level: this.currentLevel, lives: this.lives };
    },

    renderLives() {
        let container = document.getElementById('lives-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'lives-container';
            container.className = 'lives-display';
            const mainHeader = document.querySelector('header') || document.body;
            mainHeader.appendChild(container);
        }

        container.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const heart = document.createElement('span');
            heart.className = 'material-icons heart';
            heart.innerText = i < this.lives ? 'favorite' : 'favorite_border';
            heart.style.color = i < this.lives ? '#f44336' : '#999';
            container.appendChild(heart);
        }
    },

    renderLevelInfo() {
        let info = document.getElementById('game-info-bar');
        if (!info) {
            info = document.createElement('div');
            info.id = 'game-info-bar';
            info.className = 'game-info-bar';
            const mainHeader = document.querySelector('header') || document.body;
            mainHeader.appendChild(info);
        }
        info.innerHTML = `
            <span class="level-badge">Nivel ${this.currentLevel}</span>
            <button class="btn-lvl-select" onclick="GameManager.showLevelSelector()">Cambiar Nivel</button>
        `;
    },

    showLevelSelector() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';
        overlay.style.zIndex = '2000';

        let levelsHtml = '';
        const unlocked = this.getUnlockedLevel();
        for (let i = 1; i <= this.maxLevel; i++) {
            const isLocked = i > unlocked;
            levelsHtml += `
                <button class="lvl-btn ${isLocked ? 'locked' : ''}"
                        ${isLocked ? 'disabled' : `onclick="GameManager.goToLevel(${i})"`}>
                    ${i}
                    ${isLocked ? '<span class="material-icons">lock</span>' : ''}
                </button>
            `;
        }

        overlay.innerHTML = `
            <div class="modal-content level-selector-modal">
                <h3>Seleccionar Nivel</h3>
                <div class="levels-grid">${levelsHtml}</div>
                <button class="btn-primary" onclick="this.parentElement.parentElement.remove()">Cerrar</button>
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
        this.renderLives();
        if (this.lives <= 0) {
            this.showResult('loss');
            return true; // Game over
        }
        return false;
    },

    async saveResult(result, score = 0) {
        if (!window.Auth.isLoggedIn()) return;

        // Save to Supabase
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
                this.currentLevel++;
                localStorage.setItem(`level_${Auth.currentUser.username}_${this.currentGame}`, this.currentLevel);
            }
        }
    },

    showResult(type, score = 0) {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';

        const content = document.createElement('div');
        content.className = `game-over-content animated ${type === 'win' ? 'bounceIn' : 'shake'}`;

        const title = type === 'win' ? '¡FELICIDADES!' : (type === 'draw' ? 'EMPATE' : 'NIVEL FALLIDO');
        const msg = type === 'win' ? `Has superado el nivel ${this.currentLevel}.` : `Te has quedado sin vidas en el nivel ${this.currentLevel}.`;
        const icon = type === 'win' ? 'emoji_events' : 'sentiment_very_dissatisfied';

        content.innerHTML = `
            <span class="material-icons result-icon ${type}">${icon}</span>
            <h2>${title}</h2>
            <p>${msg}</p>
            <div class="result-buttons">
                <button onclick="location.reload()" class="btn-retry">${type === 'win' ? 'Siguiente' : 'Reintentar'}</button>
                <button onclick="location.href='../../index.html'" class="btn-menu">Menú</button>
            </div>
        `;

        overlay.appendChild(content);
        document.body.appendChild(overlay);

        this.saveResult(type, score);
    },

    addPopupStyles() {
        if (document.getElementById('gm-styles')) return;
        const style = document.createElement('style');
        style.id = 'gm-styles';
        style.innerHTML = `
            .lives-display { display: flex; gap: 5px; justify-content: center; padding: 10px; }
            .heart { font-size: 30px; transition: all 0.3s; }
            .game-info-bar { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; background: #f8f9fa; border-bottom: 1px solid #ddd; }
            .level-badge { background: var(--primary-color); color: white; padding: 4px 12px; border-radius: 15px; font-weight: bold; }
            .btn-lvl-select { background: none; border: 1px solid var(--primary-color); color: var(--primary-color); padding: 4px 10px; border-radius: 5px; cursor: pointer; }

            .levels-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 20px 0; max-height: 300px; overflow-y: auto; padding: 10px; }
            .lvl-btn { padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer; display: flex; flex-direction: column; align-items: center; }
            .lvl-btn.locked { background: #eee; color: #999; cursor: not-allowed; }
            .level-selector-modal { max-width: 400px !important; }

            .game-over-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.8); display: flex; align-items: center;
                justify-content: center; z-index: 1000;
            }
            .game-over-content {
                background: white; padding: 30px; border-radius: 20px;
                text-align: center; max-width: 300px; width: 90%;
            }
            .result-icon { font-size: 80px; margin-bottom: 20px; }
            .result-icon.win { color: #4CAF50; }
            .result-icon.loss { color: #F44336; }
            .result-buttons { display: flex; gap: 10px; margin-top: 20px; }
            .result-buttons button {
                flex: 1; padding: 12px; border: none; border-radius: 25px;
                font-weight: bold; cursor: pointer;
            }
            .btn-retry { background: var(--primary-color); color: white; }
            .btn-menu { background: #eee; }

            .animated { animation-duration: 0.5s; animation-fill-mode: both; }
            @keyframes zoomIn {
                from { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); }
                50% { opacity: 1; }
            }
            .zoomIn { animation-name: zoomIn; }

            @keyframes bounceIn {
                0%, 20%, 40%, 60%, 80%, 100% { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); }
                0% { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); }
                20% { transform: scale3d(1.1, 1.1, 1.1); }
                40% { transform: scale3d(0.9, 0.9, 0.9); }
                60% { opacity: 1; transform: scale3d(1.03, 1.03, 1.03); }
                80% { transform: scale3d(0.97, 0.97, 0.97); }
                100% { opacity: 1; transform: scale3d(1, 1, 1); }
            }
            .bounceIn { animation-name: bounceIn; }

            @keyframes shake {
                from, to { transform: translate3d(0, 0, 0); }
                10%, 30%, 50%, 70%, 90% { transform: translate3d(-10px, 0, 0); }
                20%, 40%, 60%, 80% { transform: translate3d(10px, 0, 0); }
            }
            .shake { animation-name: shake; }
        `;
        document.head.appendChild(style);
    }
};

window.GameManager = GameManager;
GameManager.init();
