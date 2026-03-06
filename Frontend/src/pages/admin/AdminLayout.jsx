import { useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css'; // Reusing established admin styles

const AdminLayout = () => {
    const { admin, logout, isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (admin && admin.role === 'distributor') {
            navigate('/distributor/dashboard', { replace: true });
        }
    }, [admin, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="admin-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <nav className="admin-nav">
                <div className="nav-brand">
                    <span className="brand-icon">🌾</span>
                    <span className="brand-text">Agro-chain Admin</span>
                </div>
                <div className="nav-links">
                    <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard')}`}>Dashboard</Link>
                    <Link to="/admin/schemes" className={`nav-link ${isActive('/admin/schemes')}`}>Schemes</Link>
                    <Link to="/admin/distributors" className={`nav-link ${isActive('/admin/distributors')}`}>Distributors</Link>
                    <Link to="/admin/inventory" className={`nav-link ${isActive('/admin/inventory')}`}>Inventory</Link>
                    <Link to="/admin/notifications" className={`nav-link ${isActive('/admin/notifications')}`}>Notifications</Link>
                    {isSuperAdmin() && (
                        <Link to="/admin/users" className={`nav-link ${isActive('/admin/users')}`}>Admins</Link>
                    )}
                </div>
                <div className="nav-user">
                    <span className="user-info">
                        <span className="user-name">{admin?.username}</span>
                        <span className={`user-role ${admin?.role}`}>{admin?.role}</span>
                    </span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </nav>

            <main className="admin-main-content" style={{ flex: 1, backgroundColor: '#f8fafc' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
