import React from 'react';
import './Shimmer.css';

const ShimmerCard = () => {
    return (
        <div className="shimmer-card">
            <div className="shimmer-image"></div>
            <div className="shimmer-content">
                <div className="shimmer-title"></div>
                <div className="shimmer-line"></div>
                <div className="shimmer-line short"></div>
                <div className="shimmer-tags">
                    <div className="shimmer-tag"></div>
                    <div className="shimmer-tag"></div>
                </div>
            </div>
        </div>
    );
};

export const ShimmerGrid = ({ count = 6 }) => {
    return (
        <div className="shimmer-grid">
            {Array(count).fill(0).map((_, index) => (
                <ShimmerCard key={index} />
            ))}
        </div>
    );
};

export const ShimmerTable = ({ rows = 5 }) => {
    return (
        <div className="shimmer-table">
            <div className="shimmer-header"></div>
            {Array(rows).fill(0).map((_, index) => (
                <div key={index} className="shimmer-row"></div>
            ))}
        </div>
    );
};

export const AdminShimmer = () => {
    return (
        <div className="admin-shimmer">
            {/* Stats Grid - 4 cards */}
            <div className="shimmer-stats-grid">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="shimmer-stat-card">
                        <div className="shimmer-icon-circle"></div>
                        <div className="shimmer-stat-text">
                            <div className="shimmer-line short"></div>
                            <div className="shimmer-line medium"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sections Grid - 3 cols */}
            <div className="shimmer-sections-grid">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="shimmer-section-panel">
                        <div className="shimmer-header"></div>
                        <div className="shimmer-list">
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="shimmer-list-item"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="shimmer-quick-actions">
                <div className="shimmer-header"></div>
                <div className="shimmer-buttons">
                    <div className="shimmer-btn"></div>
                </div>
            </div>
        </div>
    );
};

export const DetailShimmer = () => {
    return (
        <div className="detail-shimmer">
            {/* Hero Section */}
            <div className="shimmer-hero">
                <div className="shimmer-back-link"></div>
                <div className="shimmer-badge"></div>
                <div className="shimmer-title-large"></div>
                <div className="shimmer-subtitle"></div>
                <div className="shimmer-meta-row">
                    <div className="shimmer-meta-item"></div>
                    <div className="shimmer-meta-item"></div>
                    <div className="shimmer-meta-item"></div>
                </div>
            </div>

            <div className="detail-shimmer-container">
                {/* Main Content */}
                <div className="detail-shimmer-main">
                    <div className="shimmer-section">
                        <div className="shimmer-header"></div>
                        <div className="shimmer-rect-large"></div>
                    </div>
                    <div className="shimmer-section">
                        <div className="shimmer-header"></div>
                        <div className="shimmer-lines-block">
                            <div className="shimmer-line"></div>
                            <div className="shimmer-line"></div>
                            <div className="shimmer-line"></div>
                            <div className="shimmer-line short"></div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="detail-shimmer-sidebar">
                    <div className="shimmer-card-small"></div>
                    <div className="shimmer-card-small"></div>
                    <div className="shimmer-card-small"></div>
                </div>
            </div>
        </div>
    );
};

export const NotificationShimmerList = ({ count = 3 }) => {
    return (
        <div className="notifications-list shimmer-notification-list">
            {Array(count).fill(0).map((_, index) => (
                <div key={index} className="notification-card shimmer-notif-card" style={{ cursor: 'default' }}>
                    <div className="notif-icon-container" style={{ background: 'transparent' }}>
                        <div className="shimmer-icon-circle" style={{ width: '40px', height: '40px' }}></div>
                    </div>

                    <div className="notif-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                        <div className="notif-header-row">
                            <div className="shimmer-title" style={{ width: '40%', height: '20px', margin: 0 }}></div>
                            <div className="shimmer-line" style={{ width: '80px', height: '16px' }}></div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div className="shimmer-line" style={{ height: '14px', width: '95%' }}></div>
                            <div className="shimmer-line" style={{ height: '14px', width: '75%' }}></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
