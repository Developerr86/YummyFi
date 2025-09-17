import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { app } from '../firebase';
import './OrdersManagement.css';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const db = getFirestore(app);
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('orderTime', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('--- Firestore returned orders: ---', ordersData);
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    const db = getFirestore(app);
    const orderRef = doc(db, 'orders', orderId);
    try {
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'pending_payment': return '#fd7e14';
      case 'confirmed': return '#17a2b8';
      case 'preparing': return '#fd7e14';
      case 'out_for_delivery': return '#6f42c1';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatTime = (time) => {
    if (time && typeof time.toDate === 'function') {
      return time.toDate().toLocaleString();
    }
    return new Date(time).toLocaleString();
  };

  return (
    <div className="orders-management">
      <div className="orders-header">
        <h2>Today's Orders ({orders.length})</h2>
        <div className="orders-stats">
          <div className="stat-card">
            <span className="stat-number">{orders.filter(o => o.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{orders.filter(o => o.status === 'pending_payment').length}</span>
            <span className="stat-label">Pending Payment</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{orders.filter(o => o.status === 'confirmed').length}</span>
            <span className="stat-label">Confirmed</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{orders.filter(o => o.status === 'delivered').length}</span>
            <span className="stat-label">Delivered</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">₹{orders.reduce((sum, o) => sum + o.totalAmount, 0)}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>
      </div>

      <div className="orders-content">
        <div className="orders-list">
          {orders.map(order => (
            <div 
              key={order.id} 
              className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="order-header">
                <div className="order-info">
                  <h3>{order.customerName || order.userEmail}</h3>
                  <p className="order-email">{order.userEmail}</p>
                  <p className="order-time">{formatTime(order.orderTime)}</p>
                </div>
                <div className="order-status">
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="order-amount">₹{order.totalAmount}</span>
                </div>
              </div>
              <div className="order-summary">
                <span>{order.chapatiOption} (Qty: {order.quantity || 1})</span>
                <span>{order.paymentMethod === 'prepaid' ? 'Prepaid' : 'COD'}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedOrder && (
          <div className="order-details">
            <div className="details-header">
              <h3>Order Details - #{selectedOrder.id.substring(0, 7)}</h3>
              <button className="close-details" onClick={() => setSelectedOrder(null)}>×</button>
            </div>

            <div className="details-content">
               <div className="detail-section">
                <h4>Customer Information</h4>
                {/* CORRECTED: Use customerName with a fallback to userEmail */}
                <p><strong>Name:</strong> {selectedOrder.customerName || selectedOrder.userEmail}</p>
                {/* CORRECTED: Use the correct field 'userEmail' */}
                <p><strong>Email:</strong> {selectedOrder.userEmail}</p>
                <p><strong>Order Time:</strong> {formatTime(selectedOrder.orderTime)}</p>
              </div>

              <div className="detail-section">
                <h4>Delivery Address</h4>
                <p>{selectedOrder.address}</p>
                {selectedOrder.instructions && (
                  <div>
                    <strong>Instructions:</strong>
                    <p className="instructions">{selectedOrder.instructions}</p>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>Order Details</h4>
                <p><strong>Menu:</strong> {selectedOrder.menuTitle}</p>
                <p><strong>Option:</strong> {selectedOrder.chapatiOption}</p>
                <p><strong>Quantity:</strong> {selectedOrder.quantity || 1}</p>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod === 'prepaid' ? 'Prepaid' : 'Cash on Delivery'}</p>
                <p><strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}</p>
              </div>

              <div className="detail-section">
                <h4>Update Status</h4>
                
                {/* Special handling for pending_payment orders */}
                {selectedOrder.status === 'pending_payment' && (
                  <div className="payment-confirmation">
                    <p className="payment-notice">
                      <strong>Payment Pending:</strong> Customer has placed order but payment confirmation required.
                    </p>
                    <button
                      className="confirm-payment-btn"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                    >
                      ✓ Confirm Payment Received
                    </button>
                  </div>
                )}
                
                <div className="status-buttons">
                  {['pending', 'pending_payment', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map(status => (
                    <button
                      key={status}
                      className={`status-btn ${selectedOrder.status === status ? 'active' : ''}`}
                      onClick={() => updateOrderStatus(selectedOrder.id, status)}
                      style={{ backgroundColor: getStatusColor(status) }}
                    >
                      {status.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;
