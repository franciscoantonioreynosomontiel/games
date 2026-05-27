const GameManager = {
    lives: 3,
    currentGame: '',
    currentDifficulty: 'medium',

    init() {
        this.addPopupStyles();
    },

    setGame(gameName, difficulty = 'medium') {
        this.currentGame = gameName;
        this.currentDifficulty = difficulty;
        this.lives = 3;
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
    },

    showResult(type) {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';

        const content = document.createElement('div');
        content.className = 'game-over-content animated zoomIn';

        const title = type === 'win' ? '¡FELICIDADES!' : 'JUEGO TERMINADO';
        const msg = type === 'win' ? 'Has ganado la partida.' : 'Te has quedado sin vidas.';
        const icon = type === 'win' ? 'emoji_events' : 'sentiment_very_dissatisfied';

        content.innerHTML = `
            <span class="material-icons result-icon ${type}">${icon}</span>
            <h2>${title}</h2>
            <p>${msg}</p>
            <div class="result-buttons">
                <button onclick="location.reload()" class="btn-retry">Reiniciar</button>
                <button onclick="location.href='../../index.html'" class="btn-menu">Menú</button>
            </div>
        `;

        overlay.appendChild(content);
        document.body.appendChild(overlay);

        this.saveResult(type);
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
