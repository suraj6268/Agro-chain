import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SchemeCard from '../components/SchemeCard';
import { ShimmerGrid } from '../components/Shimmer';
import { schemesAPI } from '../services/api';
import './SchemesPage.css';

const SchemesPage = () => {
    const { t } = useTranslation();
    const [schemes, setSchemes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const location = useLocation();

    // Handle Scroll to Top or Hash Section
    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [location]);

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
        } finally {
            // Ensure shimmer effect is visible for 0.5s
            setTimeout(() => {
                setLoading(false);
            }, 500);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await schemesAPI.getCategories();
            if (res.success) {
                setCategories(['All', ...res.data.map(c => c.name)]);
            }
        } catch {
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

                    <h1 className="hero-title">{t('schemes.heroTitle')}</h1>
                    <p className="hero-subtitle">
                        {t('schemes.heroSubtitle')}
                    </p>
                    <div className="schemes-stats">
                        <div className="stat-item">
                            <span className="stat-number">{schemes.length}</span>
                            <span className="stat-label">{t('schemes.totalSchemes')}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{categories.length - 1}</span>
                            <span className="stat-label">{t('schemes.categories')}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">100%</span>
                            <span className="stat-label">{t('schemes.freeAccess')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="schemes-container" id="schemes-section">
                <div className="filters-section">
                    <div className="search-box">
                        <span className="search-icon"></span>
                        <input
                            type="text"
                            placeholder={t('schemes.searchPlaceholder')}
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
                    <span>{t('schemes.showing')} {filteredSchemes.length} {t('schemes.of')} {schemes.length} {t('schemes.schemesWord')}</span>
                    <Link to="/admin/login" className="admin-link">{t('schemes.adminLogin')}</Link>
                </div>

                {loading ? (
                    <ShimmerGrid count={6} />
                ) : (
                    <div className="schemes-grid">
                        {filteredSchemes.map(scheme => (
                            <SchemeCard key={scheme._id} scheme={scheme} />
                        ))}
                    </div>
                )}

                {!loading && filteredSchemes.length === 0 && (
                    <div className="no-results">
                        <span className="no-results-icon">🔎</span>
                        <h3>{t('schemes.noSchemes')}</h3>
                        <p>{t('schemes.tryAdjusting')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchemesPage;
