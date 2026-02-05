import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './DistributorDashboard.css';

const DistributorDashboard = () => {
    const { token, admin } = useAuth(); // 'admin' here refers to the user object (distributor is a type of admin in our db)
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [distribution, setDistribution] = useState({
        productId: '',
        farmerName: '',
        mobile: '',
        quantity: '',
        otp: ''
    });
    const [otpSent, setOtpSent] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/stock/my-city', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setStocks(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch stock', err);
        }
        setLoading(false);
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/distribution/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ mobile: distribution.mobile })
            });
            const data = await res.json();
            if (data.success) {
                alert(`OTP Sent! (Dev Mode: ${data.devOtp})`);
                setOtpSent(true);
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Failed to send OTP');
        }
    };

    const handleVerifyAndDistribute = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/distribution/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(distribution)
            });
            const data = await res.json();
            if (data.success) {
                alert('Distribution Recorded Successfully!');
                setDistribution({
                    productId: '',
                    farmerName: '',
                    mobile: '',
                    quantity: '',
                    otp: ''
                });
                setOtpSent(false);
                setShowForm(false);
                fetchStock(); // Refresh stock
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Distribution failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="distributor-dashboard">
            <header className="page-header">
                <div>
                    <h1>Distributor Dashboard</h1>
                    <p>City: {admin?.city} | User: {admin?.username}</p>
                </div>
                <button
                    className="primary-btn distribute-btn"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel Distribution' : 'New Distribution'}
                </button>
            </header>

            {showForm && (
                <div className="distribution-form-card">
                    <h3>Record New Distribution</h3>
                    <form onSubmit={otpSent ? handleVerifyAndDistribute : handleSendOTP}>
                        <div className="form-group">
                            <label>Select Product (Stock)</label>
                            <select
                                value={distribution.productId}
                                onChange={(e) => setDistribution({ ...distribution, productId: e.target.value })}
                                disabled={otpSent}
                                required
                            >
                                <option value="">-- Select Product --</option>
                                {stocks.map(s => (
                                    <option key={s._id} value={s.product._id} disabled={s.currentStock <= 0}>
                                        {s.product.name} ({s.currentStock} {s.product.unit} available)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-row">
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
                            <div className="form-group">
                                <label>Farmer Mobile</label>
                                <input
                                    type="tel"
                                    value={distribution.mobile}
                                    onChange={(e) => setDistribution({ ...distribution, mobile: e.target.value })}
                                    disabled={otpSent}
                                    required
                                    pattern="[0-9]{10}"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                type="number"
                                value={distribution.quantity}
                                onChange={(e) => setDistribution({ ...distribution, quantity: e.target.value })}
                                disabled={otpSent}
                                required
                            />
                        </div>

                        {!otpSent ? (
                            <button type="submit" className="primary-btn">Send OTP</button>
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
        </div>
    );
};

export default DistributorDashboard;
