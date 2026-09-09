/**
 * Lumina Blog - Centralized Web Fetch API Service
 */

const API_BASE = '/api';

const Storage = {
    TOKEN_KEY: 'lumina_token',
    USER_KEY: 'lumina_user',

    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },
    setToken(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
    },
    getUser() {
        const user = localStorage.getItem(this.USER_KEY);
        try {
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    },
    setUser(user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    },
    clear() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }
};

const Toast = {
    show(message, type = 'info', duration = 3500) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
        toast.innerHTML = `<span style="font-weight: bold;">${icon}</span> <span>${message}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const token = Storage.getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);

        if (response.status === 204) {
            return null;
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                if (token && !endpoint.includes('/auth/login')) {
                    Storage.clear();
                    Toast.show('Session expired. Please log in again.', 'warning');
                    if (window.location.pathname.includes('dashboard.html')) {
                        setTimeout(() => window.location.href = 'auth.html', 1000);
                    }
                }
            }

            let errorMessage = (data && data.message) ? data.message : `HTTP Error ${response.status}`;
            if (data && data.fieldErrors) {
                const firstField = Object.keys(data.fieldErrors)[0];
                errorMessage = `${data.fieldErrors[firstField]}`;
            }
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        throw error;
    }
}

const api = {
    auth: {
        async register(name, email, password) {
            const data = await request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });
            if (data && data.token) {
                Storage.setToken(data.token);
                Storage.setUser(data.user);
            }
            return data;
        },

        async login(email, password) {
            const data = await request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            if (data && data.token) {
                Storage.setToken(data.token);
                Storage.setUser(data.user);
            }
            return data;
        },

        async getProfile() {
            return request('/auth/me');
        },

        logout() {
            Storage.clear();
            Toast.show('Logged out successfully', 'info');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        },

        isAuthenticated() {
            return !!Storage.getToken();
        },

        getUser() {
            return Storage.getUser();
        },

        requireAuth() {
            if (!this.isAuthenticated()) {
                window.location.href = 'auth.html?redirect=' + encodeURIComponent(window.location.pathname);
                return false;
            }
            return true;
        }
    },

    posts: {
        async getAll(search = '', category = '') {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category && category !== 'All') params.append('category', category);
            const query = params.toString() ? `?${params.toString()}` : '';
            return request(`/posts${query}`);
        },

        async getById(id) {
            return request(`/posts/${id}`);
        },

        async getMyPosts() {
            return request('/posts/my-posts');
        },

        async create(postData) {
            return request('/posts', {
                method: 'POST',
                body: JSON.stringify(postData)
            });
        },

        async update(id, postData) {
            return request(`/posts/${id}`, {
                method: 'PUT',
                body: JSON.stringify(postData)
            });
        },

        async delete(id) {
            return request(`/posts/${id}`, {
                method: 'DELETE'
            });
        }
    },

    comments: {
        async getByPost(postId) {
            return request(`/posts/${postId}/comments`);
        },

        async add(postId, content, authorName) {
            return request(`/posts/${postId}/comments`, {
                method: 'POST',
                body: JSON.stringify({ content, authorName })
            });
        },

        async delete(commentId) {
            return request(`/comments/${commentId}`, {
                method: 'DELETE'
            });
        }
    }
};

window.api = api;
window.Toast = Toast;
window.Storage = Storage;
