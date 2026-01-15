const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch wrapper
const apiRequest = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
            ...options.headers
        },
        ...options
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
};

// Auth API
export const authAPI = {
    login: async (username, password) => {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        return data;
    },

    register: async (username, email, password) => {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        return data;
    },

    getMe: async () => {
        return await apiRequest('/auth/me');
    },

    updateProfile: async (userData) => {
        return await apiRequest('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

// Users API (Superadmin only)
export const usersAPI = {
    getAll: async () => {
        return await apiRequest('/users');
    },

    getById: async (id) => {
        return await apiRequest(`/users/${id}`);
    },

    create: async (userData) => {
        return await apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    update: async (id, userData) => {
        return await apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },

    delete: async (id) => {
        return await apiRequest(`/users/${id}`, {
            method: 'DELETE'
        });
    }
};

// Teams API (Superadmin only)
export const teamsAPI = {
    getAll: async () => {
        return await apiRequest('/teams');
    },
    create: async (data) => {
        return await apiRequest('/teams', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    update: async (id, data) => {
        return await apiRequest(`/teams/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    delete: async (id) => {
        return await apiRequest(`/teams/${id}`, {
            method: 'DELETE'
        });
    }
};

// Social Accounts API
export const accountsAPI = {
    getAll: async () => {
        return await apiRequest('/accounts');
    },
    create: async (data) => {
        return await apiRequest('/accounts', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    update: async (id, data) => {
        return await apiRequest(`/accounts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    delete: async (id) => {
        return await apiRequest(`/accounts/${id}`, {
            method: 'DELETE'
        });
    }
};

// Content Plans API
export const plansAPI = {
    getAll: async () => {
        return await apiRequest('/plans');
    },
    create: async (data) => {
        return await apiRequest('/plans', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    update: async (id, data) => {
        return await apiRequest(`/plans/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    delete: async (id) => {
        return await apiRequest(`/plans/${id}`, {
            method: 'DELETE'
        });
    }
};

export default { authAPI, usersAPI, teamsAPI, accountsAPI, plansAPI };
