const API_BASE = 'http://localhost:3000';

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        'ngrok-skip-browser-warning': 'true'
    };
};

// Auth API
export const authAPI = {
    login: async (email, password) => {
        const res = await fetch(`${API_BASE}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ email, password })
        });
        return res.json();
    },

    setup: async (username, email, password) => {
        const res = await fetch(`${API_BASE}/api/admin/setup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ username, email, password })
        });
        return res.json();
    },

    getProfile: async () => {
        const res = await fetch(`${API_BASE}/api/admin/profile`, {
            headers: getAuthHeaders()
        });
        return res.json();
    },

    registerAdmin: async (data) => {
        const res = await fetch(`${API_BASE}/api/admin/register`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    getAllAdmins: async () => {
        const res = await fetch(`${API_BASE}/api/admin/all`, {
            headers: getAuthHeaders()
        });
        return res.json();
    },

    toggleAdmin: async (id) => {
        const res = await fetch(`${API_BASE}/api/admin/${id}/toggle`, {
            method: 'PATCH',
            headers: getAuthHeaders()
        });
        return res.json();
    },

    deleteAdmin: async (id) => {
        const res = await fetch(`${API_BASE}/api/admin/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return res.json();
    },

    updatePassword: async (currentPassword, newPassword) => {
        const res = await fetch(`${API_BASE}/api/admin/password`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ currentPassword, newPassword })
        });
        return res.json();
    }
};

// Schemes API
export const schemesAPI = {
    getAll: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/api/schemes${query ? `?${query}` : ''}`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        return res.json();
    },

    getById: async (id) => {
        const res = await fetch(`${API_BASE}/api/schemes/${id}`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        return res.json();
    },

    getCategories: async () => {
        const res = await fetch(`${API_BASE}/api/schemes/categories`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        return res.json();
    },

    getStats: async () => {
        const res = await fetch(`${API_BASE}/api/schemes/stats`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        return res.json();
    },

    // Admin endpoints
    getAllAdmin: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/api/schemes/admin/all${query ? `?${query}` : ''}`, {
            headers: getAuthHeaders()
        });
        return res.json();
    },

    create: async (data) => {
        const res = await fetch(`${API_BASE}/api/schemes`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    update: async (id, data) => {
        const res = await fetch(`${API_BASE}/api/schemes/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    delete: async (id) => {
        const res = await fetch(`${API_BASE}/api/schemes/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return res.json();
    },

    toggle: async (id) => {
        const res = await fetch(`${API_BASE}/api/schemes/${id}/toggle`, {
            method: 'PATCH',
            headers: getAuthHeaders()
        });
        return res.json();
    }
};
