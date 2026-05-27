document.addEventListener('DOMContentLoaded', () => {
    console.log('GameHub Initialized');

    // Bottom Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Supabase check (optional)
    if (window.appConfig && window.appConfig.supabase) {
        console.log('Supabase client detected');
    }
});
