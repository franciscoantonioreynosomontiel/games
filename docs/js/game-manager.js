const GameManager = {
    lives: 3,
    currentGame: '',
    currentDifficulty: 'medium',
    currentLevel: 1,

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
    },

    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.showResult('loss');
            return true; // Game over
        }
        return false;
    },

    async saveResult(result, score = 0) {
        if (!window.Auth.isLoggedIn()) return;

        const { error } = await window.appConfig.supabase
            .from('game_stats')
            .insert([{
                username: window.Auth.currentUser.username,
                game_type: this.currentGame,
                score: score,
                difficulty: this.currentDifficulty,
                result: result,
                lives_remaining: this.lives
            }]);

        if (error) console.error('Error saving score:', error);

        if (result === 'win' && this.currentLevel < 50) {
            this.currentLevel++;
            localStorage.setItem(`level_${Auth.currentUser.username}_${this.currentGame}`, this.currentLevel);
        }
    },

    showInstructions(title, text) {
        return UIManager.alert(title, text, 'info');
    },

    showResult(type, score = 0) {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';

        const content = document.createElement('div');
        content.className = 'game-over-content animated zoomIn';

        const title = type === 'win' ? '¡FELICIDADES!' : 'NIVEL FALLIDO';
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
        `;
        document.head.appendChild(style);
    }
};

window.GameManager = GameManager;
GameManager.init();
