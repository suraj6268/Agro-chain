import React from 'react';
import Skeleton from './Skeleton';
import '../pages/SchemeDetailPage.css'; // Importing styles from the page to reuse grid layout

const SchemeDetailSkeleton = () => {
    return (
        <div className="scheme-detail-page">
            <div className="detail-hero" style={{ minHeight: '400px' }}>
                <div className="hero-content">
                    <Skeleton type="text" style={{ width: '150px', marginBottom: '20px', background: 'rgba(255,255,255,0.2)' }} />
                    <Skeleton type="text" style={{ width: '100px', height: '24px', borderRadius: '20px', marginBottom: '20px', background: 'rgba(255,255,255,0.2)' }} />
                    <Skeleton type="title" style={{ width: '70%', height: '56px', marginBottom: '20px', background: 'rgba(255,255,255,0.3)' }} />
                    <Skeleton type="text" style={{ width: '50%', height: '24px', marginBottom: '30px', background: 'rgba(255,255,255,0.2)' }} />

                    <div className="hero-meta" style={{ display: 'flex', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Skeleton type="text" style={{ width: '80px', height: '16px', background: 'rgba(255,255,255,0.2)' }} />
                            <Skeleton type="text" style={{ width: '100px', height: '20px', background: 'rgba(255,255,255,0.2)' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Skeleton type="text" style={{ width: '80px', height: '16px', background: 'rgba(255,255,255,0.2)' }} />
                            <Skeleton type="text" style={{ width: '100px', height: '20px', background: 'rgba(255,255,255,0.2)' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Skeleton type="text" style={{ width: '80px', height: '16px', background: 'rgba(255,255,255,0.2)' }} />
                            <Skeleton type="text" style={{ width: '100px', height: '20px', background: 'rgba(255,255,255,0.2)' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="detail-container">
                <div className="detail-main">
                    <section className="detail-section">
                        <Skeleton type="title" style={{ width: '200px', marginBottom: '20px' }} />
                        <Skeleton type="rect" style={{ width: '100%', height: '80px', borderRadius: '12px' }} />
                    </section>

                    <section className="detail-section">
                        <Skeleton type="title" style={{ width: '250px', marginBottom: '20px' }} />
                        <Skeleton type="text" style={{ width: '100%', marginBottom: '8px' }} />
                        <Skeleton type="text" style={{ width: '100%', marginBottom: '8px' }} />
                        <Skeleton type="text" style={{ width: '90%', marginBottom: '8px' }} />
                        <Skeleton type="text" style={{ width: '95%', marginBottom: '8px' }} />
                    </section>
                </div>

                <aside className="detail-sidebar">
                    <div className="sidebar-card">
                        <Skeleton type="title" style={{ width: '120px', height: '24px', marginBottom: '16px' }} />
                        <Skeleton type="text" style={{ width: '100%', height: '60px' }} />
                    </div>

                    <div className="sidebar-card">
                        <Skeleton type="title" style={{ width: '120px', height: '24px', marginBottom: '16px' }} />
                        <Skeleton type="text" style={{ width: '100%', height: '60px' }} />
                    </div>

                    <div className="sidebar-card action-card">
                        <Skeleton type="title" style={{ width: '120px', height: '24px', marginBottom: '16px' }} />
                        <Skeleton type="rect" style={{ width: '100%', height: '48px', borderRadius: '8px' }} />
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default SchemeDetailSkeleton;
