import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                const res = await authAPI.getProfile();
                if (res.success) {
                    setAdmin(res.data);
                } else {
                    localStorage.removeItem('adminToken');
                }
            } catch {
                localStorage.removeItem('adminToken');
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (email, password) => {
        const res = await authAPI.login(email, password);
        if (res.success) {
            localStorage.setItem('adminToken', res.data.token);
            setAdmin({
                id: res.data.id,
                username: res.data.username,
                email: res.data.email,
                role: res.data.role,
                city: res.data.city
            });
            return { success: true, role: res.data.role };
        }
        return { success: false, message: res.message };
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setAdmin(null);
    };

    const isSuperAdmin = () => admin?.role === 'superadmin';

    return (
        <AuthContext.Provider value={{ admin, loading, login, logout, isSuperAdmin, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
