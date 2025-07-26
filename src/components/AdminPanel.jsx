import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import OrdersManagement from './OrdersManagement';
import MenuManagement from './MenuManagement';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const { user, logout } = useAuth();

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-header-top">
          <h1>YummyFi Admin Panel</h1>
          <div className="admin-user-info">
            <span>Welcome, {user?.name || user?.email}!</span>
            <button onClick={logout} className="admin-logout-btn">Logout</button>
          </div>
        </div>
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📋 Orders Management
          </button>
          <button
            className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            🍽️ Menu Management
          </button>
        </div>
      </div>

      <div className="admin-content">
        {activeTab === 'orders' && <OrdersManagement />}
        {activeTab === 'menu' && <MenuManagement />}
      </div>
    </div>
  );
};

export default AdminPanel;
