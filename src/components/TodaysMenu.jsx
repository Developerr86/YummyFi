import React from 'react';
import './TodaysMenu.css';

const TodaysMenu = () => {
  const menuItems = [
    {
      id: 1,
      name: "Grilled Salmon",
      description: "Fresh Atlantic salmon with herbs and lemon",
      price: "$24.99",
      category: "Main Course",
      image: "🐟"
    },
    {
      id: 2,
      name: "Caesar Salad",
      description: "Crisp romaine lettuce with parmesan and croutons",
      price: "$12.99",
      category: "Salad",
      image: "🥗"
    },
    {
      id: 3,
      name: "Margherita Pizza",
      description: "Classic pizza with fresh mozzarella and basil",
      price: "$18.99",
      category: "Pizza",
      image: "🍕"
    },
    {
      id: 4,
      name: "Chocolate Lava Cake",
      description: "Warm chocolate cake with molten center",
      price: "$8.99",
      category: "Dessert",
      image: "🍰"
    },
    {
      id: 5,
      name: "Beef Burger",
      description: "Juicy beef patty with lettuce, tomato, and cheese",
      price: "$16.99",
      category: "Burger",
      image: "🍔"
    },
    {
      id: 6,
      name: "Pasta Carbonara",
      description: "Creamy pasta with bacon and parmesan",
      price: "$19.99",
      category: "Pasta",
      image: "🍝"
    }
  ];

  return (
    <div className="todays-menu">
      <div className="menu-header">
        <h2>Today's Menu</h2>
        <p>Fresh ingredients, amazing flavors</p>
      </div>
      
      <div className="menu-grid">
        {menuItems.map(item => (
          <div key={item.id} className="menu-item">
            <div className="menu-item-image">
              <span className="emoji">{item.image}</span>
            </div>
            <div className="menu-item-content">
              <div className="menu-item-header">
                <h3>{item.name}</h3>
                <span className="category">{item.category}</span>
              </div>
              <p className="description">{item.description}</p>
              <div className="menu-item-footer">
                <span className="price">{item.price}</span>
                <button className="add-to-cart">Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysMenu;
