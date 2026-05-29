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
        const email = `${username.toLowerCase()}@gamehub.com`;
        const { data, error } = await window.appConfig.supabase
            .from('app_users')
            .insert([{ username, password, email, role }])
            .select();

        if (error) throw error;
        return data[0];
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('gamehub_user');
        window.location.href = 'login.html';
    },

    isAdmin() {
        // Hardcoded admin check for 'Antonio' or check role field
        return this.currentUser?.username === 'Antonio' || this.currentUser?.role === 'admin';
    },

    isLoggedIn() {
        return !!this.currentUser;
    }
};

window.Auth = Auth;
