import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './OrderModal.css';
// Step 1: Import your QR code image
import upiQrCode from '../assets/upi-qr-code.jpeg'; 

const OrderModal = ({ isOpen, onClose, itemData }) => {
  const { user } = useAuth();

  const [orderDetails, setOrderDetails] = useState({ /* ... your existing state ... */ });
  
  // Step 2: Replace 'showConfirmation' with a more powerful view manager
  const [view, setView] = useState('form'); // 'form', 'qrCode', or 'confirmation'

  // This useEffect logic remains the same
  useEffect(() => {
    if (isOpen && itemData?.pricing?.[0]) {
      setOrderDetails(prev => ({
        ...prev,
        address: '',
        instructions: '',
        chapatiOption: itemData.pricing[0].name,
        paymentMethod: itemData.paymentOptions?.prepaid ? 'prepaid' : 'cod'
      }));
    }
  }, [isOpen, itemData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({ ...prev, [name]: value }));
  };

  const selectedPriceOption = itemData?.pricing?.find(p => p.name === orderDetails.chapatiOption);
  const codFee = orderDetails.paymentMethod === 'cod' ? 5 : 0;
  const totalPrice = selectedPriceOption ? Number(selectedPriceOption.special) + codFee : 0;

  const handleConfirmOrder = async () => {
    // Validation remains the same
    if (!orderDetails.address.trim()) {
      alert('Please enter your delivery address');
      return;
    }
    
    // Save the order to Firestore first, regardless of payment method
    const db = getFirestore(app);
    try {
      await addDoc(collection(db, 'orders'), {
        ...orderDetails,
        userId: user.uid,
        userEmail: user.email,
        orderTime: serverTimestamp(),
        status: 'pending', // All orders start as pending
        totalAmount: totalPrice,
        menuTitle: itemData.title
      });

      // Step 3: Change the view based on the payment method
      if (orderDetails.paymentMethod === 'prepaid') {
        setView('qrCode'); // Show QR code for prepaid
      } else {
        setView('confirmation'); // Go straight to confirmation for COD
      }
    } catch (error) {
      console.error("Error placing order: ", error);
      alert("Could not place your order. Please try again.");
    }
  };

  const handleClose = () => {
    setView('form'); // Reset the view to the form
    onClose();
  };

  if (!isOpen) return null;

  // Step 4: Render the correct view based on the state
  if (view === 'qrCode') {
    return (
      <div className="modal-overlay">
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h2>Scan to Pay ₹{totalPrice}</h2>
            <p>Please complete your payment using any UPI app.</p>
            <img src={upiQrCode} alt="UPI QR Code" style={{ maxWidth: '350px', margin: '20px auto' }} />
            <button className="close-confirmation-btn" onClick={() => setView('confirmation')}>
              I have paid
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

            <div className="order-total">
              <div className="total-breakdown">
                <div className="total-row">
                  <span>Item Price:</span>
                  <span>{selectedPriceOption?.special || 0}</span>
                </div>
                {codFee > 0 && (
                  <div className="total-row">
                    <span>COD Fee:</span>
                    <span>{codFee}</span>
                  </div>
                )}
                <div className="total-row final-total">
                  <span>Total Amount:</span>
                  <span>{totalPrice}</span>
                </div>
              </div>
            </div>

            <button 
              type="button" 
              className="confirm-order-btn"
              onClick={handleConfirmOrder}
            >
              Confirm Order - {totalPrice}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;