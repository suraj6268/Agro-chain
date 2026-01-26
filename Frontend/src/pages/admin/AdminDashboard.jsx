import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { schemesAPI } from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { admin, logout, isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await schemesAPI.getStats();
            if (res.success) {
                setStats(res.data);
            }
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
        setLoading(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="admin-dashboard">
            <nav className="admin-nav">
                <div className="nav-brand">
                    <span className="brand-icon">🌾</span>
                    <span className="brand-text">Agro-chain Admin</span>
                </div>
                <div className="nav-links">
                    <Link to="/admin/dashboard" className="nav-link active">Dashboard</Link>
                    <Link to="/admin/schemes" className="nav-link">Schemes</Link>
                    {isSuperAdmin() && (
                        <Link to="/admin/users" className="nav-link">Admins</Link>
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

            <main className="admin-content">
                <div className="content-header">
                    <h1>Dashboard</h1>
                    <p>Welcome back, {admin?.username}!</p>
                </div>

                {loading ? (
                    <div className="loading">Loading statistics...</div>
                ) : (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card total">
                                <div className="stat-icon">📊</div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats?.totalSchemes || 0}</span>
                                    <span className="stat-label">Total Schemes</span>
                                </div>
                            </div>
                            <div className="stat-card categories">
                                <div className="stat-icon">📁</div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats?.categoryStats?.length || 0}</span>
                                    <span className="stat-label">Categories</span>
                                </div>
                            </div>
                            <div className="stat-card states">
                                <div className="stat-icon">🗺️</div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats?.stateStats?.length || 0}</span>
                                    <span className="stat-label">States Covered</span>
                                </div>
                            </div>
                            <div className="stat-card views">
                                <div className="stat-icon">👁️</div>
                                <div className="stat-info">
                                    <span className="stat-value">
                                        {stats?.mostViewed?.reduce((sum, s) => sum + (s.viewCount || 0), 0) || 0}
                                    </span>
                                    <span className="stat-label">Total Views</span>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-sections">
                            <div className="section">
                                <h2>📈 Category Distribution</h2>
                                <div className="category-list">
                                    {stats?.categoryStats?.map((cat, i) => (
                                        <div key={i} className="category-item">
                                            <span className="cat-name">{cat.name}</span>
                                            <span className="cat-count">{cat.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="section">
                                <h2>🔥 Most Viewed</h2>
                                <div className="scheme-list">
                                    {stats?.mostViewed?.slice(0, 5).map((scheme, i) => (
                                        <div key={i} className="scheme-item">
                                            <span className="scheme-name">{scheme.name}</span>
                                            <span className="scheme-views">{scheme.viewCount} views</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="section">
                                <h2>🆕 Recently Added</h2>
                                <div className="scheme-list">
                                    {stats?.recentlyAdded?.slice(0, 5).map((scheme, i) => (
                                        <div key={i} className="scheme-item">
                                            <span className="scheme-name">{scheme.name}</span>
                                            <span className="scheme-date">
                                                {new Date(scheme.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <h2>Quick Actions</h2>
                            <div className="action-buttons">
                                <Link to="/admin/schemes" className="action-btn primary">
                                    <span>📋</span> Manage Schemes
                                </Link>
                                {isSuperAdmin() && (
                                    <Link to="/admin/users" className="action-btn secondary">
                                        <span>👥</span> Manage Admins
                                    </Link>
                                )}
                                <a href="/" target="_blank" className="action-btn outline">
                                    <span>🌐</span> View Public Site
                                </a>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
