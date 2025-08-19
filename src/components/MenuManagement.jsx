import React, { useState, useEffect } from 'react';
import './MenuManagement.css';
// The 'getStorage' and other firebase/storage imports are no longer needed.
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"; 
import { app } from '../firebase';

const MenuManagement = () => {
    const [currentMenu, setCurrentMenu] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({ name: '', description: '', emoji: '' });

    // State for the image file remains the same
    const [imageFile, setImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchMenu = async () => {
            const db = getFirestore(app);
            const menuRef = doc(db, 'menu', 'todaysMenu');
            const docSnap = await getDoc(menuRef);

            if (docSnap.exists()) {
                setCurrentMenu(docSnap.data());
            } else {
                console.log("No menu found in database. Starting with a default menu.");
                setCurrentMenu({
                    title: "Tonight's YummyFi Dinner Delight!",
                    items: [],
                    pricing: { C3: { mrp: 0, special: 0, chapati: 3 }, C4: { mrp: 0, special: 0, chapati: 4 }},
                    deliveryTime: "8:00 PM to 9:00 PM",
                    orderDeadline: "5:00 PM",
                    coverImage: "/src/assets/cover.jpeg"
                });
            }
            setIsLoading(false);
        };

        fetchMenu();
    }, []);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    // All other state handlers (handleMenuTitleChange, handlePricingChange, etc.) remain exactly the same.
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

    const handleItemEdit = (field, value) => {
        setEditingItem(prev => ({ ...prev, item: { ...prev.item, [field]: value } }));
    };

    const saveItemEdit = (index) => {
        const updatedItems = currentMenu.items.map((item, i) =>
            i === index ? editingItem.item : item
        );
        setCurrentMenu(prev => ({ ...prev, items: updatedItems }));
        setEditingItem(null);
    };

    const deleteItem = (index) => {
        const updatedItems = currentMenu.items.filter((_, i) => i !== index);
        setCurrentMenu({ ...currentMenu, items: updatedItems });
    };


    const saveMenu = async () => {
        const db = getFirestore(app);
        const menuRef = doc(db, 'menu', 'todaysMenu');
        let menuDataToSave = { ...currentMenu };

        // UPDATED: This block now uploads the image to your Vercel Blob API endpoint.
        if (imageFile) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', imageFile);

            try {
                // Send the file to your own serverless function
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }
                
                const blob = await response.json();
                
                // The blob object returned from your API contains the public URL
                menuDataToSave.coverImage = blob.url;

            } catch (error) {
                console.error("Error uploading image: ", error);
                alert('Image upload failed! Menu saved without new image.');
                setIsUploading(false);
                return; // Stop the function if upload fails
            }
        }

        // This part, which saves the final menu data to Firestore, remains unchanged.
        try {
            await setDoc(menuRef, menuDataToSave);
            alert('Menu saved successfully!');
            setIsEditing(false);
            setImageFile(null);
        } catch (error) {
            console.error("Error saving menu: ", error);
            alert('Failed to save menu.');
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return <div>Loading menu for editing...</div>;
    }

    // The entire JSX for rendering the component remains the same.
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
                            <button className="save-btn" onClick={saveMenu} disabled={isUploading}>
                                {isUploading ? 'Uploading...' : '💾 Save Changes'}
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
                        <input type="text" value={currentMenu.title} onChange={handleMenuTitleChange} className="title-input" />
                    ) : (
                        <p className="menu-title-display">{currentMenu.title}</p>
                    )}
                </div>
                
                <div className="menu-section">
                    <h3>Cover Image</h3>
                    <img src={currentMenu.coverImage} alt="Menu cover" style={{width: '200px', borderRadius: '8px', marginBottom: '10px'}}/>
                    {isEditing && (
                        <input type="file" onChange={handleImageChange} accept="image/*" />
                    )}
                </div>

                <div className="menu-section">
                    <h3>Menu Items</h3>
                    <div className="items-list">
                        {currentMenu.items.map((item, index) => (
                            <div key={index} className="menu-item-card">
                                {editingItem?.index === index ? (
                                    <div className="item-edit-form">
                                        <input
                                            type="text"
                                            value={editingItem.item.emoji}
                                            onChange={(e) => handleItemEdit('emoji', e.target.value)}
                                            className="emoji-input"
                                        />
                                        <input
                                            type="text"
                                            value={editingItem.item.name}
                                            onChange={(e) => handleItemEdit('name', e.target.value)}
                                            className="name-input"
                                        />
                                        <input
                                            type="text"
                                            value={editingItem.item.description}
                                            onChange={(e) => handleItemEdit('description', e.target.value)}
                                            className="desc-input"
                                        />
                                        <div className="item-actions">
                                            <button onClick={() => saveItemEdit(index)} className="done-btn">✓</button>
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
                                                <button onClick={() => setEditingItem({index, item: {...item}})} className="edit-item-btn">✏️</button>
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
                                    <input type="text" value={newItem.emoji} onChange={(e) => setNewItem({ ...newItem, emoji: e.target.value })} placeholder="Emoji" className="emoji-input" />
                                    <input type="text" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Item name" className="name-input" />
                                    <input type="text" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} placeholder="Description" className="desc-input" />
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
                                        <label>MRP: ₹<input type="number" value={pricing.mrp} onChange={(e) => handlePricingChange(option, 'mrp', e.target.value)} /></label>
                                        <label>Special: ₹<input type="number" value={pricing.special} onChange={(e) => handlePricingChange(option, 'special', e.target.value)} /></label>
                                        <label>Chapati Count:<input type="number" value={pricing.chapati} onChange={(e) => handlePricingChange(option, 'chapati', e.target.value)} /></label>
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
                                <input type="text" value={currentMenu.orderDeadline} onChange={(e) => handleTimeChange('orderDeadline', e.target.value)} />
                            ) : (
                                <span>{currentMenu.orderDeadline}</span>
                            )}
                        </div>
                        <div className="setting-item">
                            <label>Delivery Time:</label>
                            {isEditing ? (
                                <input type="text" value={currentMenu.deliveryTime} onChange={(e) => handleTimeChange('deliveryTime', e.target.value)} />
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