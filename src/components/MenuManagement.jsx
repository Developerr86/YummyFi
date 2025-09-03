import React, { useState, useEffect } from 'react';
import './MenuManagement.css';
import { getFirestore, collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { app } from '../firebase';

// This is the form component for creating/editing a menu.
const MenuForm = ({ menuData, onSave, onCancel }) => {
    const [menu, setMenu] = useState(menuData);
    const [imageFile, setImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (e) => {
        setMenu(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = menu.items.map((item, i) => i === index ? { ...item, [field]: value } : item);
        setMenu(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setMenu(prev => ({ ...prev, items: [...prev.items, { name: '', description: '', emoji: '' }] }));
    };

    const removeItem = (index) => {
        setMenu(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handlePricingChange = (index, field, value) => {
        const newPricing = menu.pricing.map((p, i) => i === index ? { ...p, [field]: value } : p);
        setMenu(prev => ({ ...prev, pricing: newPricing }));
    };

    const addPricingOption = () => {
        setMenu(prev => ({ ...prev, pricing: [...prev.pricing, { name: '', mrp: 0, special: 0 }] }));
    };

    const removePricingOption = (index) => {
        setMenu(prev => ({ ...prev, pricing: prev.pricing.filter((_, i) => i !== index) }));
    };

    const handlePaymentToggle = (method) => {
        setMenu(prev => ({
            ...prev,
            paymentOptions: { ...prev.paymentOptions, [method]: !prev.paymentOptions[method] }
        }));
    };

    const handleSave = async () => {
        let finalMenuData = { ...menu };
        
        if (imageFile) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', imageFile);
            try {
                const baseUrl = import.meta.env.DEV ? 'http://localhost:3000' : '';
                const response = await fetch(`${baseUrl}/api/upload`, { method: 'POST', body: formData });
                if (!response.ok) throw new Error('Upload failed');
                const blob = await response.json();
                finalMenuData.coverImage = blob.url;
            } catch (error) {
                console.error("Image upload failed:", error);
                alert("Image upload failed!");
                setIsUploading(false);
                return;
            }
        }
        setIsUploading(false);
        onSave(finalMenuData);
    };

    return (
        <div className="menu-form-container">
            <div className="form-section">
                <h3>General Details</h3>
                <input name="title" value={menu.title} onChange={handleChange} className="title-input" placeholder="Menu Title (e.g., Monday Dinner)" />
                <div className="setting-item"><label>Order Deadline:</label><input name="orderDeadline" value={menu.orderDeadline} onChange={handleChange} /></div>
                <div className="setting-item"><label>Delivery Time:</label><input name="deliveryTime" value={menu.deliveryTime} onChange={handleChange} /></div>
            </div>

            <div className="form-section">
                <h3>Cover Image</h3>
                <img src={menu.coverImage} alt="Cover" style={{ width: '150px', marginBottom: '10px', borderRadius: '8px' }} />
                <input type="file" onChange={(e) => setImageFile(e.target.files[0])} accept="image/*" />
            </div>

            <div className="form-section">
                <h3>Menu Items</h3>
                {menu.items.map((item, index) => (
                    <div key={index} className="item-edit-form">
                        <input value={item.emoji} onChange={(e) => handleItemChange(index, 'emoji', e.target.value)} placeholder="🍛" className="emoji-input" />
                        <input value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} placeholder="Item Name" className="name-input" />
                        <input value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} placeholder="Description" className="desc-input" />
                        <button onClick={() => removeItem(index)} className="delete-item-btn">🗑️</button>
                    </div>
                ))}
                <button onClick={addItem} className="add-btn">+ Add Item</button>
            </div>

            <div className="form-section">
                <h3>Pricing Options</h3>
                {menu.pricing.map((p, index) => (
                    <div key={index} className="item-edit-form">
                        <input value={p.name} onChange={(e) => handlePricingChange(index, 'name', e.target.value)} placeholder="Option Name (e.g., 3 Roti)" />
                        <input value={p.mrp} onChange={(e) => handlePricingChange(index, 'mrp', e.target.value)} placeholder="MRP" type="number" />
                        <input value={p.special} onChange={(e) => handlePricingChange(index, 'special', e.target.value)} placeholder="Special Price" type="number" />
                        <button onClick={() => removePricingOption(index)} className="delete-item-btn">🗑️</button>
                    </div>
                ))}
                <button onClick={addPricingOption} className="add-btn">+ Add Pricing Option</button>
            </div>

            <div className="form-section">
                <h3>Payment Options</h3>
                <div className="payment-toggles">
                    <label><input type="checkbox" checked={!!menu.paymentOptions.prepaid} onChange={() => handlePaymentToggle('prepaid')} /> Enable Prepaid</label>
                    <label><input type="checkbox" checked={!!menu.paymentOptions.cod} onChange={() => handlePaymentToggle('cod')} /> Enable COD</label>
                </div>
            </div>

            <div className="menu-actions">
                <button onClick={handleSave} className="save-btn" disabled={isUploading}>{isUploading ? 'Uploading...' : 'Save Menu'}</button>
                <button onClick={onCancel} className="cancel-btn">Cancel</button>
            </div>
        </div>
    );
};

// This is the main component that now acts as a dashboard.
const MenuManagement = () => {
    const [menus, setMenus] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingMenu, setEditingMenu] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [liveMenuId, setLiveMenuId] = useState(null);

    const db = getFirestore(app);

    useEffect(() => {
        const menusQuery = collection(db, "menus");
        const unsubscribeMenus = onSnapshot(menusQuery, (snapshot) => {
            const menusList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMenus(menusList);
            setIsLoading(false);
        });
        const liveStatusRef = doc(db, "status", "liveMenu");
        const unsubscribeLive = onSnapshot(liveStatusRef, (doc) => {
            if (doc.exists()) setLiveMenuId(doc.data().activeMenuId);
        });
        return () => { unsubscribeMenus(); unsubscribeLive(); };
    }, [db]);

    const handleSaveMenu = async (menuData) => {
        if (editingMenu) {
            const menuRef = doc(db, "menus", editingMenu.id);
            await setDoc(menuRef, { ...menuData, lastUpdated: serverTimestamp() }, { merge: true });
        } else {
            await addDoc(collection(db, "menus"), { ...menuData, createdAt: serverTimestamp() });
        }
        setEditingMenu(null);
        setIsCreating(false);
    };

    const handleSetLive = async (menuId) => {
        if (window.confirm("Make this menu live?")) {
            const liveStatusRef = doc(db, "status", "liveMenu");
            await setDoc(liveStatusRef, { activeMenuId: menuId });
            alert("Menu is now live!");
        }
    };

    const handleDelete = async (menuId) => {
        if (window.confirm("Permanently delete this menu?")) {
            if (menuId === liveMenuId) {
                alert("You cannot delete a menu that is currently live. Set another menu live first.");
                return;
            }
            await deleteDoc(doc(db, "menus", menuId));
            alert("Menu deleted.");
        }
    };
    
    const startCreateNew = () => {
        setEditingMenu(null);
        setIsCreating(true);
    };

    if (isLoading) return <div>Loading menus...</div>;

    if (isCreating || editingMenu) {
        const defaultMenu = {
            title: "",
            items: [{ name: '', description: '', emoji: '' }],
            coverImage: "/src/assets/cover.jpeg", 
            pricing: [{ name: '', mrp: 0, special: 0 }],
            paymentOptions: { prepaid: true, cod: true },
            deliveryTime: "8:00 PM to 9:00 PM",
            orderDeadline: "5:00 PM"
        };
        return (
            <MenuForm 
                menuData={editingMenu || defaultMenu}
                onSave={handleSaveMenu}
                onCancel={() => { setEditingMenu(null); setIsCreating(false); }}
            />
        );
    }
    
    return (
        <div className="menu-management">
            <div className="menu-header">
                <h2>Manage Menus</h2>
                <button className="edit-btn" onClick={startCreateNew}>+ Create New Menu</button>
            </div>
            <div className="menu-list">
                {menus.map(menu => (
                    <div key={menu.id} className={`menu-list-item ${menu.id === liveMenuId ? 'live' : ''}`}>
                        <img src={menu.coverImage} alt={menu.title} className="menu-list-image" />
                        <div className="menu-info">
                            <h4>{menu.title || 'Untitled Menu'}</h4>
                            <p className="menu-item-preview">
                                {menu.items?.slice(0, 3).map(item => item.name).join(' • ')}...
                            </p>
                            <span className="menu-list-date">Created: {menu.createdAt?.toDate().toLocaleDateString() || 'N/A'}</span>
                        </div>
                        <div className="menu-item-actions">
                            <button onClick={() => handleSetLive(menu.id)} disabled={menu.id === liveMenuId} className="set-live-btn">
                                {menu.id === liveMenuId ? '✔ Live' : 'Set Live'}
                            </button>
                            <button onClick={() => setEditingMenu(menu)} className="edit-item-btn">✏️ Edit</button>
                            <button onClick={() => handleDelete(menu.id)} className="delete-item-btn">🗑️ Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MenuManagement;