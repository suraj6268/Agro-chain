import React from 'react';
import Skeleton from '../../components/Skeleton';
import './SuperAdmin.css';

const AdminsGridSkeleton = () => {
    return (
        <div className="admins-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="admin-card">
                    <Skeleton type="rect" style={{ width: '64px', height: '64px', borderRadius: '50%', marginBottom: '16px' }} />

                    <div className="admin-info" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Skeleton type="title" style={{ width: '60%', height: '24px', marginBottom: '8px' }} />
                        <Skeleton type="text" style={{ width: '80%', height: '16px', marginBottom: '16px' }} />

                        <div className="admin-meta" style={{ width: '100%', justifyContent: 'center', gap: '8px', display: 'flex' }}>
                            <Skeleton type="rect" style={{ width: '60px', height: '24px', borderRadius: '12px' }} />
                            <Skeleton type="rect" style={{ width: '60px', height: '24px', borderRadius: '12px' }} />
                        </div>

                        <Skeleton type="text" style={{ width: '50%', height: '14px', marginTop: '16px' }} />
                    </div>

                    <div className="admin-actions" style={{ width: '100%', marginTop: 'auto', paddingTop: '16px' }}>
                        <Skeleton type="rect" style={{ flex: 1, height: '36px', borderRadius: '8px' }} />
                        <Skeleton type="rect" style={{ flex: 1, height: '36px', borderRadius: '8px' }} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminsGridSkeleton;
