import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import './OrderModal.css'; 

const OrderModal = ({ isOpen, onClose, itemData }) => {
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState({});
  const [view, setView] = useState('form');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (isOpen && itemData?.pricing?.[0]) {
      setOrderDetails({
        address: '',
        instructions: '',
        chapatiOption: itemData.pricing[0].name,
        paymentMethod: itemData.paymentOptions?.prepaid ? 'prepaid' : 'cod',
        quantity: 1
      });
    }
  }, [isOpen, itemData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({ ...prev, [name]: value }));
  };

  const selectedPriceOption = itemData?.pricing?.find(p => p.name === orderDetails.chapatiOption);
  const codFee = orderDetails.paymentMethod === 'cod' ? 5 * (orderDetails.quantity || 1) : 0;
  const basePrice = selectedPriceOption ? Number(selectedPriceOption.special) * (orderDetails.quantity || 1) : 0;
  const totalPrice = basePrice + codFee;

  const handleQuantityChange = (change) => {
    const currentQuantity = orderDetails.quantity || 1;
    const newQuantity = currentQuantity + change;
    
    if (newQuantity >= 1 && newQuantity <= 15) {
      setOrderDetails(prev => ({ ...prev, quantity: newQuantity }));
    }
  };

  const handleConfirmOrder = async () => {
    if (!orderDetails.address.trim()) {
      alert('Please enter your delivery address');
      return;
    }
    
    const db = getFirestore(app);
    try {
      // Create order with pending_payment status for prepaid, pending for COD
      const orderData = {
        ...orderDetails,
        userId: user.uid,
        userEmail: user.email,
        customerName: user.name || user.email,
        orderTime: serverTimestamp(),
        status: orderDetails.paymentMethod === 'prepaid' ? 'pending_payment' : 'pending',
        totalAmount: totalPrice,
        menuTitle: itemData.title,
        quantity: orderDetails.quantity || 1
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Store the order ID for UPI payment
      setOrderId(docRef.id);

      if (orderDetails.paymentMethod === 'prepaid') {
        setView('makePayment');
      } else {
        setView('confirmation');
      }
    } catch (error) {
      console.error("Error placing order: ", error);
      alert("Could not place your order. Please try again.");
    }
  };

  // Generate UPI Intent string
  const generateUPIIntent = () => {
    const businessUpiId = "8736866828@okbizaxis"; // Placeholder for business UPI ID
    return `upi://pay?pa=${businessUpiId}&pn=YummyFi&am=${totalPrice}&tn=${orderId}`;
  };

  const handleClose = () => {
    setView('form');
    setOrderId(null);
    onClose();
  };

  if (!isOpen) return null;

  // Make Payment view with dynamic UPI QR code
  if (view === 'makePayment') {
    const upiIntent = generateUPIIntent();
    
    return (
      <div className="modal-overlay">
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h2>Complete Payment</h2>
            <p className="payment-amount">Pay ₹{totalPrice}</p>
            <p className="payment-instructions">
              Scan the QR code with your UPI app or click the button below to pay.
            </p>
            
            <div className="qr-code-container">
              <QRCodeSVG 
                value={upiIntent} 
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
            
            <a 
              href={upiIntent} 
              className="upi-pay-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pay with UPI App
            </a>
            
            <div className="payment-note">
              <p><strong>Order ID:</strong> {orderId}</p>
              <p>Please include this Order ID in your payment note.</p>
            </div>
            
            <button 
              className="close-confirmation-btn" 
              onClick={handleClose}
            >
              I have paid / Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'confirmation') {
    return (
      <div className="modal-overlay">
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <div className="success-icon">👍</div>
            <h2>Order Placed!</h2>
            <p>Thank you! Your order has been received and is pending confirmation.</p>
            <div className="order-summary">
              <h3>Order Details:</h3>
              <p><strong>Menu:</strong> {itemData?.title}</p>
              <p><strong>Option:</strong> {orderDetails.chapatiOption}</p>
              <p><strong>Quantity:</strong> {orderDetails.quantity || 1}</p>
              <p><strong>Payment:</strong> {orderDetails.paymentMethod === 'prepaid' ? 'Prepaid (Pending)' : 'Cash on Delivery'}</p>
              <p><strong>Total:</strong> ₹{totalPrice}</p>
            </div>
            <button className="close-confirmation-btn" onClick={handleClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="order-modal">
        <div className="modal-header">
          <h2>Complete Your Order</h2>
          <button className="close-btn" onClick={handleClose}>x</button>
        </div>

        <div className="modal-content">
          <div className="order-item-summary">
            <h3>{itemData?.title} </h3>
          </div>

          <form className="order-form">
            <div className="form-section">
              <h3> Delivery Address</h3>
              <textarea
                name="address"
                value={orderDetails.address}
                onChange={handleInputChange}
                placeholder="Enter your complete delivery address..."
                className="address-input"
                rows="3"
                required
              />
            </div>

            <div className="form-section">
              <h3> Delivery Instructions (Optional)</h3>
              <textarea
                name="instructions"
                value={orderDetails.instructions}
                onChange={handleInputChange}
                placeholder="Any special instructions..."
                className="instructions-input"
                rows="2"
              />
            </div>

            <div className="form-section">
              <h3> Select Your Option</h3>
              <div className="option-selector">
                {itemData?.pricing?.map((option, index) => (
                  <label key={index} className={`selectable-card ${orderDetails.chapatiOption === option.name ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="chapatiOption"
                      value={option.name}
                      checked={orderDetails.chapatiOption === option.name}
                      onChange={handleInputChange}
                    />
                    <div className="option-details">
                      <span className="option-name">{option.name}</span>
                      <div className="option-pricing">
                        <span className="mrp">MRP: {option.mrp}</span>
                        <span className="special">Special: {option.special}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3>Payment Method</h3>
              <div className="option-selector">
                {itemData.paymentOptions?.prepaid && (
                  <label className={`selectable-card ${orderDetails.paymentMethod === 'prepaid' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="prepaid"
                      checked={orderDetails.paymentMethod === 'prepaid'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-details">
                      <span className="payment-name"> Prepaid</span>
                      <span className="payment-desc">No extra charges</span>
                    </div>
                  </label>
                )}
                {itemData.paymentOptions?.cod && (
                  <label className={`selectable-card ${orderDetails.paymentMethod === 'cod' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={orderDetails.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-details">
                      <span className="payment-name">Cash on Delivery</span>
                      <span className="payment-desc">extra per parcel</span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>Quantity</h3>
              <div className="quantity-selector">
                <button 
                  type="button" 
                  className="quantity-btn" 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={orderDetails.quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-display">{orderDetails.quantity || 1}</span>
                <button 
                  type="button" 
                  className="quantity-btn" 
                  onClick={() => handleQuantityChange(1)}
                  disabled={orderDetails.quantity >= 15}
                >
                  +
                </button>
              </div>
              <p className="quantity-note">Maximum 15 orders at once</p>
            </div>

            <div className="order-total">
              <div className="total-breakdown">
                <div className="total-row">
                  <span>Item Price (×{orderDetails.quantity || 1}):</span>
                  <span>₹{selectedPriceOption?.special || 0} × {orderDetails.quantity || 1} = ₹{basePrice}</span>
                </div>
                {codFee > 0 && (
                  <div className="total-row">
                    <span>COD Fee (×{orderDetails.quantity || 1}):</span>
                    <span>₹5 × {orderDetails.quantity || 1} = ₹{codFee}</span>
                  </div>
                )}
                <div className="total-row final-total">
                  <span>Total Amount:</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>
            </div>

            <button 
              type="button" 
              className="confirm-order-btn"
              onClick={handleConfirmOrder}
            >
              Confirm Order - ₹{totalPrice}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;