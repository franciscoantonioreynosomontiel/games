const Auth = {
    currentUser: JSON.parse(localStorage.getItem('gamehub_user')) || null,

    async login(username, password) {
        const { data, error } = await window.appConfig.supabase
            .from('app_users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (error || !data) {
            throw new Error('Usuario o contraseña incorrectos');
        }

        this.currentUser = data;
        localStorage.setItem('gamehub_user', JSON.stringify(data));
        return data;
    },

    async register(username, password, role = 'user') {
        if (this.currentUser?.role !== 'admin') {
            throw new Error('Solo el administrador puede crear usuarios');
        }

        const { data, error } = await window.appConfig.supabase
            .from('app_users')
            .insert([{ username, password, role }])
            .select();

        if (error) throw error;
        return data[0];
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('gamehub_user');
        window.location.href = '/docs/index.html';
    },

    isAdmin() {
        return this.currentUser?.role === 'admin';
    },

    isLoggedIn() {
        return !!this.currentUser;
    }
};

window.Auth = Auth;
