import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { schemesAPI } from '../services/api';
import SchemeDetailSkeleton from '../components/SchemeDetailSkeleton';
import './SchemeDetailPage.css';

const SchemeDetailPage = () => {
    const { id } = useParams();
    const [scheme, setScheme] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadScheme();
    }, [id]);

    const loadScheme = async () => {
        try {
            const res = await schemesAPI.getById(id);
            if (res.success) {
                setScheme(res.data);
            }
        } catch (err) {
            console.error('Failed to load scheme:', err);
        }
        setLoading(false);
    };

    if (loading) {
        return <SchemeDetailSkeleton />;
    }

    if (!scheme) {
        return (
            <div className="scheme-detail-page">
                <div className="error-container">
                    <h1>Scheme Not Found</h1>
                    <p>The scheme you're looking for doesn't exist.</p>
                    <Link to="/" className="back-btn">← Back to All Schemes</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="scheme-detail-page">
            <div className="detail-hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <Link to="/" className="back-link">
                        <span className="back-arrow">←</span>
                        Back to All Schemes
                    </Link>
                    <span className={`detail-category ${scheme.category?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {scheme.category}
                    </span>
                    <h1 className="detail-title">{scheme.name}</h1>
                    <p className="detail-subtitle">{scheme.shortDescription}</p>

                    <div className="hero-meta">
                        <div className="meta-item">
                            <span className="meta-icon">📅</span>
                            <div>
                                <span className="meta-label">Launch Date</span>
                                <span className="meta-value">{scheme.launchDate || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="meta-item">
                            <span className="meta-icon">🏛️</span>
                            <div>
                                <span className="meta-label">Ministry</span>
                                <span className="meta-value">{scheme.ministry}</span>
                            </div>
                        </div>
                        <div className="meta-item">
                            <span className="meta-icon">👁️</span>
                            <div>
                                <span className="meta-label">Views</span>
                                <span className="meta-value">{scheme.viewCount || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="detail-container">
                <div className="detail-main">
                    <section className="detail-section">
                        <h2>💰 Key Benefits</h2>
                        <div className="benefit-highlight">
                            {scheme.benefits}
                        </div>
                    </section>

                    <section className="detail-section">
                        <h2>📋 About This Scheme</h2>
                        <div className="full-description">
                            {scheme.description?.split('\n\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </section>

                    {scheme.documents?.length > 0 && (
                        <section className="detail-section">
                            <h2>📄 Required Documents</h2>
                            <ul className="documents-list">
                                {scheme.documents.map((doc, index) => (
                                    <li key={index}>
                                        <span className="doc-check">✓</span>
                                        {doc}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <aside className="detail-sidebar">
                    <div className="sidebar-card">
                        <h3>Eligibility</h3>
                        <p>{scheme.eligibility}</p>
                    </div>

                    <div className="sidebar-card">
                        <h3>How to Apply</h3>
                        <p>{scheme.applicationProcess || 'Visit the official website for application details.'}</p>
                    </div>

                    <div className="sidebar-card">
                        <h3>State Coverage</h3>
                        <p>{scheme.state || 'All India'}</p>
                    </div>

                    <div className="sidebar-card action-card">
                        <h3>Get Started</h3>
                        <a
                            href={scheme.officialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="official-btn"
                        >
                            Visit Official Website
                            <span>↗</span>
                        </a>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default SchemeDetailPage;
