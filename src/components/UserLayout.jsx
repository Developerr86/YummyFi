import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileLayout from './MobileLayout'; // Import the new mobile layout
import './UserLayout.css';

// A custom hook to check the window size
const useWindowSize = () => {
    const [size, setSize] = useState([window.innerWidth]);
    useEffect(() => {
        const handleResize = () => {
            setSize([window.innerWidth]);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return size;
};

const UserLayout = () => {
    const [width] = useWindowSize();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // Set a breakpoint for mobile
    const isMobile = width < 768;

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // If it's a mobile screen, render the MobileLayout
    if (isMobile) {
        return <MobileLayout />;
    }

    // Otherwise, render the Desktop layout with the sidebar
    return (
        <div className={`user-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <main className="content-area">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;