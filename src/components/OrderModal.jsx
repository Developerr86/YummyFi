import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './OrderModal.css';

const OrderModal = ({ isOpen, onClose, itemData }) => {

  const {user} = useAuth();

  const [orderDetails, setOrderDetails] = useState({
    address: '',
    instructions: '',
    // Set the default to the name of the first pricing option
    chapatiOption: itemData?.pricing?.[0]?.name || '', 
    paymentMethod: 'prepaid'
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirmOrder = async () => {
    if (!orderDetails.address.trim()) {
      alert('Please enter your delivery address');
      return;
    }

    const db = getFirestore(app);
    try {
      // Add a new document to the 'orders' collection
      await addDoc(collection(db, 'orders'), {
        // Include all the order details
        ...orderDetails,
        userId: user.uid, // VERY IMPORTANT: Link the order to the user
        userEmail: user.email,
        orderTime: new Date(), // Use a server timestamp for accuracy
        status: 'pending', // Initial status
        totalPrice: totalPrice,
        menuTitle: itemData.title
      });
    setShowConfirmation(true);
    } catch (error) {
      console.error("Error placing order: ", error);
      alert("Could not place your order. Please try again.");
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    onClose();
    setOrderDetails({
      address: '',
      instructions: '',
      chapatiOption: 'C3',
      paymentMethod: 'prepaid'
    });
  };

  if (!isOpen) return null;

  const selectedPriceOption = itemData?.pricing.find(p => p.name === orderDetails.chapatiOption);
  const codFee = orderDetails.paymentMethod === 'cod' ? 5 : 0;
  const totalPrice = selectedPriceOption ? selectedPriceOption.special + codFee : 0;
  
  if (showConfirmation) {
    return (
      <div className="modal-overlay">
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <div className="success-icon">✅</div>
            <h2>Order Confirmed!</h2>
            <p>Thank you for your order! Your delicious meal is being prepared.</p>
            <div className="order-summary">
              <h3>Order Details:</h3>
              <p><strong>Items:</strong> {itemData?.title}</p>
              <p><strong>Chapati:</strong> {orderDetails.chapatiOption} ({selectedPrice?.chapati} pieces)</p>
              <p><strong>Payment:</strong> {orderDetails.paymentMethod === 'prepaid' ? 'Prepaid' : 'Cash on Delivery'}</p>
              <p><strong>Total:</strong> ₹{totalPrice}</p>
              <p><strong>Delivery:</strong> {itemData?.deliveryTime}</p>
            </div>
            <button className="close-confirmation-btn" onClick={handleCloseConfirmation}>
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
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="order-item-summary">
            <h3>🌙✨ {itemData?.title} ✨🌙</h3>
            <div className="item-preview">
              {itemData?.items.map((item, index) => (
                <span key={index} className="item-tag">
                  {item.emoji} {item.name}
                </span>
              ))}
            </div>
          </div>

          <form className="order-form">
            <div className="form-section">
              <h3>📍 Delivery Address</h3>
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
              <h3>📝 Delivery Instructions (Optional)</h3>
              <textarea
                name="instructions"
                value={orderDetails.instructions}
                onChange={handleInputChange}
                placeholder="Any special instructions for delivery..."
                className="instructions-input"
                rows="2"
              />
            </div>

            <div className="form-section">
              <h3>🍞 Chapati Option</h3>
              <div className="chapati-options">
                {itemData?.pricing?.map((option, index) => (
                  <label key={index} className="chapati-option">
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
                        <span className="mrp">MRP: ₹{option.mrp}</span>
                        <span className="special">Special: ₹{option.special}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3>💳 Payment Method</h3>
              <div className="payment-options">
                {itemData.paymentOptions?.prepaid && (
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="prepaid"
                      checked={orderDetails.paymentMethod === 'prepaid'}
                      onChange={handleInputChange}
                    />
                    {/* ... details ... */}
                  </label>
                )}
                {itemData.paymentOptions?.cod && (
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={orderDetails.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                    />
                    {/* ... details ... */}
                  </label>
                )}
              </div>

            </div>

            <div className="order-total">
              <div className="total-breakdown">
                <div className="total-row">
                  <span>Item Price:</span>
                  <span>₹{selectedPrice?.special}</span>
                </div>
                {codFee > 0 && (
                  <div className="total-row">
                    <span>COD Fee:</span>
                    <span>₹{codFee}</span>
                  </div>
                )}
                <div className="total-row final-total">
                  <span>Total Amount:</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="delivery-reminder">
              <p>⏱️ Order before {itemData?.orderDeadline}</p>
              <p>🚚 Delivery: {itemData?.deliveryTime}</p>
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
