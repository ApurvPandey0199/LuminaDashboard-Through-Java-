/**
 * Lumina Blog - Authentication Controller (Sign In & Sign Up)
 */

document.addEventListener('DOMContentLoaded', () => {
    // If already authenticated, redirect to dashboard
    if (api.auth.isAuthenticated()) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || 'dashboard.html';
        window.location.href = redirect;
        return;
    }

    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');

    // Switch to Register
    function showRegister() {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.style.display = 'block';
        formLogin.style.display = 'none';
        authTitle.innerText = 'Create an Account';
        authSubtitle.innerText = 'Join our developer community to publish and share articles.';
    }

    // Switch to Login
    function showLogin() {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.style.display = 'block';
        formRegister.style.display = 'none';
        authTitle.innerText = 'Welcome Back';
        authSubtitle.innerText = 'Sign in to access your author dashboard and manage your posts.';
    }

    tabRegister?.addEventListener('click', showRegister);
    tabLogin?.addEventListener('click', showLogin);

    // Check query param for default tab
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'register') {
        showRegister();
    }

    // Handle Login Submit
    formLogin?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = formLogin.querySelector('button[type="submit"]');
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            Toast.show('Please enter both email and password.', 'error');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerText = 'Signing in...';

            const res = await api.auth.login(email, password);
            Toast.show(`Welcome back, ${res.user.name}!`, 'success');

            setTimeout(() => {
                const redirect = urlParams.get('redirect') || 'dashboard.html';
                window.location.href = redirect;
            }, 800);
        } catch (err) {
            Toast.show(err.message || 'Login failed. Please check your credentials.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Sign In';
        }
    });

    // Handle Register Submit
    formRegister?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = formRegister.querySelector('button[type="submit"]');
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;

        if (!name || name.length < 2) {
            Toast.show('Name must be at least 2 characters.', 'error');
            return;
        }
        if (!email || !email.includes('@')) {
            Toast.show('Please enter a valid email address.', 'error');
            return;
        }
        if (!password || password.length < 6) {
            Toast.show('Password must be at least 6 characters.', 'error');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerText = 'Creating account...';

            const res = await api.auth.register(name, email, password);
            Toast.show(`Registration successful! Welcome, ${res.user.name}.`, 'success');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        } catch (err) {
            Toast.show(err.message || 'Registration failed. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Create Account';
        }
    });

    // Demo Autofill Buttons
    window.fillDemo = function (role) {
        showLogin();
        if (role === 'admin') {
            document.getElementById('login-email').value = 'admin@example.com';
            document.getElementById('login-password').value = 'Admin@123';
        } else {
            document.getElementById('login-email').value = 'demo@example.com';
            document.getElementById('login-password').value = 'Demo@123';
        }
        Toast.show(`Loaded ${role} demo credentials! Click 'Sign In'.`, 'info');
    };
});
