import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './MobileLayout.css'; // We will create this file next

const MobileLayout = () => {
    return (
        <div className="mobile-layout">
            <main className="mobile-content">
                <Outlet />
            </main>
            <nav className="bottom-nav">
                <NavLink to="/" className="nav-item">
                    <span className="nav-icon">🏠</span>
                    <span className="nav-text">Home</span>
                </NavLink>
                <NavLink to="/my-orders" className="nav-item">
                    <span className="nav-icon">🛍️</span>
                    <span className="nav-text">My Orders</span>
                </NavLink>
                <NavLink to="/account" className="nav-item">
                    <span className="nav-icon">👤</span>
                    <span className="nav-text">Account</span>
                </NavLink>
            </nav>
        </div>
    );
};

export default MobileLayout;
