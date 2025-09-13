import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

// We pass in isOpen and toggleSidebar as props from the layout
const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { logout, user } = useAuth();

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                {/* The h1 is now a button to toggle the sidebar */}
                <button onClick={toggleSidebar} className="sidebar-toggle">
                    <h1>{isOpen ? 'YummyFi' : 'YF'}</h1>
                    <span className="toggle-icon">{isOpen ? '\u2039' : '\u203a'}</span>
                </button>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/" className="nav-link">
                    <span className="nav-icon">🏠</span>
                    <span className="nav-text">Home</span>
                </NavLink>
                <NavLink to="/my-orders" className="nav-link">
                    <span className="nav-icon">🛍️</span>
                    <span className="nav-text">My Orders</span>
                </NavLink>
                <NavLink to="/account" className="nav-link">
                    <span className="nav-icon">👤</span>
                    <span className="nav-text">My Account</span>
                </NavLink>
            </nav>
            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">{user?.email?.[0].toUpperCase()}</div>
                    <span className="nav-text" style={{color: '#000'}}>{user?.email}</span>
                </div>
                <button onClick={logout} className="logout-button">
                    <span className="nav-icon">🚪</span>
                    <span className="nav-text">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;