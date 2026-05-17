import React, { useState, useEffect } from 'react';
import { Search, MapPin, Package, Users, Activity, ExternalLink, Filter, Clock, X, MessageSquareWarning } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './DistributionPage.css';

const MP_CITIES = [
    'Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain',
    'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa',
    'Murwara', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena',
    'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha',
    'Chhatarpur', 'Damoh', 'Mandsaur', 'Khargone', 'Neemuch'
].sort();

const DistributionPage = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({ totalQuantity: 0, citiesWithStock: 0, uniqueFarmers: 0, totalComplaints: 0, activeCitiesList: [] });
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showCitiesModal, setShowCitiesModal] = useState(false);

    // Complaint State
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [complaintStep, setComplaintStep] = useState(1);
    const [complaintForm, setComplaintForm] = useState({
        farmerName: '',
        farmerId: '',
        mobile: '',
        type: 'Under-distribution',
        description: '',
        city: '',
        otp: ''
    });
    const [complaintLoading, setComplaintLoading] = useState(false);
    const [complaintError, setComplaintError] = useState('');
    const [complaintSuccess, setComplaintSuccess] = useState('');
    const [hasActiveComplaint, setHasActiveComplaint] = useState(false);
    const [activeComplaintStatus, setActiveComplaintStatus] = useState(null);

    // New Filters
    const [filterCity, setFilterCity] = useState('');
    const [filterVillage, setFilterVillage] = useState('');
    const [cities, setCities] = useState([]);

    // New City Allocation State
    const [cityAllocations, setCityAllocations] = useState([]);
    const [loadingAllocations, setLoadingAllocations] = useState(false);
    const [hasSearchedAllocations, setHasSearchedAllocations] = useState(false);

    // Allocation Search Filters
    const [allocFilterCity, setAllocFilterCity] = useState('');

    // Public Complaints Viewer State
    const [showPublicComplaintsModal, setShowPublicComplaintsModal] = useState(false);
    const [publicComplaints, setPublicComplaints] = useState([]);
    const [publicComplaintsLoading, setPublicComplaintsLoading] = useState(false);
    const [publicComplaintsCity, setPublicComplaintsCity] = useState('');

    // Trigger Allocation Fetch on City Change
    useEffect(() => {
        if (allocFilterCity) {
            fetchCityAllocations();
        } else {
            setHasSearchedAllocations(false);
            setCityAllocations([]);
        }
    }, [allocFilterCity]);

    // Initial Load - Fetch Stats, Ledger, and Cities
    useEffect(() => {
        window.scrollTo(0, 0);
        fetchStats();
        fetchLedger();
        fetchCities();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/distribution/public/stats');
            const result = await res.json();
            if (result.success) setStats(result.data);
        } catch (err) {
            console.error('Failed to fetch public stats:', err);
        }
    };

    const fetchCities = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/distribution/public/cities');
            const result = await res.json();
            if (result.success) setCities(result.data);
        } catch (err) {
            console.error('Failed to fetch cities:', err);
        }
    };

    const fetchCityAllocations = async () => {
        setLoadingAllocations(true);
        setHasSearchedAllocations(true);
        try {
            const url = new URL('http://localhost:3000/api/distribution/public/city-allocations');
            if (allocFilterCity) url.searchParams.append('city', allocFilterCity);

            const res = await fetch(url.toString());
            const result = await res.json();
            if (result.success) setCityAllocations(result.data);
        } catch (err) {
            console.error('Failed to fetch city allocations:', err);
        } finally {
            setLoadingAllocations(false);
        }
    };



    const fetchPublicComplaints = async () => {
        setPublicComplaintsLoading(true);
        try {
            const url = new URL('http://localhost:3000/api/complaints/public');
            if (publicComplaintsCity) url.searchParams.append('city', publicComplaintsCity);

            const res = await fetch(url.toString());
            const result = await res.json();
            if (result.success) setPublicComplaints(result.data);
        } catch (err) {
            console.error('Failed to fetch public complaints:', err);
        } finally {
            setPublicComplaintsLoading(false);
        }
    };

    useEffect(() => {
        if (showPublicComplaintsModal) {
            fetchPublicComplaints();
        }
    }, [publicComplaintsCity, showPublicComplaintsModal]);

    const fetchLedger = async () => {
        setLoading(true);
        try {
            // Append optional query filters
            const url = new URL('http://localhost:3000/api/distribution/public/ledger');
            if (filterCity.trim()) url.searchParams.append('city', filterCity.trim());
            if (filterVillage.trim()) url.searchParams.append('village', filterVillage.trim());

            const res = await fetch(url.toString());
            const result = await res.json();
            if (result.success) setLedger(result.data);
        } catch (err) {
            console.error('Failed to fetch public ledger:', err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-trigger fetch on Location Filter Change
    useEffect(() => {
        if (!isSearching) {
            // Add a small debounce buffer to prevent spamming DB on every keystroke for Village
            const delayDebounceFn = setTimeout(() => {
                fetchLedger();
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [filterCity, filterVillage]);

    // Trigger Farmer DB query
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setIsSearching(false);
            fetchLedger(); // restore default ledger if search is empty
            return;
        }

        setLoading(true);
        setIsSearching(true);
        try {
            const res = await fetch(`http://localhost:3000/api/distribution/public/search/${searchQuery.trim()}`);
            const result = await res.json();
            if (result.success) {
                setLedger(result.data);
                setHasActiveComplaint(result.hasActiveComplaint || false);
                setActiveComplaintStatus(result.activeComplaintStatus || null);
            } else {
                setLedger([]);
                setHasActiveComplaint(false);
                setActiveComplaintStatus(null);
            }
        } catch (err) {
            console.error('Failed to search farmer:', err);
            setLedger([]);
        } finally {
            setLoading(false);
        }
    };

    const openComplaintModal = () => {
        // Pre-fill form from ledger records if available
        const firstRecord = ledger.length > 0 ? ledger[0] : null;
        setComplaintForm({
            farmerName: firstRecord?.farmerName || '',
            farmerId: searchQuery,
            mobile: '',
            type: 'Under-distribution',
            description: '',
            city: firstRecord?.city || '',
            otp: ''
        });
        setComplaintStep(1);
        setComplaintError('');
        setComplaintSuccess('');
        setShowComplaintModal(true);
    };

    const handleSendComplaintOTP = async (e) => {
        e.preventDefault();
        setComplaintLoading(true);
        setComplaintError('');
        try {
            const res = await fetch('http://localhost:3000/api/complaints/public/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobile: complaintForm.mobile,
                    farmerName: complaintForm.farmerName
                })
            });
            const data = await res.json();
            if (data.success) {
                setComplaintStep(2);
                if (data.devOtp) setComplaintForm(prev => ({ ...prev, otp: data.devOtp }));
            } else {
                setComplaintError(data.message || 'Failed to send OTP');
            }
        } catch {
            setComplaintError('Server error while sending OTP');
        } finally {
            setComplaintLoading(false);
        }
    };

    const handleSubmitComplaint = async (e) => {
        e.preventDefault();
        setComplaintLoading(true);
        setComplaintError('');
        try {
            const res = await fetch('http://localhost:3000/api/complaints/public/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(complaintForm)
            });
            const data = await res.json();
            if (data.success) {
                setComplaintSuccess('Complaint submitted successfully. An official will review it shortly.');
                setTimeout(() => setShowComplaintModal(false), 3000);
            } else {
                setComplaintError(data.message || 'Invalid OTP or missing fields');
            }
        } catch {
            setComplaintError('Server error while submitting complaint');
        } finally {
            setComplaintLoading(false);
        }
    };

    // Format Date helper
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    const formatDateOnly = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    return (
        <div className="distribution-page">
            <div className="dist-hero">
                <div className="dist-hero-content">
                    <h1>{t('distribution.heroTitle')} 📊</h1>
                    <p>{t('distribution.heroSubtitle')}</p>
                </div>
            </div>

            <div className="dist-dashboard-container">
                {/* Stats Section */}
                <div className="dist-stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon bg-blue-100 text-blue-600">
                            <Users size={24} />
                        </div>
                        <div className="stat-body">
                            <h3>{stats.uniqueFarmers.toLocaleString()}</h3>
                            <p>{t('distribution.farmersServed')}</p>
                        </div>
                    </div>
                    <div className="stat-card clickable-stat" onClick={() => setShowPublicComplaintsModal(true)}>
                        <div className="stat-icon bg-red-100 text-red-600">
                            <MessageSquareWarning size={24} />
                        </div>
                        <div className="stat-body">
                            <h3>{stats.totalComplaints?.toLocaleString() || 0}</h3>
                            <p>{t('distribution.totalComplaints')}</p>
                        </div>
                    </div>
                    <div className="stat-card clickable-stat" onClick={() => setShowCitiesModal(true)}>
                        <div className="stat-icon bg-purple-100 text-purple-600">
                            <MapPin size={24} />
                        </div>
                        <div className="stat-body">
                            <h3>{stats.citiesWithStock?.toLocaleString() || 0} / {MP_CITIES.length}</h3>
                            <p>{t('distribution.citiesActiveStock')}</p>
                        </div>
                    </div>
                </div>

                {/* City Allocations Overview Tracking Section */}
                <div className="dist-lookup-section" style={{ marginBottom: hasSearchedAllocations ? '1.5rem' : '2rem' }}>
                    <div className="lookup-header">
                        <h2>{t('distribution.regionalOverview')}</h2>
                        <p>{t('distribution.selectCityMsg')}</p>
                    </div>

                    <form className="dist-search-bar" onSubmit={(e) => e.preventDefault()}>
                        <MapPin size={20} className="search-icon" color="#94a3b8" />
                        <select
                            value={allocFilterCity}
                            onChange={(e) => setAllocFilterCity(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.75rem',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                outline: 'none',
                                cursor: 'pointer',
                                appearance: 'none',
                                background: 'white',
                                color: allocFilterCity ? '#0f172a' : '#64748b'
                            }}
                        >
                            <option value="">{t('distribution.selectCity')}</option>
                            {MP_CITIES.map((city, idx) => (
                                <option key={idx} value={city}>{city}</option>
                            ))}
                        </select>
                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                            {/* <Filter size={16} /> */}
                        </div>
                    </form>
                </div>

                {/* City Allocations Grid (Only expands when searched) */}
                {hasSearchedAllocations && (
                    <div className="dist-ledger-section" style={{ padding: '2rem', marginBottom: '2rem' }}>
                        <div className="table-wrapper">
                            {loadingAllocations ? (
                                <div className="allocations-grid">
                                    {[1, 2, 3].map((n) => (
                                        <div key={n} className="allocation-card shimmer shimmer-card"></div>
                                    ))}
                                </div>
                            ) : cityAllocations.length > 0 ? (
                                <div className="allocations-grid">
                                    {cityAllocations.map((alloc, idx) => (
                                        <div key={idx} className="allocation-card">
                                            <div className="alloc-card-header">
                                                <h4>{alloc.productName}</h4>
                                                <span className={`badge ${alloc.productType === 'Seed' ? 'badge-seed' : 'badge-fert'}`}>
                                                    {alloc.productType}
                                                </span>
                                            </div>
                                            <div className="alloc-card-body">
                                                <div className="alloc-metric">
                                                    <span className="alloc-label">{t('distribution.totalAllocated')}</span>
                                                    <span className="alloc-value">{alloc.totalAllocated.toLocaleString()} <small>{t('distribution.units')}</small></span>
                                                </div>
                                                <div className="alloc-metric">
                                                    <span className="alloc-label">{t('distribution.distributed')}</span>
                                                    <span className="alloc-value text-green">{alloc.totalDistributed.toLocaleString()} <small>{t('distribution.units')}</small></span>
                                                </div>
                                                <div className="alloc-metric">
                                                    <span className="alloc-label">{t('distribution.availableStock')}</span>
                                                    <span className="alloc-value text-orange">{alloc.currentAvailable.toLocaleString()} <small>{t('distribution.units')}</small></span>
                                                </div>
                                            </div>
                                            <div className="alloc-progress-container">
                                                <div className="alloc-progress-bar" style={{ width: `${Math.min(100, (alloc.totalDistributed / alloc.totalAllocated) * 100) || 0}%` }}></div>
                                            </div>
                                            <p className="alloc-progress-text">{Math.round((alloc.totalDistributed / alloc.totalAllocated) * 100) || 0}% {t('distribution.completed')}</p>

                                            {alloc.lastUpdated && (
                                                <div className="alloc-last-update">
                                                    <Clock size={12} />
                                                    {t('distribution.updated')}: {formatDateOnly(alloc.lastUpdated)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="ledger-empty">
                                    <p>{t('distribution.noAllocData')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tracking & Search Section */}
                <div className="dist-lookup-section" style={{ marginBottom: isSearching ? '1.5rem' : '2rem' }}>
                    <div className="lookup-header">
                        <h2>{t('distribution.beneficiaryLookup')}</h2>
                        <p>{t('distribution.searchFarmerMsg')}</p>
                    </div>

                    <form className="dist-search-bar" onSubmit={handleSearch}>
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder={t('distribution.searchFarmerPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="search-btn">{t('distribution.searchBtn')}</button>
                    </form>
                </div>

                {/* Beneficiary Expanded Data */}
                {isSearching && (
                    <div className="dist-ledger-section" style={{ marginBottom: '2rem' }}>
                        <div className="ledger-header-panel">
                            <h2>{t('distribution.recordsFor')} {searchQuery}</h2>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {hasActiveComplaint ? (
                                    <div style={{
                                        backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444',
                                        padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}>
                                        <MessageSquareWarning size={18} /> {t('distribution.complaintStatus')} {activeComplaintStatus}
                                    </div>
                                ) : (
                                    <button className="complaint-action-btn" onClick={openComplaintModal} style={{
                                        backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s'
                                    }}>
                                        <MessageSquareWarning size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                                        {t('distribution.raiseComplaint')}
                                    </button>
                                )}
                                <button className="clear-search-btn" onClick={() => { setSearchQuery(''); setIsSearching(false); fetchLedger(); }}>
                                    {t('distribution.clearSearch')}
                                </button>
                            </div>
                        </div>
                        <div className="table-wrapper">
                            {loading ? (
                                <div className="ledger-loading-skeleton" style={{ padding: '0 1rem' }}>
                                    <div className="shimmer shimmer-header"></div>
                                    {[1, 2, 3].map((n) => (
                                        <div key={n} className="shimmer shimmer-row"></div>
                                    ))}
                                </div>
                            ) : ledger.length > 0 ? (
                                <table className="ledger-table">
                                    <thead>
                                        <tr>
                                            <th>{t('distribution.dateTime')}</th>
                                            <th>{t('distribution.beneficiaryName')}</th>
                                            <th>{t('distribution.location')}</th>
                                            <th>{t('distribution.productType')}</th>
                                            <th>{t('distribution.quantityAlloc')}</th>
                                            <th>{t('distribution.verification')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ledger.map((record) => (
                                            <tr key={record._id}>
                                                <td className="date-col">{formatDate(record.createdAt)}</td>
                                                <td className="farmer-col">
                                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{record.farmerName}</div>
                                                    <div className="farmer-id blur-sub">{t('distribution.id')}: ****{String(record.farmerId).slice(-4)}</div>
                                                </td>
                                                <td className="location-col">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <MapPin size={14} />
                                                        <span>{record.village}, {record.city}</span>
                                                    </div>
                                                </td>
                                                <td className="product-col">
                                                    <span style={{ fontWeight: '500', color: '#475569' }}>
                                                        {record.product?.name || 'Unknown Product'}
                                                        {record.product?.type ? ` (${record.product.type})` : ''}
                                                    </span>
                                                </td>
                                                <td className="quantity-col">{record.quantity} Units</td>
                                                <td className="status-col">
                                                    <span className="secure-badge">OTP Verified ✓</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="ledger-empty">
                                    <Package size={48} />
                                    <h3>No Records Found</h3>
                                    <p>We couldn't find any distribution history matching the criteria.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Global Ledger Table */}
                {!isSearching && (
                    <div className="dist-ledger-section">
                        <div className="ledger-header-panel" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h2>{t('distribution.latestDistributions')}</h2>
                            </div>

                            {/* Location Filters */}
                            <div className="location-filters" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <MapPin size={16} color="#64748b" />
                                <select
                                    value={filterCity}
                                    onChange={(e) => {
                                        setFilterCity(e.target.value);
                                        // If city is cleared, also clear village
                                        if (!e.target.value) setFilterVillage('');
                                    }}
                                    className="filter-input"
                                >
                                    <option value="">{t('distribution.allCities')}</option>
                                    {cities.map((city, idx) => (
                                        <option key={idx} value={city}>{city}</option>
                                    ))}
                                </select>

                                {filterCity && (
                                    <input
                                        type="text"
                                        placeholder={t('distribution.typeVillage')}
                                        value={filterVillage}
                                        onChange={(e) => setFilterVillage(e.target.value)}
                                        className="filter-input"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="table-wrapper">
                            {loading ? (
                                <div className="ledger-loading-skeleton" style={{ padding: '0 1rem' }}>
                                    <div className="shimmer shimmer-header"></div>
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <div key={n} className="shimmer shimmer-row"></div>
                                    ))}
                                </div>
                            ) : ledger.length > 0 ? (
                                <table className="ledger-table">
                                    <thead>
                                        <tr>
                                            <th>{t('distribution.dateTime')}</th>
                                            <th>{t('distribution.beneficiaryName')}</th>
                                            <th>{t('distribution.location')}</th>
                                            <th>{t('distribution.productType')}</th>
                                            <th>{t('distribution.quantityAlloc')}</th>
                                            <th>{t('distribution.verification')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ledger.map((record) => (
                                            <tr key={record._id}>
                                                <td className="date-col">{formatDate(record.createdAt)}</td>
                                                <td className="farmer-col">
                                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{record.farmerName}</div>
                                                    <div className="farmer-id blur-sub">{t('distribution.id')}: ****{String(record.farmerId).slice(-4)}</div>
                                                </td>
                                                <td className="location-col">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <MapPin size={14} />
                                                        <span>{record.village}, {record.city}</span>
                                                    </div>
                                                </td>
                                                <td className="product-col">
                                                    <span style={{ fontWeight: '500', color: '#475569' }}>
                                                        {record.product?.name || t('distribution.unknownProduct')}
                                                        {record.product?.type ? ` (${record.product.type})` : ''}
                                                    </span>
                                                </td>
                                                <td className="quantity-col">{record.quantity} {t('distribution.units')}</td>
                                                <td className="status-col">
                                                    <span className="secure-badge">{t('distribution.otpVerified')}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="ledger-empty">
                                    <Package size={48} />
                                    <h3>{t('distribution.noRecordsTitle')}</h3>
                                    <p>{t('distribution.noRecordsMsg')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Active Cities Modal */}
            {showCitiesModal && (
                <div className="cities-modal-overlay" onClick={() => setShowCitiesModal(false)}>
                    <div className="cities-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="cities-modal-header">
                            <h3>{t('distribution.citiesActiveModal')}</h3>
                            <button className="cities-modal-close" onClick={() => setShowCitiesModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="cities-modal-body">
                            {stats.activeCitiesList && stats.activeCitiesList.length > 0 ? (
                                <ul className="cities-list">
                                    {stats.activeCitiesList.map((city, idx) => (
                                        <li key={idx}>
                                            <MapPin size={16} color="#64748b" />
                                            <span>{city}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-cities-text">{t('distribution.noCitiesActive')}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Public Complaints Viewer Modal */}
            {showPublicComplaintsModal && (
                <div className="modal-overlay" onClick={() => setShowPublicComplaintsModal(false)}>
                    <div className="grievance-modal-container" onClick={e => e.stopPropagation()}>
                        <div className="grievance-header">
                            <h3><MessageSquareWarning size={28} /> {t('distribution.grievanceRegistry')}</h3>
                            <button className="grievance-close" onClick={() => setShowPublicComplaintsModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="grievance-body">
                            <div className="grievance-filter-container">
                                <div className="grievance-filter-icon">
                                    <Filter size={20} />
                                </div>
                                <select
                                    value={publicComplaintsCity}
                                    onChange={(e) => setPublicComplaintsCity(e.target.value)}
                                    className="form-input"
                                    style={{ flex: 1, margin: 0, border: 'none', boxShadow: 'none', background: 'transparent' }}
                                >
                                    <option value="">{t('distribution.filterAllCities')}</option>
                                    {MP_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {publicComplaintsLoading ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                    <div className="shimmer shimmer-row" style={{ height: '150px', borderRadius: '12px' }}></div>
                                    <div className="shimmer shimmer-row" style={{ height: '150px', borderRadius: '12px', marginTop: '1rem' }}></div>
                                </div>
                            ) : publicComplaints.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {publicComplaints.map(comp => (
                                        <div key={comp._id} className="grievance-card">
                                            <div className="grievance-card-header">
                                                <div>
                                                    <h4 className="grievance-card-title">{comp.type}</h4>
                                                    <div className="grievance-meta">
                                                        <span className="grievance-meta-item"><MapPin size={14} /> {comp.city}</span>
                                                        <span className="grievance-meta-item"><Users size={14} /> {t('distribution.by')} {comp.farmerName}</span>
                                                        <span className="grievance-meta-item"><Clock size={14} /> {formatDateOnly(comp.createdAt)}</span>
                                                    </div>
                                                </div>
                                                <span className={`grievance-status ${comp.status.toLowerCase()}`}>
                                                    {comp.status}
                                                </span>
                                            </div>
                                            <p className="grievance-description">
                                                {comp.description}
                                            </p>
                                            {comp.status === 'Resolved' && comp.resolutionNote && (
                                                <div className="grievance-resolution">
                                                    <span className="grievance-resolution-label">
                                                        <Activity size={16} /> {t('distribution.resolutionNote')}
                                                    </span>
                                                    <p className="grievance-resolution-text">{comp.resolutionNote}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grievance-empty">
                                    <MessageSquareWarning size={64} className="grievance-empty-icon" />
                                    <p className="grievance-empty-text">{t('distribution.noComplaints')} {publicComplaintsCity ? `${t('distribution.in')} ${publicComplaintsCity}` : t('distribution.statewide')}.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Complaint Modal */}
            {showComplaintModal && (
                <div className="cities-modal-overlay" onClick={() => setShowComplaintModal(false)}>
                    <div className="cities-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="cities-modal-header">
                            <h3>{t('distribution.raiseComplaintModal')}</h3>
                            <button className="cities-modal-close" onClick={() => setShowComplaintModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="cities-modal-body" style={{ padding: '1.5rem' }}>
                            {complaintSuccess ? (
                                <div className="complaint-success-msg" style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', textAlign: 'center', fontWeight: '500' }}>
                                    {complaintSuccess}
                                </div>
                            ) : (
                                <>
                                    {complaintError && (
                                        <div className="error-message" style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.9rem' }}>
                                            {complaintError}
                                        </div>
                                    )}

                                    {complaintStep === 1 ? (
                                        <form onSubmit={handleSendComplaintOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', marginBottom: '0.25rem', fontWeight: '500' }}>{t('distribution.farmerName')}</label>
                                                <input type="text" className="filter-input" style={{ width: '100%' }} value={complaintForm.farmerName} onChange={e => setComplaintForm({ ...complaintForm, farmerName: e.target.value })} placeholder={t('distribution.farmerNamePlaceholder')} required />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', marginBottom: '0.25rem', fontWeight: '500' }}>{t('distribution.phone')}</label>
                                                <input type="tel" className="filter-input" style={{ width: '100%' }} pattern="[0-9]{10}" value={complaintForm.mobile} onChange={e => setComplaintForm({ ...complaintForm, mobile: e.target.value })} placeholder={t('distribution.phonePlaceholder')} required />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', marginBottom: '0.25rem', fontWeight: '500' }}>{t('distribution.cityDistrict')}</label>
                                                    <select className="filter-input" style={{ width: '100%' }} value={complaintForm.city} onChange={e => setComplaintForm({ ...complaintForm, city: e.target.value })} required>
                                                        <option value="">{t('distribution.selectCity')}</option>
                                                        {MP_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', marginBottom: '0.25rem', fontWeight: '500' }}>{t('distribution.complaintType')}</label>
                                                    <select className="filter-input" style={{ width: '100%' }} value={complaintForm.type} onChange={e => setComplaintForm({ ...complaintForm, type: e.target.value })} required>
                                                        <option value="Under-distribution">{t('distribution.underDist')}</option>
                                                        <option value="Wrong Product">{t('distribution.wrongProduct')}</option>
                                                        <option value="Overcharging">{t('distribution.overcharging')}</option>
                                                        <option value="Misconduct">{t('distribution.misconduct')}</option>
                                                        <option value="Other">{t('distribution.other')}</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', marginBottom: '0.25rem', fontWeight: '500' }}>{t('distribution.descLabel')}</label>
                                                <textarea className="filter-input" style={{ width: '100%', minHeight: '80px', resize: 'vertical' }} value={complaintForm.description} onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })} placeholder={t('distribution.descPlaceholder')} required></textarea>
                                            </div>
                                            <button type="submit" disabled={complaintLoading} className="search-btn" style={{ width: '100%', borderRadius: '8px', marginTop: '0.5rem', background: '#3b82f6' }}>
                                                {complaintLoading ? t('distribution.processing') : t('distribution.sendOtp')}
                                            </button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleSubmitComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                                                    {t('distribution.otpSent')} <strong>+91 {complaintForm.mobile}</strong>.
                                                </p>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem', fontWeight: '500', textAlign: 'center' }}>{t('distribution.enterOtp')}</label>
                                                <input type="text" className="filter-input" style={{ width: '100%', textAlign: 'center', letterSpacing: '8px', fontSize: '1.25rem', padding: '0.75rem' }} maxLength="6" value={complaintForm.otp} onChange={e => setComplaintForm({ ...complaintForm, otp: e.target.value.replace(/\D/g, '') })} required autoFocus placeholder="------" />
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                                <button type="button" onClick={() => setComplaintStep(1)} className="clear-search-btn" style={{ flex: 1, padding: '0.75rem' }}>
                                                    {t('distribution.goBack')}
                                                </button>
                                                <button type="submit" disabled={complaintLoading} className="search-btn" style={{ flex: 2, borderRadius: '8px', background: '#10b981', padding: '0.75rem' }}>
                                                    {complaintLoading ? t('distribution.submitting') : t('distribution.verifySubmit')}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DistributionPage;
