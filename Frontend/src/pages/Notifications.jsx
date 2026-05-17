import React, { useState, useEffect } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, X, ShieldAlert, TrendingUp, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NotificationShimmerList } from '../components/Shimmer';
import './Notifications.css';

const Notifications = () => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    // Load formatting tools
    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}${t('notifications.s')} ${t('notifications.ago')}`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}${t('notifications.m')} ${t('notifications.ago')}`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}${t('notifications.h')} ${t('notifications.ago')}`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return t('notifications.yesterday');
        return `${diffInDays}${t('notifications.d')} ${t('notifications.ago')}`;
    };

    // Fetch data from API on mount
    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchNotifications = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/notifications');
                if (!response.ok) throw new Error('Failed to fetch notifications');
                const data = await response.json();

                // Get closed notifications from LocalStorage
                const closedIds = JSON.parse(localStorage.getItem('closedNotifications') || '[]');

                // Filter out closed notifications (Server already filters out expired ones)
                const activeNotifs = data.filter(notif => !closedIds.includes(notif._id));

                setNotifications(activeNotifs);
            } catch (error) {
                console.error("Error loading notifications:", error);
                setIsLoading(false);
            } finally {
                // Ensure shimmer effect is visible for 0.5s
                setTimeout(() => {
                    setIsLoading(false);
                }, 500);
            }
        };

        fetchNotifications();
    }, []);

    const handleCloseNotification = (id) => {
        // Remove from current view
        setNotifications(prev => prev.filter(n => n._id !== id));

        // Save to LocalStorage so it stays dismissed on reload
        const closedIds = JSON.parse(localStorage.getItem('closedNotifications') || '[]');
        if (!closedIds.includes(id)) {
            closedIds.push(id);
            localStorage.setItem('closedNotifications', JSON.stringify(closedIds));
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'success': return <TrendingUp size={24} className="notif-icon success" />;
            case 'warning': return <AlertTriangle size={24} className="notif-icon warning" />;
            case 'error': return <ShieldAlert size={24} className="notif-icon error" />;
            case 'info':
            default: return <Info size={24} className="notif-icon info" />;
        }
    };

    // Filter Logic
    const filteredNotifications = notifications.filter(notif => {
        if (activeFilter === 'all') return true;
        return notif.type === activeFilter;
    });

    return (
        <div className="notifications-page">
            <div className="notifications-hero">
                <div className="notifications-header">
                    <h2>{t('notifications.title')}</h2>
                    <div className="header-subtitle-wrapper">
                        <Bell size={20} className="bell-icon animate-ring" />
                        <p>{t('notifications.subtitle')}</p>
                    </div>
                </div>

                <div className="filter-chips">
                    <button
                        className={`chip ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        {t('notifications.all')}
                    </button>
                    <button
                        className={`chip ${activeFilter === 'info' ? 'active alert-info' : ''}`}
                        onClick={() => setActiveFilter('info')}
                    >
                        {t('notifications.info')}
                    </button>
                    <button
                        className={`chip ${activeFilter === 'success' ? 'active alert-success' : ''}`}
                        onClick={() => setActiveFilter('success')}
                    >
                        {t('notifications.success')}
                    </button>
                    <button
                        className={`chip ${activeFilter === 'error' ? 'active alert-error' : ''}`}
                        onClick={() => setActiveFilter('error')}
                    >
                        {t('notifications.error')}
                    </button>
                </div>
            </div>

            <div className="notifications-container">
                {isLoading ? (
                    <NotificationShimmerList count={5} />
                ) : filteredNotifications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon-wrapper">
                            <CheckCircle size={48} />
                        </div>
                        <h3>{t('notifications.caughtUp')}</h3>
                        <p>{t('notifications.noNotifs')}</p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {filteredNotifications.map((notif) => (
                            <div className={`notification-card type-${notif.type}`} key={notif._id}>
                                <div className="notif-icon-container">
                                    {getTypeIcon(notif.type)}
                                </div>

                                <div className="notif-content">
                                    <div className="notif-header-row">
                                        <h3 className="notif-title">{notif.title}</h3>
                                        <span className="notif-time">
                                            {formatTimeAgo(notif.createdAt)}
                                        </span>
                                    </div>
                                    <p className="notif-message">{notif.message}</p>
                                </div>

                                <button
                                    className="close-btn"
                                    onClick={() => handleCloseNotification(notif._id)}
                                    title="Dismiss"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
