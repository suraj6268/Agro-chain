import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { schemesAPI } from '../../services/api';
import { ShimmerGrid, AdminShimmer } from '../../components/Shimmer';
import { CheckCircle, MessageSquareWarning } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { admin, logout, isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`http://localhost:3000/api/complaints`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setComplaints(data.data);
        } catch (err) {
            console.error('Failed to fetch complaints', err);
        }
    };

    useEffect(() => {
        loadStats();
        fetchComplaints();
    }, []);

    const handleResolveComplaint = async (id) => {
        const note = prompt("Enter resolution details (optional):");
        if (note === null) return; // Cancelled

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`http://localhost:3000/api/complaints/${id}/resolve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ resolutionNote: note })
            });
            const data = await res.json();
            if (data.success) {
                alert('Complaint resolved successfully!');
                fetchComplaints();
            } else {
                alert(data.message || 'Failed to resolve complaint');
            }
        } catch {
            alert('Server error resolving complaint');
        }
    };


    return (
        <div className="admin-dashboard">


            <main className="admin-content">
                <div className="content-header">
                    <h1>Dashboard</h1>
                    <p>Welcome back, {admin?.username}!</p>
                </div>

                {loading ? (
                    <AdminShimmer />
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

                        {/* Complaints Section */}
                        <div className="section" style={{ marginTop: '2rem', gridColumn: '1 / -1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <MessageSquareWarning className="text-red-600" />
                                <h2 style={{ margin: 0 }}>Statewide Farmer Complaints</h2>
                            </div>

                            {complaints.length > 0 ? (
                                <div style={{ background: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #eee' }}>
                                                <th style={{ padding: '12px' }}>Date</th>
                                                <th style={{ padding: '12px' }}>Farmer Info</th>
                                                <th style={{ padding: '12px' }}>Type & Details</th>
                                                <th style={{ padding: '12px' }}>City</th>
                                                <th style={{ padding: '12px' }}>Status</th>
                                                <th style={{ padding: '12px' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {complaints.map((comp) => (
                                                <tr key={comp._id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '12px', color: '#666', fontSize: '0.85rem' }}>
                                                        {new Date(comp.createdAt).toLocaleDateString('en-IN')}
                                                        <br />
                                                        {new Date(comp.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{comp.farmerName}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>+91 {comp.mobile}</div>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{ fontWeight: '600', color: '#b91c1c', marginBottom: '4px' }}>{comp.type}</div>
                                                        <div style={{ fontSize: '0.9rem', color: '#475569', maxWidth: '300px', lineHeight: '1.4' }}>{comp.description}</div>
                                                    </td>
                                                    <td style={{ padding: '12px', fontWeight: '500', color: '#3b82f6' }}>
                                                        {comp.city}
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{
                                                            padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600',
                                                            background: comp.status === 'Open' ? '#fee2e2' : '#dcfce7',
                                                            color: comp.status === 'Open' ? '#ef4444' : '#10b981'
                                                        }}>
                                                            {comp.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        {comp.status === 'Open' && (
                                                            <button
                                                                onClick={() => handleResolveComplaint(comp._id)}
                                                                style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', transition: 'background 0.2s' }}
                                                                onMouseOver={(e) => e.target.style.background = '#059669'}
                                                                onMouseOut={(e) => e.target.style.background = '#10b981'}
                                                            >
                                                                <CheckCircle size={16} /> Mark Resolved
                                                            </button>
                                                        )}
                                                        {comp.status === 'Resolved' && (
                                                            <div style={{ fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', padding: '8px', borderRadius: '4px' }}>
                                                                <strong>Note:</strong> {comp.resolutionNote}
                                                                {comp.resolvedBy && <div style={{ marginTop: '4px', fontSize: '0.75rem' }}>By: {comp.resolvedBy.name || 'Admin'}</div>}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                                    <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No Complaints Found</h3>
                                    <p style={{ margin: 0 }}>There are currently no active grievances reported across the state.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
