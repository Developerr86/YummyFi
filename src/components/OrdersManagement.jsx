import React, { useState, useEffect } from 'react';
import './OrdersManagement.css';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock orders data - in real app, this would come from API
  useEffect(() => {
    const mockOrders = [
      {
        id: 1,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        address: '123 Main St, Apartment 4B, Near Central Park, New York, NY 10001',
        instructions: 'Ring the doorbell twice, leave at door if no answer',
        chapatiOption: 'C3',
        chapatiCount: 3,
        paymentMethod: 'prepaid',
        totalAmount: 59,
        orderTime: '2024-01-15 14:30:00',
        status: 'pending',
        menuTitle: "Tonight's YummyFi Dinner Delight!"
      },
      {
        id: 2,
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        address: '456 Oak Avenue, Building C, Floor 2, Los Angeles, CA 90210',
        instructions: 'Call when you arrive, security gate requires buzzing',
        chapatiOption: 'C4',
        chapatiCount: 4,
        paymentMethod: 'cod',
        totalAmount: 68,
        orderTime: '2024-01-15 15:15:00',
        status: 'confirmed',
        menuTitle: "Tonight's YummyFi Dinner Delight!"
      },
      {
        id: 3,
        customerName: 'Mike Johnson',
        customerEmail: 'mike@example.com',
        address: '789 Pine Street, House #12, Chicago, IL 60601',
        instructions: '',
        chapatiOption: 'C3',
        chapatiCount: 3,
        paymentMethod: 'prepaid',
        totalAmount: 59,
        orderTime: '2024-01-15 16:45:00',
        status: 'delivered',
        menuTitle: "Tonight's YummyFi Dinner Delight!"
      }
    ];
    setOrders(mockOrders);
  }, []);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#17a2b8';
      case 'preparing': return '#fd7e14';
      case 'out_for_delivery': return '#6f42c1';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString();
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
                  <h3>{order.customerName}</h3>
                  <p className="order-email">{order.customerEmail}</p>
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
                <span>{order.chapatiOption} ({order.chapatiCount} Chapati)</span>
                <span>{order.paymentMethod === 'prepaid' ? 'Prepaid' : 'COD'}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedOrder && (
          <div className="order-details">
            <div className="details-header">
              <h3>Order Details - #{selectedOrder.id}</h3>
              <button 
                className="close-details"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>

            <div className="details-content">
              <div className="detail-section">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
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
                <p><strong>Chapati Option:</strong> {selectedOrder.chapatiOption} ({selectedOrder.chapatiCount} pieces)</p>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod === 'prepaid' ? 'Prepaid' : 'Cash on Delivery'}</p>
                <p><strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}</p>
              </div>

              <div className="detail-section">
                <h4>Update Status</h4>
                <div className="status-buttons">
                  {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map(status => (
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
