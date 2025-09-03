import React from 'react';
import TodaysMenu from './TodaysMenu';
import './Home.css';

const Home = () => {
  return (
    // The header and user info are now in the Sidebar/UserLayout
    <div className="home-main">
      <TodaysMenu />
    </div>
  );
};

export default Home;