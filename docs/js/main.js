document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('SW registered'))
                .catch(err => console.log('SW failed', err));
        });
    }

    // Profile Menu Toggle
    const userInfo = document.getElementById('user-info');
    const profileMenu = document.getElementById('profile-menu');

    userInfo?.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu?.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        profileMenu?.classList.remove('active');
    });

    // Logout logic
    document.getElementById('btn-logout')?.addEventListener('click', async () => {
        const confirmed = await UIManager.confirm('Cerrar Sesión', '¿Estás seguro de que quieres salir?');
        if (confirmed) Auth.logout();
    });

    function updateAuthUI() {
        if (Auth.isLoggedIn()) {
            const displayUsername = document.getElementById('display-username');
            const menuUsername = document.getElementById('menu-username');
            if (displayUsername) displayUsername.innerText = Auth.currentUser.username;
            if (menuUsername) menuUsername.innerText = Auth.currentUser.username;

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
