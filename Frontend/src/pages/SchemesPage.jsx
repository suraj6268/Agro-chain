import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SchemeCard from '../components/SchemeCard';
import SchemeCardSkeleton from '../components/SchemeCardSkeleton';
import { schemesAPI } from '../services/api';
import './SchemesPage.css';

const SchemesPage = () => {
    const [schemes, setSchemes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        loadSchemes();
        loadCategories();
    }, []);

    const loadSchemes = async () => {
        try {
            const res = await schemesAPI.getAll({ limit: 100 });
            if (res.success) {
                setSchemes(res.data || []);
            }
        } catch (err) {
            console.error('Failed to load schemes:', err);
        }
        setLoading(false);
    };

    const loadCategories = async () => {
        try {
            const res = await schemesAPI.getCategories();
            if (res.success) {
                setCategories(['All', ...res.data.map(c => c.name)]);
            }
        } catch (err) {
            setCategories(['All']);
        }
    };

    const filteredSchemes = schemes.filter(scheme => {
        const matchesSearch = scheme.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            scheme.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="schemes-page">
            <div className="schemes-hero">
                <div className="hero-content">
                    <span className="hero-badge">🌾 Agro-chain</span>
                    <h1 className="hero-title">Government Schemes for Farmers</h1>
                    <p className="hero-subtitle">
                        Discover and access welfare schemes designed to support Indian farmers
                    </p>
                    <div className="schemes-stats">
                        <div className="stat-item">
                            <span className="stat-number">{schemes.length}</span>
                            <span className="stat-label">Total Schemes</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{categories.length - 1}</span>
                            <span className="stat-label">Categories</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">100%</span>
                            <span className="stat-label">Free Access</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="schemes-container">
                <div className="filters-section">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search schemes by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="category-filters">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="results-info">
                    <span>Showing {filteredSchemes.length} of {schemes.length} schemes</span>
                    <Link to="/admin/login" className="admin-link">Admin Login →</Link>
                </div>

                <div className="schemes-grid">
                    {loading ? (
                        [...Array(6)].map((_, index) => (
                            <SchemeCardSkeleton key={index} />
                        ))
                    ) : (
                        filteredSchemes.map(scheme => (
                            <SchemeCard key={scheme._id} scheme={scheme} />
                        ))
                    )}
                </div>

                {!loading && filteredSchemes.length === 0 && (
                    <div className="no-results">
                        <span className="no-results-icon">🔎</span>
                        <h3>No schemes found</h3>
                        <p>Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchemesPage;
