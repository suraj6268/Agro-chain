import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminShimmer } from '../../components/Shimmer';
import { Bell, Plus, Calendar, Trash2, MessageSquareWarning, CheckCircle } from 'lucide-react';
import './DistributorDashboard.css';

const DistributorDashboard = () => {
    const { admin, logout } = useAuth(); // 'admin' here refers to the user object (distributor is a type of admin in our db)
    const token = localStorage.getItem('adminToken');
    const navigate = useNavigate();
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [distribution, setDistribution] = useState({
        farmerId: '',
        farmerName: '',
        mobile: '',
        village: '',
        city: admin?.city || '',
        otp: ''
    });
    // Array of { productId, quantity, maxQuantity, productName, unit }
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [otpSent, setOtpSent] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [showNotifForm, setShowNotifForm] = useState(false);
    const [notifData, setNotifData] = useState({
        title: '',
        message: '',
        daysActive: 7
    });

    // History State
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [historySearchTerm, setHistorySearchTerm] = useState('');

    // Complaints State
    const [complaints, setComplaints] = useState([]);

    useEffect(() => {
        fetchStock();
        fetchNotifications();
        fetchHistory();
        if (admin?.city) {
            fetchComplaints();
        }
    }, [admin?.city]);

    const fetchStock = async () => {
        try {
            const [res] = await Promise.all([
                fetch('http://localhost:3000/api/stock/my-city', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true'
                    }
                }),
                new Promise(resolve => setTimeout(resolve, 1000)) // Enforce 1 second minimum shimmer
            ]);

            const data = await res.json();
            if (data.success) {
                setStocks(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch stock', err);
        }
        setLoading(false);
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/distribution/my-history', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            const data = await res.json();
            if (data.success) {
                setHistory(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch history', err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                // We only want to display 'distribution_date' notifications created by this distributor,
                // or just all active ones if that's the intention, but currently they only have access to delete their own.
                // For simplicity, we filter by type 'distribution_date'
                setNotifications(data.filter(n => n.type === 'distribution_date'));
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    const fetchComplaints = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/complaints?city=${admin.city}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setComplaints(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch complaints', err);
        }
    };

    const handleResolveComplaint = async (id) => {
        const note = prompt("Enter resolution details (optional):");
        if (note === null) return; // Cancelled

        try {
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
            alert('Error updating complaint');
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/distribution/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ mobile: distribution.mobile })
            });
            const data = await res.json();
            if (data.success) {
                if (selectedProducts.length === 0) {
                    alert('Please select at least one product to distribute.');
                    return;
                }
                alert(`OTP Sent! (Dev Mode: ${data.devOtp})`);
                setOtpSent(true);
            } else {
                alert(data.message);
            }
        } catch {
            alert('Failed to process distribution');
        }
    };

    const handleVerifyAndDistribute = async (e) => {
        e.preventDefault();

        // Filter out any products where quantity is 0 or empty
        const finalDistributions = selectedProducts
            .filter(item => item.quantity && Number(item.quantity) > 0)
            .map(item => ({
                productId: item.productId,
                quantity: Number(item.quantity)
            }));

        if (finalDistributions.length === 0) {
            alert("No valid product quantities entered.");
            return;
        }

        try {
            const payload = {
                ...distribution,
                distributions: finalDistributions
            };

            const res = await fetch('http://localhost:3000/api/distribution/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                alert('Distribution Recorded Successfully!');
                // Reset form
                setDistribution({
                    farmerId: '',
                    farmerName: '',
                    mobile: '',
                    village: '',
                    city: admin?.city || '',
                    otp: ''
                });
                setSelectedProducts([]);
                setOtpSent(false);
                setShowForm(false);
                fetchStock(); // Refresh stock
                fetchHistory(); // Refresh history
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Distribution failed');
        }
    };

    const handleCreateNotification = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: notifData.title,
                type: 'distribution_date', // Hardcoded for distributors
                message: notifData.message,
                daysActive: notifData.daysActive
            };

            const response = await fetch('http://localhost:3000/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to create notification');

            alert('Distribution Date published successfully!');
            setShowNotifForm(false);
            setNotifData({ title: '', message: '', daysActive: 7 });
            fetchNotifications();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteNotification = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) return;
        try {
            const response = await fetch(`http://localhost:3000/api/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete notification');

            fetchNotifications();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const handleQuantityChange = (productId, value, maxStock) => {
        const val = Number(value);
        if (val > maxStock) return;

        const existing = selectedProducts.find(p => p.productId === productId);
        if (existing) {
            setSelectedProducts(selectedProducts.map(p =>
                p.productId === productId ? { ...p, quantity: val } : p
            ));
        } else {
            setSelectedProducts([...selectedProducts, { productId, quantity: val }]);
        }
    };

    if (loading) return <AdminShimmer />;

    return (
        <div className="distributor-dashboard">
            <header className="page-header">
                <div>
                    <h1>Distributor Dashboard</h1>
                    <p>City: {admin?.city} | User: {admin?.username}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="primary-btn distribute-btn"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancel Distribution' : 'New Distribution'}
                    </button>
                    <button
                        className="primary-btn distribute-btn"
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        {showHistory ? 'Hide History' : 'Distribution History'}
                    </button>
                    <button
                        className="primary-btn distribute-btn"
                        onClick={handleLogout}
                        style={{ background: '#ef4444' }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {showHistory && (
                <div className="history-section" style={{ marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#1f2937' }}>
                            <Calendar size={24} className="text-blue-600" /> Distribution History
                        </h2>
                        <input
                            type="text"
                            placeholder="Search by Farmer ID..."
                            value={historySearchTerm}
                            onChange={(e) => setHistorySearchTerm(e.target.value)}
                            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', width: '250px' }}
                        />
                    </div>
                    {(() => {
                        const filteredHistory = history.filter(record =>
                            record.farmerId && record.farmerId.toLowerCase().includes(historySearchTerm.toLowerCase())
                        );

                        if (history.length === 0) {
                            return <p style={{ color: '#6b7280' }}>No distributions recorded yet.</p>;
                        }

                        if (filteredHistory.length === 0) {
                            return <p style={{ color: '#6b7280' }}>No distributions found for the given Farmer ID.</p>;
                        }

                        return (
                            <div className="table-responsive">
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                            <th style={{ padding: '12px 16px', color: '#4b5563', fontWeight: '600' }}>Date</th>
                                            <th style={{ padding: '12px 16px', color: '#4b5563', fontWeight: '600' }}>Farmer</th>
                                            <th style={{ padding: '12px 16px', color: '#4b5563', fontWeight: '600' }}>Product</th>
                                            <th style={{ padding: '12px 16px', color: '#4b5563', fontWeight: '600' }}>Quantity</th>
                                            <th style={{ padding: '12px 16px', color: '#4b5563', fontWeight: '600' }}>Village</th>
                                            <th style={{ padding: '12px 16px', color: '#4b5563', fontWeight: '600' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredHistory.map((record) => (
                                            <tr key={record._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <td style={{ padding: '12px 16px', color: '#374151' }}>
                                                    {new Date(record.createdAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '12px 16px', color: '#374151' }}>
                                                    <div style={{ fontWeight: '500' }}>{record.farmerName}</div>
                                                    <div style={{ fontSize: '0.85em', color: '#6b7280' }}>{record.farmerId}</div>
                                                </td>
                                                <td style={{ padding: '12px 16px', color: '#374151' }}>
                                                    {record.product?.name || 'Unknown Item'}
                                                </td>
                                                <td style={{ padding: '12px 16px', color: '#374151', fontWeight: '500' }}>
                                                    {record.quantity} {record.product?.unit || ''}
                                                </td>
                                                <td style={{ padding: '12px 16px', color: '#374151' }}>
                                                    {record.village || 'N/A'}
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '9999px',
                                                        fontSize: '0.85em',
                                                        fontWeight: '600',
                                                        background: record.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                                                        color: record.status === 'Completed' ? '#166534' : '#92400e'
                                                    }}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })()}
                </div>
            )}

            {showForm && (
                <div className="distribution-form-card">
                    <h3>Record New Distribution</h3>
                    <form onSubmit={otpSent ? handleVerifyAndDistribute : handleSendOTP}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Farmer ID (Aadhaar / Kisaan ID)</label>
                                <input
                                    type="text"
                                    value={distribution.farmerId}
                                    onChange={(e) => setDistribution({ ...distribution, farmerId: e.target.value })}
                                    disabled={otpSent}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Farmer Name</label>
                                <input
                                    type="text"
                                    value={distribution.farmerName}
                                    onChange={(e) => setDistribution({ ...distribution, farmerName: e.target.value })}
                                    disabled={otpSent}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <input
                                    type="tel"
                                    value={distribution.mobile}
                                    onChange={(e) => setDistribution({ ...distribution, mobile: e.target.value })}
                                    disabled={otpSent}
                                    required
                                    pattern="[0-9]{10}"
                                />
                            </div>
                            <div className="form-group">
                                <label>Village</label>
                                <input
                                    type="text"
                                    value={distribution.village}
                                    onChange={(e) => setDistribution({ ...distribution, village: e.target.value })}
                                    disabled={otpSent}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    value={distribution.city}
                                    disabled
                                    className="disabled-input"
                                />
                            </div>
                        </div>

                        <div className="form-group stock-selection-group">
                            <label>Allocate Products</label>
                            <p className="help-text" style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>Enter the quantity for each product you wish to distribute.</p>

                            {stocks.length === 0 ? (
                                <p style={{ color: 'red' }}>No stock available for distribution.</p>
                            ) : (
                                <div className="products-grid" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                                    {stocks.map(s => {
                                        const selected = selectedProducts.find(p => p.productId === s.product._id);
                                        const currentVal = selected ? selected.quantity : '';

                                        return (
                                            <div key={s._id} className="product-input-card" style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: s.currentStock <= 0 ? '#f5f5f5' : 'white' }}>
                                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{s.product.name} ({s.product.brand})</div>
                                                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>Available: {s.currentStock} {s.product.unit}</div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={s.currentStock}
                                                    value={currentVal}
                                                    onChange={(e) => handleQuantityChange(s.product._id, e.target.value, s.currentStock)}
                                                    disabled={otpSent || s.currentStock <= 0}
                                                    placeholder="Qty"
                                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            {!otpSent ? (
                                <button type="submit" className="primary-btn" disabled={stocks.length === 0}>Send OTP</button>
                            ) : (
                                <div className="otp-verification-section">
                                    <div className="form-group">
                                        <label>Enter OTP</label>
                                        <input
                                            type="text"
                                            value={distribution.otp}
                                            onChange={(e) => setDistribution({ ...distribution, otp: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="primary-btn success-btn">Verify & Distribute</button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            )}

            <div className="stock-grid">
                {stocks.length === 0 ? <p>No stock allocated to your city yet.</p> : null}
                {stocks.map(stock => (
                    <div key={stock._id} className="stock-card">
                        <h3>{stock.product.name}</h3>
                        <p className="brand">{stock.product.brand}</p>
                        <div className="stock-level">
                            <span className="label">Available Stock:</span>
                            <span className={`value ${stock.currentStock < 10 ? 'low' : ''}`}>
                                {stock.currentStock} {stock.product.unit}
                            </span>
                        </div>
                        <div className="stat-row">
                            <div>Allocated: {stock.totalAllocated}</div>
                            <div>Distributed: {stock.distributed}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="notifications-section" style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Bell className="text-blue-600" />
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Distribution Notifications</h2>
                    </div>
                    <button
                        className="primary-btn distribute-btn"
                        onClick={() => setShowNotifForm(!showNotifForm)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {showNotifForm ? 'Cancel Creation' : <><Plus size={16} /> Publish Distribution Date</>}
                    </button>
                </div>

                {showNotifForm && (
                    <div className="distribution-form-card" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Publish New Date</h3>
                        <form onSubmit={handleCreateNotification}>
                            <div className="form-group">
                                <label>Notification Title</label>
                                <input
                                    type="text"
                                    value={notifData.title}
                                    onChange={(e) => setNotifData({ ...notifData, title: e.target.value })}
                                    required
                                    placeholder="e.g. Seed Distribution on 15th March"
                                    maxLength="60"
                                />
                            </div>
                            <div className="form-group">
                                <label>Days to display</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={notifData.daysActive}
                                    onChange={(e) => setNotifData({ ...notifData, daysActive: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Message Details</label>
                                <textarea
                                    value={notifData.message}
                                    onChange={(e) => setNotifData({ ...notifData, message: e.target.value })}
                                    required
                                    placeholder="Location, timings, and required documents..."
                                    style={{ width: '100%', padding: '10px', minHeight: '100px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <button type="submit" className="primary-btn">Publish Notification</button>
                        </form>
                    </div>
                )}

                {notifications.length > 0 ? (
                    <div className="table-responsive" style={{ background: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                    <th style={{ padding: '10px' }}>Title</th>
                                    <th style={{ padding: '10px' }}>Message Details</th>
                                    <th style={{ padding: '10px' }}>Expires In</th>
                                    <th style={{ padding: '10px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notifications.map((notif) => {
                                    const days = Math.ceil((new Date(notif.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <tr key={notif._id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{notif.title}</td>
                                            <td style={{ padding: '10px' }}>{notif.message}</td>
                                            <td style={{ padding: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666' }}>
                                                    <Calendar size={14} />
                                                    {days > 0 ? `${days} days` : 'Expired'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px' }}>
                                                {notif.createdBy && (admin?._id || admin?.id) && String(notif.createdBy) === String(admin._id || admin.id) && (
                                                    <button
                                                        onClick={() => handleDeleteNotification(notif._id)}
                                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                                        title="Delete Notification"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ color: '#666' }}>You have no active distribution notifications.</p>
                )}
            </div>

            {/* Complaints Section */}
            <div className="notifications-section" style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquareWarning className="text-red-600" />
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Farmer Complaints</h2>
                    </div>
                </div>

                {complaints.length > 0 ? (
                    <div className="table-responsive" style={{ background: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                    <th style={{ padding: '10px' }}>Date</th>
                                    <th style={{ padding: '10px' }}>Farmer Info</th>
                                    <th style={{ padding: '10px' }}>Type & Details</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                    <th style={{ padding: '10px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map((comp) => (
                                    <tr key={comp._id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px', fontSize: '0.9rem', color: '#666' }}>
                                            {new Date(comp.createdAt).toLocaleDateString('en-IN')}
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <div style={{ fontWeight: '600' }}>{comp.farmerName}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>+91 {comp.mobile}</div>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <div style={{ fontWeight: '500', color: '#b91c1c' }}>{comp.type}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#444' }}>{comp.description}</div>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                                background: comp.status === 'Open' ? '#fee2e2' : '#dcfce7',
                                                color: comp.status === 'Open' ? '#ef4444' : '#10b981'
                                            }}>
                                                {comp.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            {comp.status === 'Open' && (
                                                <button
                                                    onClick={() => handleResolveComplaint(comp._id)}
                                                    style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                                                >
                                                    <CheckCircle size={14} /> Resolve
                                                </button>
                                            )}
                                            {comp.status === 'Resolved' && (
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    {comp.resolutionNote}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ background: 'white', padding: '2rem', textAlign: 'center', borderRadius: '8px', border: '1px dashed #ccc', color: '#666' }}>
                        No complaints reported in your operational area. Keep up the good work!
                    </div>
                )}
            </div>

        </div>
    );
};

export default DistributorDashboard;
