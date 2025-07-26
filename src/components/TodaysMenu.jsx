import React, { useState } from 'react';
import OrderModal from './OrderModal';
import './TodaysMenu.css';

const TodaysMenu = () => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const todaysItem = {
    title: "Tonight's YummyFi Dinner Delight!",
    items: [
      { name: "Aloo Matar", description: "Comforting, flavorful & hearty", emoji: "🍛" },
      { name: "Dal Tadka", description: "Comforting & full of taste", emoji: "🍲" },
      { name: "Jeera Rice", description: "Fragrant, mild & delicious", emoji: "🍚" },
      { name: "Salad", description: "Fresh, crunchy & refreshing", emoji: "🥗" },
      { name: "Chapati", description: "Soft & wholesome", emoji: "🍞" },
      { name: "Jalebi", description: "A perfect sweet finish! 😋", emoji: "🍮" }
    ],
    pricing: {
      C3: { mrp: 70, special: 59, chapati: 3 },
      C4: { mrp: 80, special: 63, chapati: 4 }
    },
    deliveryTime: "8:00 PM to 9:00 PM",
    orderDeadline: "5:00 PM",
    coverImage: "./src/assets/cover.jpeg"
  };

  const handleOrder = () => {
    setIsOrderModalOpen(true);
  };

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
