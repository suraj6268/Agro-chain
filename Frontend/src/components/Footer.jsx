import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                {/* Brand Section */}
                <div className="footer-section brand">
                    <h3 className="footer-logo">🌾 Agro-chain</h3>
                    <p className="footer-desc">
                        Empowering farmers with transparent distribution of fertilizers and seeds.
                        Building a sustainable future for Indian Agriculture.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="footer-section links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/#schemes-section">Schemes</Link></li>
                        <li><Link to="/notifications">Notifications</Link></li>
                        <li><Link to="/market-price">Market Price</Link></li>
                        <li><Link to="/distribution">Distribution Centers</Link></li>
                        <li><Link to="/admin/login">Admin Login</Link></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div className="footer-section contact">
                    <h4>Contact Us</h4>

                    <p>📧 support@agrochain.gov.in</p>
                    <p>📞 +91 1800-123-4567</p>
                </div>
            </div>

            {/* Copyright */}
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Agro-chain. All rights reserved. | Government of India Initiative</p>
            </div>
        </footer>
    );
};

export default Footer;
