import React from 'react';
import Skeleton from './Skeleton';
import './SchemeCard.css';

const SchemeCardSkeleton = () => {
    return (
        <div className="scheme-card" style={{ height: 'auto', minHeight: '300px' }}>
            <div className="scheme-card-header">
                <Skeleton type="text" style={{ width: '80px', height: '24px', borderRadius: '20px' }} />
                <Skeleton type="text" style={{ width: '60px', height: '20px', borderRadius: '12px' }} />
            </div>

            <Skeleton type="title" style={{ width: '90%', height: '28px', marginBottom: '16px' }} />

            <Skeleton type="text" style={{ width: '100%', marginBottom: '8px' }} />
            <Skeleton type="text" style={{ width: '95%', marginBottom: '8px' }} />
            <Skeleton type="text" style={{ width: '60%', marginBottom: '24px' }} />

            <div className="scheme-benefits" style={{ background: 'transparent', padding: 0 }}>
                <Skeleton type="rect" style={{ width: '100%', height: '48px', borderRadius: '12px' }} />
            </div>

            <div className="scheme-actions" style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <Skeleton type="rect" style={{ flex: 1, height: '46px', borderRadius: '12px' }} />
                <Skeleton type="rect" style={{ flex: 1, height: '46px', borderRadius: '12px' }} />
            </div>
        </div>
    );
};

export default SchemeCardSkeleton;
