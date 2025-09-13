import React from 'react';
import { useAuth } from '../context/AuthContext';
import './MyAccount.css'; // We will create this file next

const MyAccount = () => {
    const { user, logout } = useAuth();

    return (
        <div className="my-account-container">
            <h2>My Account</h2>
            <div className="account-card">
                <p><strong>Email:</strong> {user?.email}</p>
                <p>This page is under construction. More features coming soon!</p>
                <button onClick={logout} className="account-logout-btn">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default MyAccount;