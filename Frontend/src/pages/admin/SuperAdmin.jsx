import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShimmerTable } from '../../components/Shimmer';
import { authAPI } from '../../services/api';
import './SuperAdmin.css';

const SuperAdmin = () => {
    const { admin, logout, isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'admin'
    });
    const [error, setError] = useState('');

    const loadAdmins = async () => {
        setLoading(true);
        const res = await authAPI.getAllAdmins();
        if (res.success) {
            setAdmins(res.data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!isSuperAdmin()) {
            navigate('/admin/dashboard');
            return;
        }
        loadAdmins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const res = await authAPI.registerAdmin(formData);
        if (res.success) {
            setShowModal(false);
            setFormData({ username: '', email: '', password: '', role: 'admin' });
            loadAdmins();
        } else {
            setError(res.message || 'Failed to create admin');
        }
    };

    const handleToggle = async (id) => {
        const res = await authAPI.toggleAdmin(id);
        if (res.success) {
            loadAdmins();
        } else {
            alert(res.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this admin?')) return;
        const res = await authAPI.deleteAdmin(id);
        if (res.success) {
            loadAdmins();
        } else {
            alert(res.message || 'Delete failed');
        }
    };


    return (
        <div className="super-admin">


            <main className="admin-content">
                <div className="content-header">
                    <div>
                        <h1>Admin Management</h1>
                        <p>Manage admin accounts (Super Admin only)</p>
                    </div>
                    <button className="add-btn" onClick={() => setShowModal(true)}>
                        + Add New Admin
                    </button>
                </div>

                {loading ? (
                    <ShimmerTable rows={6} />
                ) : (
                    <div className="admins-grid">
                        {admins.map(a => (
                            <div key={a._id} className={`admin-card ${!a.isActive ? 'inactive' : ''}`}>
                                <div className="admin-avatar">
                                    {a.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="admin-info">
                                    <h3>{a.username}</h3>
                                    <p>{a.email}</p>
                                    <div className="admin-meta">
                                        <span className={`role-badge ${a.role}`}>{a.role}</span>
                                        <span className={`status-badge ${a.isActive ? 'active' : 'inactive'}`}>
                                            {a.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    {a.lastLogin && (
                                        <span className="last-login">
                                            Last login: {new Date(a.lastLogin).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                {a._id !== admin?.id && (
                                    <div className="admin-actions">
                                        <button
                                            onClick={() => handleToggle(a._id)}
                                            className={`toggle-btn ${a.isActive ? 'deactivate' : 'activate'}`}
                                        >
                                            {a.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button onClick={() => handleDelete(a._id)} className="delete-btn">
                                            Delete
                                        </button>
                                    </div>
                                )}
                                {a._id === admin?.id && (
                                    <div className="you-badge">You</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add New Admin</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-form">
                            {error && <div className="error-message">⚠️ {error}</div>}

                            <div className="form-group">
                                <label>Username *</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    minLength={3}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Password *</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Super Admin</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    Create Admin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdmin;
