import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShimmerTable } from '../../components/Shimmer';
import { authAPI } from '../../services/api';
import './SuperAdmin.css'; // Reusing SuperAdmin styles to ensure identical aesthetic

const DistributorManagement = () => {
    const { admin, isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const [distributors, setDistributors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        city: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (!admin || !['admin', 'superadmin'].includes(admin.role)) {
            navigate('/admin/dashboard');
            return;
        }
        loadDistributors();
    }, [admin]);

    const loadDistributors = async () => {
        setLoading(true);
        const res = await authAPI.getAllDistributors();
        if (res.success) {
            setDistributors(res.data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const res = await authAPI.registerDistributor(formData);
        if (res.success) {
            setShowModal(false);
            setFormData({ username: '', email: '', password: '', city: '' });
            loadDistributors();
        } else {
            setError(res.message || 'Failed to create distributor');
        }
    };

    const handleToggle = async (id) => {
        const res = await authAPI.toggleAdmin(id); // Reusng the same toggle endpoint
        if (res.success) {
            loadDistributors();
        } else {
            alert(res.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this distributor?')) return;
        const res = await authAPI.deleteAdmin(id); // Reusing the same delete endpoint
        if (res.success) {
            loadDistributors();
        } else {
            alert(res.message || 'Delete failed');
        }
    };

    return (
        <div className="super-admin distributor-management">
            <main className="admin-content">
                <div className="content-header">
                    <div>
                        <h1>Distributor Management</h1>
                        <p>Manage distributor accounts and assign operational cities.</p>
                    </div>
                    <button className="add-btn" onClick={() => setShowModal(true)}>
                        + Add New Distributor
                    </button>
                </div>

                {loading ? (
                    <ShimmerTable rows={6} />
                ) : (
                    <div className="admins-grid">
                        {distributors.map(d => (
                            <div key={d._id} className={`admin-card ${!d.isActive ? 'inactive' : ''}`}>
                                <div className="admin-avatar">
                                    {d.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="admin-info">
                                    <h3>{d.username}</h3>
                                    <p>{d.email}</p>
                                    <div className="admin-meta">
                                        <span className={`role-badge distributor`}>Distributor in {d.city}</span>
                                        <span className={`status-badge ${d.isActive ? 'active' : 'inactive'}`}>
                                            {d.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    {d.lastLogin && (
                                        <span className="last-login">
                                            Last login: {new Date(d.lastLogin).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <div className="admin-actions">
                                    <button
                                        onClick={() => handleToggle(d._id)}
                                        className={`toggle-btn ${d.isActive ? 'deactivate' : 'activate'}`}
                                    >
                                        {d.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button onClick={() => handleDelete(d._id)} className="delete-btn">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        {distributors.length === 0 && (
                            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
                                No distributors found. Click the button above to add one.
                            </p>
                        )}
                    </div>
                )}
            </main>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add New Distributor</h2>
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
                                <label>Assigned City (MP Only) *</label>
                                <select
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select a city</option>
                                    {[
                                        "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur",
                                        "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Guna",
                                        "Gwalior", "Harda", "Hoshangabad", "Indore", "Itarsi", "Jabalpur", "Jhabua",
                                        "Katni", "Khandwa", "Khargone", "Mandsaur", "Morena", "Murwara", "Neemuch",
                                        "Panna", "Pithampur", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni",
                                        "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh",
                                        "Ujjain", "Vidisha"
                                    ].map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    Create Distributor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DistributorManagement;
