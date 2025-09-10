import React, { useState, useEffect } from 'react';
import OrderModal from './OrderModal';
import './TodaysMenu.css';
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { app } from '../firebase';

const TodaysMenu = () => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [todaysItem, setTodaysItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore(app);
    const liveStatusRef = doc(db, "status", "liveMenu");

    const unsubscribeLiveStatus = onSnapshot(liveStatusRef, (statusDoc) => {
      if (statusDoc.exists()) {
        const liveMenuId = statusDoc.data().activeMenuId;
        
        if (liveMenuId) {
          const menuRef = doc(db, "menus", liveMenuId);
          const unsubscribeMenu = onSnapshot(menuRef, (menuDoc) => {
            if (menuDoc.exists()) {
              setTodaysItem(menuDoc.data());
            } else {
              setTodaysItem(null);
            }
            setLoading(false);
          });
          return () => unsubscribeMenu();
        }
      } else {
        setTodaysItem(null);
        setLoading(false);
      }
    });

    return () => unsubscribeLiveStatus();
  }, []);

  if (loading) {
    return (
      <div className="menu-loader">
        Loading today's menu...
      </div>
    );
  }

  if (!todaysItem) {
    return (
      <div className="menu-loader">
        The menu for today has not been posted yet. Please check back later!
      </div>
    );
  }

  return (
    <div className="todays-menu">
      <div className="menu-card">
        {/* Main content area with a two-column layout */}
        <div className="menu-card-body">

          {/* Left Column: Text Details */}
          <div className="item-details">
            <div className="item-header">
              <h2>🌙 Tonight's YummyFi Dinner Delight</h2>
            </div>

            <div className="includes-section">
              <h3>Includes</h3>
              <ul className="menu-items-list">
                {todaysItem.items.map((item, index) => (
                  <li key={index} className="menu-item-row">
                    <span className="item-emoji">{item.emoji}</span>
                    <div>
                      <span className="item-name">{item.name}</span>
                      <span className="item-desc"> – {item.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pricing-section">
              <h3>Pricing Options</h3>
              <div className="price-options-container">
                {todaysItem.pricing?.map((opt, index) => (
                  <div key={index} className="price-card">
                    <div className="price-card-name">{opt.name}</div>
                    <div className="price-card-mrp">MRP: ₹{opt.mrp}</div>
                    <div className="price-card-special">Special: ₹{opt.special}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <button className="order-button" onClick={() => setIsOrderModalOpen(true)}>
              Order Now
            </button>
          </div>

          {/* Right Column: Image */}
          <div className="item-cover">
            <img
              src={todaysItem.coverImage}
              alt={todaysItem.title}
              className="cover-image"
            />
          </div>
        </div>
      </div>

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        itemData={todaysItem}
      />
    </div>
  );
};

export default TodaysMenu;