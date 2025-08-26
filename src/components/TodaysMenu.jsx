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

    // Listen for changes to the liveMenu document.
    // This outer subscription will run whenever a new menu is published.
    const unsubscribeLiveStatus = onSnapshot(liveStatusRef, (statusDoc) => {
      if (statusDoc.exists()) {
        const liveMenuId = statusDoc.data().activeMenuId;
        
        if (liveMenuId) {
          // Now that we have the ID, we create a second subscription
          // to fetch the actual menu document.
          const menuRef = doc(db, "menus", liveMenuId);
          const unsubscribeMenu = onSnapshot(menuRef, (menuDoc) => {
            if (menuDoc.exists()) {
              setTodaysItem(menuDoc.data());
            } else {
              setTodaysItem(null); // The live menu ID points to a deleted menu
            }
            setLoading(false);
          });
          // Return the cleanup function for the *inner* subscription
          return () => unsubscribeMenu();
        }
      } else {
        // The status/liveMenu document doesn't exist at all
        setTodaysItem(null);
        setLoading(false);
      }
    });

    // Return the cleanup function for the *outer* subscription
    return () => unsubscribeLiveStatus();
  }, []);

  const handleOrder = () => {
    setIsOrderModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem' }}>
        Loading today's menu...
      </div>
    );
  }

  if (!todaysItem) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem' }}>
        The menu for today has not been posted yet. Please check back later!
      </div>
    );
  }

  return (
    <div className="todays-menu">
      <div className="featured-item">
        <div className="item-header">
          <h2>🌙✨ {todaysItem.title} ✨🌙</h2>
        </div>

        <div className="item-cover">
          <img
            src={todaysItem.coverImage}
            alt="Today's Featured Meal"
            className="cover-image"
          />
        </div>

        <div className="item-content">
          <div className="menu-items">
            {todaysItem.items.map((item, index) => (
              <div key={index} className="menu-item-row">
                <span className="item-emoji">{item.emoji}</span>
                <span className="item-name">{item.name}</span>
                <span className="item-desc">– {item.description}</span>
              </div>
            ))}
          </div>

          <div className="pricing-section">
            <h3>💰 Pricing Options</h3>
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

          <div className="payment-info">
            <h3>💳 Payment Options</h3>
            <div className="payment-options">
              {todaysItem.paymentOptions?.prepaid && (
                <div className="payment-option">
                  <span className="check">✅</span>
                  <span>Prepaid – No extra charges</span>
                </div>
              )}
              {todaysItem.paymentOptions?.cod && (
                <div className="payment-option">
                  <span className="check">✅</span>
                  <span>COD – ₹5 extra per parcel</span>
                </div>
              )}
            </div>
          </div>

          <div className="delivery-info">
            <div className="info-row">
              <span className="icon">⏱️</span>
              <span>Please confirm your order before {todaysItem.orderDeadline}</span>
            </div>
            <div className="info-row">
              <span className="icon">🚚</span>
              <span>Delivery between {todaysItem.deliveryTime}</span>
            </div>
          </div>

          <button className="order-button" onClick={handleOrder}>
            🍽️ Order Now & Enjoy Your Wholesome Meal! 😋
          </button>

          <div className="footer-message">
            <p>🍽️ A warm, tasty dinner is just a message away! 😋</p>
            <p className="team-signature">— With ❤️ from Team YummyFi</p>
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
