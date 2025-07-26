import React, { useState } from 'react';
import './MenuManagement.css';

const MenuManagement = () => {
  const [currentMenu, setCurrentMenu] = useState({
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
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', description: '', emoji: '' });

  const handleMenuTitleChange = (e) => {
    setCurrentMenu({ ...currentMenu, title: e.target.value });
  };

  const handlePricingChange = (option, field, value) => {
    setCurrentMenu({
      ...currentMenu,
      pricing: {
        ...currentMenu.pricing,
        [option]: {
          ...currentMenu.pricing[option],
          [field]: parseInt(value) || 0
        }
      }
    });
  };

  const handleTimeChange = (field, value) => {
    setCurrentMenu({ ...currentMenu, [field]: value });
  };

  const addNewItem = () => {
    if (newItem.name && newItem.description && newItem.emoji) {
      setCurrentMenu({
        ...currentMenu,
        items: [...currentMenu.items, { ...newItem }]
      });
      setNewItem({ name: '', description: '', emoji: '' });
    }
  };

  const updateItem = (index, updatedItem) => {
    const updatedItems = currentMenu.items.map((item, i) => 
      i === index ? updatedItem : item
    );
    setCurrentMenu({ ...currentMenu, items: updatedItems });
    setEditingItem(null);
  };

  const deleteItem = (index) => {
    const updatedItems = currentMenu.items.filter((_, i) => i !== index);
    setCurrentMenu({ ...currentMenu, items: updatedItems });
  };

  const saveMenu = () => {
    // In real app, this would save to backend
    alert('Menu saved successfully!');
    setIsEditing(false);
  };

  return (
    <div className="menu-management">
      <div className="menu-header">
        <h2>Menu Management</h2>
        <div className="menu-actions">
          {!isEditing ? (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              ✏️ Edit Menu
            </button>
          ) : (
            <div className="edit-actions">
              <button className="save-btn" onClick={saveMenu}>
                💾 Save Changes
              </button>
              <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                ❌ Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="menu-content">
        <div className="menu-section">
          <h3>Menu Title</h3>
          {isEditing ? (
            <input
              type="text"
              value={currentMenu.title}
              onChange={handleMenuTitleChange}
              className="title-input"
            />
          ) : (
            <p className="menu-title-display">{currentMenu.title}</p>
          )}
        </div>

        <div className="menu-section">
          <h3>Menu Items</h3>
          <div className="items-list">
            {currentMenu.items.map((item, index) => (
              <div key={index} className="menu-item-card">
                {editingItem === index ? (
                  <div className="item-edit-form">
                    <input
                      type="text"
                      value={item.emoji}
                      onChange={(e) => updateItem(index, { ...item, emoji: e.target.value })}
                      placeholder="Emoji"
                      className="emoji-input"
                    />
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, { ...item, name: e.target.value })}
                      placeholder="Item name"
                      className="name-input"
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, { ...item, description: e.target.value })}
                      placeholder="Description"
                      className="desc-input"
                    />
                    <div className="item-actions">
                      <button onClick={() => setEditingItem(null)} className="done-btn">✓</button>
                    </div>
                  </div>
                ) : (
                  <div className="item-display">
                    <span className="item-emoji">{item.emoji}</span>
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-desc">– {item.description}</span>
                    </div>
                    {isEditing && (
                      <div className="item-actions">
                        <button onClick={() => setEditingItem(index)} className="edit-item-btn">✏️</button>
                        <button onClick={() => deleteItem(index)} className="delete-item-btn">🗑️</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isEditing && (
              <div className="add-item-form">
                <h4>Add New Item</h4>
                <div className="new-item-inputs">
                  <input
                    type="text"
                    value={newItem.emoji}
                    onChange={(e) => setNewItem({ ...newItem, emoji: e.target.value })}
                    placeholder="Emoji"
                    className="emoji-input"
                  />
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Item name"
                    className="name-input"
                  />
                  <input
                    type="text"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Description"
                    className="desc-input"
                  />
                  <button onClick={addNewItem} className="add-btn">+ Add Item</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="menu-section">
          <h3>Pricing</h3>
          <div className="pricing-grid">
            {Object.entries(currentMenu.pricing).map(([option, pricing]) => (
              <div key={option} className="pricing-card">
                <h4>{option} - {pricing.chapati} Chapati</h4>
                {isEditing ? (
                  <div className="pricing-inputs">
                    <label>
                      MRP: ₹
                      <input
                        type="number"
                        value={pricing.mrp}
                        onChange={(e) => handlePricingChange(option, 'mrp', e.target.value)}
                      />
                    </label>
                    <label>
                      Special: ₹
                      <input
                        type="number"
                        value={pricing.special}
                        onChange={(e) => handlePricingChange(option, 'special', e.target.value)}
                      />
                    </label>
                    <label>
                      Chapati Count:
                      <input
                        type="number"
                        value={pricing.chapati}
                        onChange={(e) => handlePricingChange(option, 'chapati', e.target.value)}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="pricing-display">
                    <p>MRP: ₹{pricing.mrp}</p>
                    <p>Special: ₹{pricing.special}</p>
                    <p>Chapati: {pricing.chapati} pieces</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="menu-section">
          <h3>Delivery Settings</h3>
          <div className="delivery-settings">
            <div className="setting-item">
              <label>Order Deadline:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={currentMenu.orderDeadline}
                  onChange={(e) => handleTimeChange('orderDeadline', e.target.value)}
                />
              ) : (
                <span>{currentMenu.orderDeadline}</span>
              )}
            </div>
            <div className="setting-item">
              <label>Delivery Time:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={currentMenu.deliveryTime}
                  onChange={(e) => handleTimeChange('deliveryTime', e.target.value)}
                />
              ) : (
                <span>{currentMenu.deliveryTime}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
