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
            alert(e.message);
        }
    });

    // Logout logic
    document.getElementById('profile-btn')?.addEventListener('click', () => {
        if (Auth.isLoggedIn()) {
            if (confirm('¿Cerrar sesión?')) Auth.logout();
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
            alert('Usuario creado exitosamente');
            document.getElementById('register-modal').style.display = 'none';
        } catch (e) {
            alert(e.message);
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
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('display-username').innerText = Auth.currentUser.username;
            if (Auth.isAdmin()) {
                document.getElementById('admin-section').style.display = 'block';
                document.getElementById('admin-nav').style.display = 'flex';
            }
        } else {
            window.location.href = 'login.html';
        }
    }
});
