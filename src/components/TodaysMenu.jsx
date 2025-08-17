import OrderModal from './OrderModal';
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { app } from '../firebase';
import React, { useState, useEffect } from 'react';
import './TodaysMenu.css';

const TodaysMenu = () => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  // REPLACE the hardcoded 'todaysItem' object with this state:
  const [todaysItem, setTodaysItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // ADD this useEffect to fetch the menu data
  useEffect(() => {
    const db = getFirestore(app);
    const menuRef = doc(db, 'menu', 'todaysMenu');

    // onSnapshot listens for real-time changes
    const unsubscribe = onSnapshot(menuRef, (docSnap) => {
      if (docSnap.exists()) {
        setTodaysItem(docSnap.data());
      } else {
        console.log("Today's menu document does not exist!");
        // Handle the case where the menu hasn't been set by the admin yet
        setTodaysItem(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOrder = () => {
    setIsOrderModalOpen(true);
  };

  // Add a loading state for a better user experience
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem' }}>
        Loading today's menu...
      </div>
    );
  }

  // Add a check in case the menu doesn't exist
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
            <div className="price-preview">
              <div className="price-option-preview">
                <div className="price-details">
                  <span className="mrp">MRP: ₹70-80</span>
                  <span className="special-price">Special Price: ₹59-63</span>
                  <span className="chapati-info">(Choose chapati option when ordering)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="payment-info">
            <h3>💳 Payment Options</h3>
            <div className="payment-options">
              <div className="payment-option">
                <span className="check">✅</span>
                <span>Prepaid – No extra charges</span>
              </div>
              <div className="payment-option">
                <span className="check">✅</span>
                <span>COD – ₹5 extra per parcel</span>
              </div>
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
