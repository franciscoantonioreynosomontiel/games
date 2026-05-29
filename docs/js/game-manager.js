const GameManager = {
    lives: 3,
    currentGame: '',
    currentDifficulty: 'medium',
    currentLevel: 1,
    maxLevel: 50,

    init() {
        this.addPopupStyles();
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
        const oldBar = document.getElementById('gm-header-bar');
        if (oldBar) oldBar.remove();

        const bar = document.createElement('div');
        bar.id = 'gm-header-bar';
        bar.style.cssText = `
            display: flex; justify-content: space-between; align-items: center;
            padding: 8px 16px; background: #fdfdfd; border-bottom: 2px solid #eee;
            font-size: 14px; font-weight: 500;
        `;

        const livesDiv = document.createElement('div');
        livesDiv.id = 'gm-lives';
        livesDiv.style.display = 'flex';
        this.updateLivesUI(livesDiv);

        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `
            <span style="background: var(--primary-color); color: white; padding: 3px 10px; border-radius: 12px; margin-right: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">NIVEL ${this.currentLevel}</span>
            <button onclick="GameManager.showLevelSelector()" class="btn-premium" style="padding: 4px 10px; font-size: 11px;">NIVELES</button>
        `;

        bar.appendChild(livesDiv);
        bar.appendChild(infoDiv);

        const header = document.querySelector('.app-header');
        if (header) header.after(bar);
        else document.body.prepend(bar);
    },

    updateLivesUI(container) {
        const target = container || document.getElementById('gm-lives');
        if (!target) return;
        target.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const heart = document.createElement('span');
            heart.className = 'material-icons';
            heart.style.cssText = `font-size: 22px; margin-right: 4px; transition: transform 0.3s;`;
            heart.innerText = i < this.lives ? 'favorite' : 'favorite_border';
            heart.style.color = i < this.lives ? '#f44336' : '#bbb';
            if (i >= this.lives) heart.style.transform = 'scale(0.8)';
            target.appendChild(heart);
        }
    },

    showLevelSelector() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';

        let levelsHtml = '';
        const unlocked = this.getUnlockedLevel();
        const completedLevels = JSON.parse(localStorage.getItem(`completed_${Auth.currentUser?.username}_${this.currentGame}`) || '[]');

        for (let i = 1; i <= this.maxLevel; i++) {
            const isLocked = i > unlocked;
            const isCompleted = completedLevels.includes(i);
            levelsHtml += `
                <button class="lvl-btn-mini ${isLocked ? 'locked' : ''}"
                        ${isLocked ? 'disabled' : `onclick="GameManager.goToLevel(${i})"`}
                        style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: ${isLocked ? '#f5f5f5' : (isCompleted ? '#e8f5e9' : 'white')}; cursor: ${isLocked ? 'default' : 'pointer'}; position: relative; font-weight: bold;">
                    ${i}
                    ${isLocked ? '<span class="material-icons" style="font-size: 14px; position: absolute; top: 2px; right: 2px; color: #999;">lock</span>' : ''}
                    ${isCompleted ? '<span class="material-icons" style="font-size: 14px; position: absolute; bottom: 2px; right: 2px; color: #4caf50;">star</span>' : ''}
                </button>
            `;
        }

        overlay.innerHTML = `
            <div class="modal-content" style="max-width: 380px;">
                <h3 style="margin-bottom: 20px; text-align: center; color: var(--primary-color);">Seleccionar Nivel</h3>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; max-height: 350px; overflow-y: auto; padding: 5px; scrollbar-width: thin;">
                    ${levelsHtml}
                </div>
                <button class="btn-premium" style="margin-top: 20px; width: 100%;" onclick="this.parentElement.parentElement.remove()">CERRAR</button>
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
            setTimeout(() => this.showResult('loss'), 500);
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
                // Mark level as completed
                const completed = JSON.parse(localStorage.getItem(`completed_${Auth.currentUser.username}_${this.currentGame}`) || '[]');
                if (!completed.includes(this.currentLevel)) {
                    completed.push(this.currentLevel);
                    localStorage.setItem(`completed_${Auth.currentUser.username}_${this.currentGame}`, JSON.stringify(completed));
                }

                const unlocked = this.getUnlockedLevel();
                if (this.currentLevel >= unlocked && this.currentLevel < this.maxLevel) {
                    localStorage.setItem(`max_unlocked_${Auth.currentUser.username}_${this.currentGame}`, this.currentLevel + 1);
                }
            }
        } catch (e) { console.error(e); }
    },

    showResult(type, details = "") {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';
        overlay.style.zIndex = '3000';

        const content = document.createElement('div');
        content.className = `modal-content animated ${type === 'win' ? 'bounceIn' : 'fadeInUp'}`;
        content.style.textAlign = 'center';

        let title, msg, icon, color;
        if (type === 'win') {
            title = '¡EXCELENTE!';
            msg = details || `Nivel ${this.currentLevel} completado con éxito.`;
            icon = 'stars';
            color = '#4CAF50';
        } else if (type === 'draw') {
            title = 'TABLAS';
            msg = 'La partida ha terminado en empate.';
            icon = 'equalizer';
            color = '#FF9800';
        } else {
            title = 'NIVEL FALLIDO';
            msg = details || `Has agotado tus intentos en el nivel ${this.currentLevel}.`;
            icon = 'sentiment_very_dissatisfied';
            color = '#F44336';
        }

        content.innerHTML = `
            <span class="material-icons" style="font-size: 80px; color: ${color}; margin-bottom: 20px;">${icon}</span>
            <h2 style="margin-bottom: 10px; color: ${color};">${title}</h2>
            <p style="color: #555; margin-bottom: 25px; line-height: 1.5;">${msg}</p>
            <div style="display: flex; gap: 12px;">
                <button onclick="location.reload()" class="btn-premium" style="flex: 1;">${type === 'win' ? 'SIGUIENTE' : 'REINTENTAR'}</button>
                <button onclick="location.href='../../index.html'" class="btn-premium" style="flex: 1; background: #eee; color: #333;">MENÚ</button>
            </div>
        `;

        overlay.appendChild(content);
        document.body.appendChild(overlay);

        this.saveResult(type);
    },

    addPopupStyles() {}
};

window.GameManager = GameManager;
GameManager.init();
