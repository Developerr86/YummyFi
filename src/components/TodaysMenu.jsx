import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './TodaysMenu.css';
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { app } from '../firebase';

// Renamed for clarity as it's now a single menu item card
const MenuItemCard = ({ item }) => {
  const navigate = useNavigate(); // Use navigate hook

  const handleOrderNow = () => {
    // Navigate to the full-page order component
    navigate(`/order/${item.id}`, { state: { itemData: item } });
  };

  return (
    <div className="menu-card">
      <div className="menu-card-body">
        <div className="item-details">
          <div className="item-header">
            <h2>{item.title}</h2>
          </div>
          <div className="includes-section">
            <h3>Includes</h3>
            <ul className="menu-items-list">
              {item.items.map((menuItem, index) => (
                <li key={index} className="menu-item-row">
                  <span className="item-emoji">{menuItem.emoji}</span>
                  <div>
                    <span className="item-name">{menuItem.name}</span>
                    <span className="item-desc"> – {menuItem.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="pricing-section">
            <h3>Pricing Options</h3>
            <div className="price-options-container">
              {item.pricing?.map((opt, index) => (
                <div key={index} className="price-card">
                  <div className="price-card-name">{opt.name}</div>
                  <div className="price-card-mrp">MRP: ₹{opt.mrp}</div>
                  <div className="price-card-special">Special: ₹{opt.special}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="delivery-info">
            <div className="info-row">
              <span className="icon">⏱️</span>
              <span>Order before {item.orderDeadline}</span>
            </div>
            <div className="info-row">
              <span className="icon">🚚</span>
              <span>Delivery between {item.deliveryTime}</span>
            </div>
          </div>
          <button className="order-button" onClick={handleOrderNow}>
            Order Now
          </button>
        </div>
        <div className="item-cover">
          <img src={item.coverImage} alt={item.title} className="cover-image" />
        </div>
      </div>
    </div>
  );
};

const TodaysMenu = () => {
  const [liveMenus, setLiveMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore(app);
    // Query the 'menus' collection for all documents where 'isLive' is true
    const q = query(collection(db, "menus"), where("isLive", "==", true));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const menusData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLiveMenus(menusData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="menu-loader">Loading today's menus...</div>;
  }

  return (
    <div className="todays-menu-container">
      {liveMenus.length > 0 ? (
        liveMenus.map(menu => <MenuItemCard key={menu.id} item={menu} />)
      ) : (
        <div className="menu-loader">
          No menus have been posted for today. Please check back later!
        </div>
      )}
    </div>
  );
};

export default TodaysMenu;