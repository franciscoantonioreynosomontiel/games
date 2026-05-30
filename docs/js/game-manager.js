const GameManager = {
    lives: 3,
    maxLives: 3,
    currentGame: '',
    currentDifficulty: 'medium',
    currentLevel: 1,
    maxLevel: 50,
    hasLevels: true,

    init() {
    },

    loadLevel() {
        if (Auth.isLoggedIn()) {
            const user = Auth.currentUser.username;
            const saved = localStorage.getItem(`level_${user}_${this.currentGame}`);
            this.currentLevel = saved ? parseInt(saved) : 1;
        } else {
            this.currentLevel = 1;
        }
    },

    setGame(gameName, hasLevels = true, difficulty = 'medium') {
        this.currentGame = gameName;
        this.hasLevels = hasLevels;
        this.currentDifficulty = difficulty;
        this.maxLives = (gameName === 'hangman') ? 6 : 3;
        this.lives = this.maxLives;
        this.loadLevel();

        if (sessionStorage.getItem(`autostart_${this.currentGame}`) === 'true') {
            const sessionLvl = sessionStorage.getItem(`target_level_${this.currentGame}`);
            if (sessionLvl) this.currentLevel = parseInt(sessionLvl);
        }

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
        if (this.hasLevels) {
            infoDiv.innerHTML = `
                <span style="background: var(--primary-color); color: white; padding: 3px 10px; border-radius: 12px; margin-right: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">NIVEL ${this.currentLevel}</span>
                <button onclick="GameManager.showLevelSelector()" class="btn-premium" style="padding: 4px 10px; font-size: 11px;">MENU</button>
            `;
        } else {
            infoDiv.innerHTML = `
                <span style="color: #666; font-size: 11px; text-transform: uppercase; background: #eee; padding: 4px 8px; border-radius: 10px;">${this.currentDifficulty}</span>
                <button onclick="GameManager.showLevelSelector()" class="btn-premium" style="padding: 4px 10px; font-size: 11px; margin-left: 8px;">MENU</button>
            `;
        }

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
        if (this.currentGame === 'hanoi') return;

        for (let i = 0; i < this.maxLives; i++) {
            const heart = document.createElement('span');
            heart.className = 'material-icons';
            heart.style.cssText = `font-size: 18px; margin-right: 2px; transition: transform 0.3s;`;
            heart.innerText = i < this.lives ? 'favorite' : 'favorite_border';
            heart.style.color = i < this.lives ? '#f44336' : '#bbb';
            target.appendChild(heart);
        }
    },

    showLevelSelector() {
        sessionStorage.removeItem(`autostart_${this.currentGame}`);
        location.reload();
    },

    getUnlockedLevel() {
        if (!Auth.isLoggedIn()) return 1;
        const saved = localStorage.getItem(`max_unlocked_${Auth.currentUser.username}_${this.currentGame}`);
        return saved ? parseInt(saved) : 1;
    },

    goToLevel(lvl) {
        this.currentLevel = lvl;
        if (Auth.isLoggedIn()) {
            localStorage.setItem(`level_${Auth.currentUser.username}_${this.currentGame}`, lvl);
        }
        sessionStorage.setItem(`autostart_${this.currentGame}`, 'true');
        sessionStorage.setItem(`target_level_${this.currentGame}`, lvl);
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
        const user = Auth.currentUser;
        if (!user) return;

        if (result === 'win') {
            const completed = JSON.parse(localStorage.getItem(`completed_${user.username}_${this.currentGame}`) || '[]');

            if (this.hasLevels) {
                if (!completed.includes(this.currentLevel)) {
                    completed.push(this.currentLevel);
                    localStorage.setItem(`completed_${user.username}_${this.currentGame}`, JSON.stringify(completed));
                }
                const unlocked = this.getUnlockedLevel();
                if (this.currentLevel >= unlocked && this.currentLevel < this.maxLevel) {
                    localStorage.setItem(`max_unlocked_${user.username}_${this.currentGame}`, this.currentLevel + 1);
                }
            } else {
                const diffKey = this.currentDifficulty.toLowerCase();
                if (!completed.includes(diffKey)) {
                    completed.push(diffKey);
                    localStorage.setItem(`completed_${user.username}_${this.currentGame}`, JSON.stringify(completed));
                }
            }
        }

        try {
            await window.appConfig.supabase
                .from('game_scores')
                .insert([{
                    user_id: user.id,
                    game_id: this.currentGame,
                    score: score,
                    level: this.currentLevel,
                    difficulty: this.currentDifficulty
                }]);
        } catch (e) { console.error('Supabase error:', e); }
    },

    showResult(type, details = "") {
        const existing = document.querySelector('.modal-overlay-result');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay-result';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); display: flex; align-items: center;
            justify-content: center; z-index: 9999;
        `;

        const content = document.createElement('div');
        content.className = `modal-content animated ${type === 'win' ? 'bounceIn' : 'fadeInUp'}`;
        content.style.cssText = `
            background: white; padding: 30px; border-radius: 20px;
            text-align: center; width: 90%; max-width: 400px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;

        let title, msg, icon, color;
        if (type === 'win') {
            title = '¡EXCELENTE!';
            msg = details || (this.hasLevels ? `Nivel ${this.currentLevel} completado.` : `¡Has ganado!`);
            icon = 'stars';
            color = '#4CAF50';
        } else if (type === 'draw') {
            title = 'TABLAS';
            msg = 'Empate.';
            icon = 'equalizer';
            color = '#FF9800';
        } else {
            title = 'FIN DEL JUEGO';
            msg = details || `Has agotado tus intentos.`;
            icon = 'sentiment_very_dissatisfied';
            color = '#F44336';
        }

        const isLastLevel = this.currentLevel >= this.maxLevel;
        const showNext = (type === 'win' && this.hasLevels && !isLastLevel);

        content.innerHTML = `
            <span class="material-icons" style="font-size: 80px; color: ${color}; margin-bottom: 20px;">${icon}</span>
            <h2 style="margin-bottom: 10px; color: ${color}; text-transform: uppercase;">${title}</h2>
            <p style="color: #555; margin-bottom: 25px; line-height: 1.5; font-weight: 500;">${msg}</p>
            <div style="display: flex; gap: 12px; flex-direction: column;">
                <button id="btn-next-res" class="btn-premium" style="width: 100%;">${showNext ? 'SIGUIENTE NIVEL' : 'REINTENTAR'}</button>
                <button onclick="location.href='../../index.html'" class="btn-premium" style="width: 100%; background: #eee; color: #333;">VOLVER AL MENÚ</button>
            </div>
        `;

        overlay.appendChild(content);
        document.body.appendChild(overlay);

        document.getElementById('btn-next-res').onclick = () => {
            if (showNext) {
                const nextLevel = this.currentLevel + 1;
                if (Auth.isLoggedIn()) {
                    localStorage.setItem(`level_${Auth.currentUser.username}_${this.currentGame}`, nextLevel);
                }
                sessionStorage.setItem(`autostart_${this.currentGame}`, 'true');
                sessionStorage.setItem(`target_level_${this.currentGame}`, nextLevel);
            }
            location.reload();
        };

        this.saveResult(type);
    },

    isCompleted(diff) {
        if (!Auth.isLoggedIn()) return false;
        const completed = JSON.parse(localStorage.getItem(`completed_${Auth.currentUser.username}_${this.currentGame}`) || '[]');
        const checkVal = typeof diff === 'string' ? diff.toLowerCase() : parseInt(diff);
        return completed.includes(checkVal);
    }
};

window.GameManager = GameManager;
GameManager.init();
