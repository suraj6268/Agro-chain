import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    Agro-Chain
                </Link>
                <div className="navbar-links">
                    <Link to="/" className="nav-link">Schemes</Link>
                    <Link to="/notifications" className="nav-link">Notification</Link>
                    <Link to="/distribution" className="nav-link">Fertilizer and Schemes Distribution</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
