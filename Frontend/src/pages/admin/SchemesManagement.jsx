import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { schemesAPI } from '../../services/api';
import SchemesTableSkeleton from './SchemesTableSkeleton';
import './SchemesManagement.css';

const CATEGORIES = [
    'Subsidy', 'Loan', 'Insurance', 'Training', 'Equipment',
    'Irrigation', 'Organic Farming', 'Market Support', 'Land Development',
    'Weather Protection', 'Other'
];

const SchemesManagement = () => {
    const { admin, logout, isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingScheme, setEditingScheme] = useState(null);
    const [formData, setFormData] = useState({
        name: '', shortDescription: '', description: '', officialLink: '',
        category: 'Subsidy', ministry: '', eligibility: '', benefits: '',
        applicationProcess: '', documents: [], state: 'All India'
    });

    useEffect(() => {
        loadSchemes();
    }, [search, category, status]);

    const loadSchemes = async () => {
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;
        if (status !== 'all') params.status = status;

        const res = await schemesAPI.getAllAdmin(params);
        if (res.success) {
            setSchemes(res.data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { ...formData };
        if (typeof data.documents === 'string') {
            data.documents = data.documents.split(',').map(d => d.trim()).filter(Boolean);
        }

        let res;
        if (editingScheme) {
            res = await schemesAPI.update(editingScheme._id, data);
        } else {
            res = await schemesAPI.create(data);
        }

        if (res.success) {
            setShowModal(false);
            resetForm();
            loadSchemes();
        } else {
            alert(res.message || 'Operation failed');
        }
    };

    const handleEdit = (scheme) => {
        setEditingScheme(scheme);
        setFormData({
            name: scheme.name || '',
            shortDescription: scheme.shortDescription || '',
            description: scheme.description || '',
            officialLink: scheme.officialLink || '',
            category: scheme.category || 'Subsidy',
            ministry: scheme.ministry || '',
            eligibility: scheme.eligibility || '',
            benefits: scheme.benefits || '',
            applicationProcess: scheme.applicationProcess || '',
            documents: scheme.documents?.join(', ') || '',
            state: scheme.state || 'All India'
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this scheme?')) return;
        const res = await schemesAPI.delete(id);
        if (res.success) {
            loadSchemes();
        } else {
            alert(res.message || 'Delete failed');
        }
    };

    const handleToggle = async (id) => {
        const res = await schemesAPI.toggle(id);
        if (res.success) {
            loadSchemes();
        }
    };

    const resetForm = () => {
        setEditingScheme(null);
        setFormData({
            name: '', shortDescription: '', description: '', officialLink: '',
            category: 'Subsidy', ministry: '', eligibility: '', benefits: '',
            applicationProcess: '', documents: [], state: 'All India'
        });
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="schemes-management">
            <nav className="admin-nav">
                <div className="nav-brand">
                    <span className="brand-icon">🌾</span>
                    <span className="brand-text">Agro-chain Admin</span>
                </div>
                <div className="nav-links">
                    <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/admin/schemes" className="nav-link active">Schemes</Link>
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
                    <div>
                        <h1>Schemes Management</h1>
                        <p>Add, edit, or remove government schemes</p>
                    </div>
                    <button className="add-btn" onClick={() => { resetForm(); setShowModal(true); }}>
                        + Add New Scheme
                    </button>
                </div>

                <div className="filters-bar">
                    <input
                        type="text"
                        placeholder="Search schemes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                {loading ? (
                    <SchemesTableSkeleton />
                ) : (
                    <div className="schemes-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Ministry</th>
                                    <th>Status</th>
                                    <th>Views</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schemes.map(scheme => (
                                    <tr key={scheme._id}>
                                        <td className="scheme-name-cell">
                                            <span className="scheme-name">{scheme.name}</span>
                                            <span className="scheme-short">{scheme.shortDescription?.slice(0, 60)}...</span>
                                        </td>
                                        <td><span className="badge category">{scheme.category}</span></td>
                                        <td className="ministry-cell">{scheme.ministry}</td>
                                        <td>
                                            <span className={`badge status ${scheme.isActive ? 'active' : 'inactive'}`}>
                                                {scheme.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>{scheme.viewCount || 0}</td>
                                        <td className="actions-cell">
                                            <button onClick={() => handleToggle(scheme._id)} className="action-btn toggle">
                                                {scheme.isActive ? '⏸️' : '▶️'}
                                            </button>
                                            <button onClick={() => handleEdit(scheme)} className="action-btn edit">✏️</button>
                                            <button onClick={() => handleDelete(scheme._id)} className="action-btn delete">🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {schemes.length === 0 && (
                            <div className="no-data">No schemes found</div>
                        )}
                    </div>
                )}
            </main>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingScheme ? 'Edit Scheme' : 'Add New Scheme'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="scheme-form">
                            <div className="form-grid">
                                <div className="form-group full">
                                    <label>Scheme Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group full">
                                    <label>Short Description *</label>
                                    <input
                                        type="text"
                                        value={formData.shortDescription}
                                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                        maxLength={300}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Ministry *</label>
                                    <input
                                        type="text"
                                        value={formData.ministry}
                                        onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group full">
                                    <label>Official Link *</label>
                                    <input
                                        type="url"
                                        value={formData.officialLink}
                                        onChange={(e) => setFormData({ ...formData, officialLink: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group full">
                                    <label>Eligibility *</label>
                                    <textarea
                                        value={formData.eligibility}
                                        onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div className="form-group full">
                                    <label>Benefits *</label>
                                    <textarea
                                        value={formData.benefits}
                                        onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div className="form-group full">
                                    <label>Full Description *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={5}
                                        required
                                    />
                                </div>
                                <div className="form-group full">
                                    <label>Application Process</label>
                                    <textarea
                                        value={formData.applicationProcess}
                                        onChange={(e) => setFormData({ ...formData, applicationProcess: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Documents (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.documents}
                                        onChange={(e) => setFormData({ ...formData, documents: e.target.value })}
                                        placeholder="Aadhaar Card, Bank Details, Land Docs"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="submit-btn">
                                    {editingScheme ? 'Update Scheme' : 'Create Scheme'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchemesManagement;
