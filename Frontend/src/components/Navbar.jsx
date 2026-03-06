import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                    <span className="logo-text">Agro-chain</span>
                </Link>
                <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    <Link to="/#schemes-section" className="nav-link" onClick={closeMobileMenu}>
                        Schemes
                    </Link>
                    <Link to="/notifications" className="nav-link" onClick={closeMobileMenu}>
                        Notification
                    </Link>
                    <Link to="/market-price" className="nav-link" onClick={closeMobileMenu}>
                        Market Price
                    </Link>
                    <Link to="/distribution" className="nav-link" onClick={closeMobileMenu}>
                        Fertilizer and Seeds Distribution
                    </Link>
                </div>

                <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
