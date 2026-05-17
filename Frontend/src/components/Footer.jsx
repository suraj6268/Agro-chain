import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="footer-container">
            <div className="footer-content">
                {/* Brand Section */}
                <div className="footer-section brand">
                    <h3 className="footer-logo">🌾 {t('navbar.title')}</h3>
                    <p className="footer-desc">
                        {t('footer.desc')}
                    </p>
                </div>

                {/* Quick Links */}
                <div className="footer-section links">
                    <h4>{t('footer.quickLinks')}</h4>
                    <ul>
                        <li><Link to="/">{t('footer.home')}</Link></li>
                        <li><Link to="/#schemes-section">{t('footer.schemes')}</Link></li>
                        <li><Link to="/notifications">{t('footer.notifications')}</Link></li>
                        <li><Link to="/market-price">{t('footer.marketPrice')}</Link></li>
                        <li><Link to="/distribution">{t('footer.distribution')}</Link></li>
                        <li><Link to="/admin/login">{t('footer.adminLogin')}</Link></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div className="footer-section contact">
                    <h4>{t('footer.contact')}</h4>

                    <p>📧 support@agrochain.in</p>
                    <p>📞 +91 1800-123-4567</p>
                </div>
            </div>

            {/* Copyright */}
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} {t('footer.rights')}</p>
            </div>
        </footer>
    );
};

export default Footer;
