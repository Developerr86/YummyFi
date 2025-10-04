import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from '../firebase';
import './MyAccount.css';

const MyAccount = () => {
    const { user, logout } = useAuth();
    const [userData, setUserData] = useState({
        name: '',
        phone: '',
        address: '',
        gender: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const db = getFirestore(app);
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    setUserData(prev => ({
                        ...prev,
                        ...userDoc.data()
                    }));
                } else {
                    // Set default values from auth user if available
                    setUserData(prev => ({
                        ...prev,
                        name: user.name || '',
                        email: user.email || ''
                    }));
                }
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const db = getFirestore(app);
            const userDocRef = doc(db, "users", user.uid);
            
            await setDoc(userDocRef, {
                ...userData,
                email: user.email // Ensure email is always stored
            }, { merge: true });
            
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error saving profile: ", error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="my-account-container">
                <h2>My Account</h2>
                <div className="account-card">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-account-container">
            <h2>My Account</h2>
            <div className="account-card">
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={userData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={user?.email || ''}
                        readOnly
                        disabled
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={userData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                        id="gender"
                        name="gender"
                        value={userData.gender}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <textarea
                        id="address"
                        name="address"
                        value={userData.address}
                        onChange={handleInputChange}
                        placeholder="Enter your complete address"
                        rows="4"
                    />
                </div>
                
                <button 
                    onClick={handleSave} 
                    className="save-profile-btn"
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
                
                <button onClick={logout} className="account-logout-btn">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default MyAccount;