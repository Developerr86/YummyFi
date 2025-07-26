import React from 'react';
import { useAuth } from '../context/AuthContext';
import TodaysMenu from './TodaysMenu';
import './Home.css';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="home">
      <header className="home-header">
        <div className="header-content">
          <h1>YummyFi</h1>
          <div className="user-info">
            <span>Welcome, {user?.name || user?.email || 'User'}!</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="home-main">
        <TodaysMenu />
      </main>
    </div>
  );
};

export default Home;
