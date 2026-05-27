const UIManager = {
    alert(title, message, type = 'info') {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';
        overlay.style.zIndex = '2000';

        const icon = this.getIcon(type);
        const color = this.getColor(type);

        overlay.innerHTML = `
            <div class="modal-content animated zoomIn" style="text-align: center;">
                <span class="material-icons" style="font-size: 64px; color: ${color}; margin-bottom: 16px;">${icon}</span>
                <h2 style="margin-bottom: 8px;">${title}</h2>
                <p style="color: #666; margin-bottom: 24px;">${message}</p>
                <button class="btn-primary" id="ui-alert-close">ACEPTAR</button>
            </div>
        `;

        document.body.appendChild(overlay);

        return new Promise(resolve => {
            document.getElementById('ui-alert-close').onclick = () => {
                overlay.remove();
                resolve();
            };
        });
    },

    confirm(title, message) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';
        overlay.style.zIndex = '2000';

        overlay.innerHTML = `
            <div class="modal-content animated zoomIn" style="text-align: center;">
                <span class="material-icons" style="font-size: 64px; color: var(--primary-color); margin-bottom: 16px;">help_outline</span>
                <h2 style="margin-bottom: 8px;">${title}</h2>
                <p style="color: #666; margin-bottom: 24px;">${message}</p>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-primary" style="background: #eee; color: #333;" id="ui-confirm-cancel">CANCELAR</button>
                    <button class="btn-primary" id="ui-confirm-ok">CONFIRMAR</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        return new Promise(resolve => {
            document.getElementById('ui-confirm-ok').onclick = () => {
                overlay.remove();
                resolve(true);
            };
            document.getElementById('ui-confirm-cancel').onclick = () => {
                overlay.remove();
                resolve(false);
            };
        });
    },

    getIcon(type) {
        switch(type) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'warning': return 'warning';
            default: return 'info';
        }
    },

    getColor(type) {
        switch(type) {
            case 'success': return '#4CAF50';
            case 'error': return '#F44336';
            case 'warning': return '#FF9800';
            default: return '#2196F3';
        }
    }
};

window.UIManager = UIManager;
