document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();

    // Login logic
    document.getElementById('show-login')?.addEventListener('click', () => {
        document.getElementById('login-modal').style.display = 'flex';
    });

    document.getElementById('btn-do-login')?.addEventListener('click', async () => {
        const user = document.getElementById('login-user').value;
        const pass = document.getElementById('login-pass').value;
        try {
            await Auth.login(user, pass);
            location.reload();
        } catch (e) {
            UIManager.alert('Error', e.message, 'error');
        }
    });

    // Logout logic
    document.getElementById('profile-btn')?.addEventListener('click', async () => {
        if (Auth.isLoggedIn()) {
            const confirmed = await UIManager.confirm('Cerrar Sesión', '¿Estás seguro de que quieres salir?');
            if (confirmed) Auth.logout();
        }
    });

    // Admin logic
    document.getElementById('show-create-user')?.addEventListener('click', () => {
        document.getElementById('register-modal').style.display = 'flex';
    });

    document.getElementById('btn-do-reg')?.addEventListener('click', async () => {
        const user = document.getElementById('reg-user').value;
        const pass = document.getElementById('reg-pass').value;
        try {
            await Auth.register(user, pass);
            UIManager.alert('Éxito', 'Usuario creado exitosamente', 'success');
            document.getElementById('register-modal').style.display = 'none';
        } catch (e) {
            UIManager.alert('Error', e.message, 'error');
        }
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.style.display = 'none';
        });
    });

    function updateAuthUI() {
        if (Auth.isLoggedIn()) {
            const loginSection = document.getElementById('login-section');
            if (loginSection) loginSection.style.display = 'none';

            const displayUsername = document.getElementById('display-username');
            if (displayUsername) displayUsername.innerText = Auth.currentUser.username;

            if (Auth.isAdmin()) {
                const adminSection = document.getElementById('admin-section');
                if (adminSection) adminSection.style.display = 'block';
                const adminNav = document.getElementById('admin-nav');
                if (adminNav) adminNav.style.display = 'flex';
            }
        } else {
            if (!window.location.href.includes('login.html')) {
                window.location.href = 'login.html';
            }
        }
    }
});
