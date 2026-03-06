import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Plus, Trash2, Calendar, AlertTriangle, ShieldAlert, TrendingUp, Info, Send } from 'lucide-react';
import './InventoryManagement.css';
import './NotificationsManagement.css';

const NotificationsManagement = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'info',
        message: '',
        daysActive: 7
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:3000/api/notifications');
            if (!response.ok) throw new Error('Failed to fetch notifications');

            const data = await response.json();
            setNotifications(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNotification = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:3000/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to create notification');

            const result = await response.json();

            // Add new notification to list and reset form
            setNotifications([result.notification, ...notifications]);
            setShowForm(false);
            setFormData({ title: '', type: 'info', message: '', daysActive: 7 });

        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteNotification = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notification early?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:3000/api/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete notification');

            // Remove from local state
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'success': return <TrendingUp size={18} className="text-green-600" />;
            case 'warning': return <AlertTriangle size={18} className="text-orange-600" />;
            case 'error': return <ShieldAlert size={18} className="text-red-600" />;
            case 'info':
            default: return <Info size={18} className="text-blue-600" />;
        }
    };

    const getDaysRemaining = (expiresAt) => {
        const diff = new Date(expiresAt) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? `${days} days` : 'Expired';
    };

    return (
        <div className="notifications-management-admin">
            <div className="admin-header">
                <div>
                    <h2>Notifications Center</h2>
                    <p>Create and manage alerts sent to farmers and distributors.</p>
                </div>
                <button
                    className={`add-notification-btn ${showForm ? 'cancel' : ''}`}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? <Trash2 size={20} /> : <Plus size={20} />}
                    {showForm ? 'Cancel Creation' : 'New Notification'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showForm && (
                <div className="premium-form-container">
                    <h3><Bell className="text-blue-600" /> Create New Broadcast Alert</h3>
                    <form onSubmit={handleCreateNotification}>
                        <div className="form-grid">
                            <div className="input-group full-width">
                                <label>Notification Title</label>
                                <input
                                    type="text"
                                    className="premium-input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="e.g. PM Kisan Installment Released (Max 60 chars)"
                                    maxLength="60"
                                />
                            </div>

                            <div className="input-group full-width">
                                <label>Alert Priority / Category</label>
                                <div className="type-preview-cards">
                                    <div
                                        className={`type-card info ${formData.type === 'info' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, type: 'info' })}
                                    >
                                        <Info size={16} /> Info
                                    </div>
                                    <div
                                        className={`type-card success ${formData.type === 'success' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, type: 'success' })}
                                    >
                                        <TrendingUp size={16} /> Market
                                    </div>
                                    <div
                                        className={`type-card warning ${formData.type === 'warning' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, type: 'warning' })}
                                    >
                                        <AlertTriangle size={16} /> Weather
                                    </div>
                                    <div
                                        className={`type-card error ${formData.type === 'error' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, type: 'error' })}
                                    >
                                        <ShieldAlert size={16} /> System
                                    </div>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Days to remain active on user dashboards</label>
                                <input
                                    type="number"
                                    className="premium-input"
                                    min="1"
                                    max="30"
                                    value={formData.daysActive}
                                    onChange={(e) => setFormData({ ...formData, daysActive: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group full-width">
                                <label>Detailed Message Content</label>
                                <textarea
                                    className="premium-textarea"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                    placeholder="Provide full details for the farmers and distributors here..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="publish-btn-container">
                            <button type="submit" className="publish-btn">
                                <Send size={18} /> Publish Broadcast
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-card">
                <h3>Active Notifications</h3>
                {isLoading ? (
                    <div className="loading-spinner">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">No active notifications found.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Title</th>
                                    <th>Message Preview</th>
                                    <th>Time Remaining</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notifications.map((notif) => (
                                    <tr key={notif._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {getTypeIcon(notif.type)}
                                                <span style={{ textTransform: 'capitalize' }}>{notif.type}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: '600' }}>{notif.title}</td>
                                        <td>
                                            <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {notif.message}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                                                <Calendar size={14} />
                                                {getDaysRemaining(notif.expiresAt)}
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDeleteNotification(notif._id)}
                                                title="Delete Notification"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsManagement;
