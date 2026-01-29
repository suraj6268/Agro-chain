import React from 'react';
import Skeleton from '../../components/Skeleton';
import './AdminDashboard.css';

const AdminDashboardSkeleton = () => {
    return (
        <div className="admin-dashboard">
            <nav className="admin-nav">
                <div className="nav-brand">
                    <span style={{ fontSize: '24px' }}>🌾</span>
                    <span className="brand-text">Agro-chain Admin</span>
                </div>
                <div className="nav-links">
                    <Skeleton type="text" style={{ width: '80px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />
                    <Skeleton type="text" style={{ width: '80px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />
                </div>
                <div className="nav-user">
                    <Skeleton type="text" style={{ width: '120px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />
                </div>
            </nav>

            <main className="admin-content">
                <div className="content-header">
                    <Skeleton type="title" style={{ width: '200px', marginBottom: '8px' }} />
                    <Skeleton type="text" style={{ width: '300px' }} />
                </div>

                <div className="stats-grid">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="stat-card">
                            <Skeleton type="rect" style={{ width: '48px', height: '48px', borderRadius: '12px', marginBottom: '16px' }} />
                            <Skeleton type="text" style={{ width: '40px', height: '32px', marginBottom: '4px' }} />
                            <Skeleton type="text" style={{ width: '100px', height: '14px' }} />
                        </div>
                    ))}
                </div>

                <div className="dashboard-sections">
                    <div className="section">
                        <Skeleton type="title" style={{ width: '200px', marginBottom: '20px' }} />
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="category-item" style={{ justifyContent: 'space-between', display: 'flex' }}>
                                <Skeleton type="text" style={{ width: '60%' }} />
                                <Skeleton type="text" style={{ width: '10%' }} />
                            </div>
                        ))}
                    </div>

                    <div className="section">
                        <Skeleton type="title" style={{ width: '150px', marginBottom: '20px' }} />
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="scheme-item">
                                <Skeleton type="text" style={{ width: '70%' }} />
                                <Skeleton type="text" style={{ width: '20%' }} />
                            </div>
                        ))}
                    </div>

                    <div className="section">
                        <Skeleton type="title" style={{ width: '180px', marginBottom: '20px' }} />
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="scheme-item">
                                <Skeleton type="text" style={{ width: '60%' }} />
                                <Skeleton type="text" style={{ width: '30%' }} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="quick-actions">
                    <Skeleton type="title" style={{ width: '150px', marginBottom: '20px' }} />
                    <div className="action-buttons">
                        <Skeleton type="rect" style={{ width: '100%', height: '48px', borderRadius: '12px' }} />
                        <Skeleton type="rect" style={{ width: '100%', height: '48px', borderRadius: '12px' }} />
                        <Skeleton type="rect" style={{ width: '100%', height: '48px', borderRadius: '12px' }} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardSkeleton;
