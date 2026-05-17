import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const nextLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(nextLang);
        localStorage.setItem('appLang', nextLang);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🌾</span>
                    <span className="logo-text">{t('navbar.title')}</span>
                </Link>
                <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    <Link to="/#schemes-section" className="nav-link" onClick={closeMobileMenu}>
                        {t('navbar.schemes')}
                    </Link>
                    <Link to="/notifications" className="nav-link" onClick={closeMobileMenu}>
                        {t('navbar.notification')}
                    </Link>
                    <Link to="/market-price" className="nav-link" onClick={closeMobileMenu}>
                        {t('navbar.marketPrice')}
                    </Link>
                    <Link to="/distribution" className="nav-link" onClick={closeMobileMenu}>
                        {t('navbar.distribution')}
                    </Link>
                </div>

                <div className="navbar-actions">
                    <button onClick={toggleLanguage} className="lang-toggle-btn" aria-label="Toggle Language">
                        <Globe size={18} style={{ marginRight: '6px' }} />
                        {t('navbar.langToggle')}
                    </button>
                    
                    <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
