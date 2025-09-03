import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFirestore, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { app } from '../firebase';
import './MyOrders.css';

const MyOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const db = getFirestore(app);
        const ordersRef = collection(db, "orders");
        
        // Create a query to get only the orders for the current user
        const q = query(
            ordersRef, 
            where("userId", "==", user.uid),
            orderBy("orderTime", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrders(userOrders);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [user]);

    if (loading) {
        return <div>Loading your orders...</div>;
    }

    return (
        <div className="my-orders-container">
            <h2>My Orders</h2>
            {orders.length === 0 ? (
                <p>You haven't placed any orders yet.</p>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className={`order-history-card ${order.status === 'delivered' ? 'delivered' : ''}`}>
                            <div className="order-history-header">
                                <h4>{order.menuTitle}</h4>
                                <span className={`status-pill ${order.status}`}>{order.status}</span>
                            </div>
                            <div className="order-history-body">
                                <p><strong>Option:</strong> {order.chapatiOption}</p>
                                <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                                <p><strong>Date:</strong> {order.orderTime.toDate().toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;