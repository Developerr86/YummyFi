import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './OrderModal.css';

const OrderModal = ({ isOpen, onClose, itemData }) => {
  const { user } = useAuth();

  const [orderDetails, setOrderDetails] = useState({
    address: '',
    instructions: '',
    chapatiOption: '', // Start with an empty selection
    paymentMethod: 'prepaid'
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  // This effect ensures we set a valid default selection when the modal opens
  useEffect(() => {
    if (itemData?.pricing?.[0]) {
      setOrderDetails(prev => ({
        ...prev,
        chapatiOption: itemData.pricing[0].name
      }));
    }
  }, [isOpen, itemData]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({ ...prev, [name]: value }));
  };

  // FIX: This is the corrected price calculation logic
  const selectedPriceOption = itemData?.pricing?.find(p => p.name === orderDetails.chapatiOption);
  const codFee = orderDetails.paymentMethod === 'cod' ? 5 : 0;
  const totalPrice = selectedPriceOption ? Number(selectedPriceOption.special) + codFee : 0;


  const handleConfirmOrder = async () => {
    if (!orderDetails.address.trim()) {
      alert('Please enter your delivery address');
      return;
    }
    if (!orderDetails.chapatiOption) {
      alert('Please select a pricing option.');
      return;
    }

    const db = getFirestore(app);
    try {
      await addDoc(collection(db, 'orders'), {
        ...orderDetails,
        userId: user.uid,
        userEmail: user.email,
        orderTime: serverTimestamp(), // Use the server's timestamp
        status: 'pending',
        totalAmount: totalPrice, // Use the correctly calculated totalPrice
        menuTitle: itemData.title
      });
      setShowConfirmation(true);
    } catch (error)      {
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
      chapatiOption: itemData?.pricing?.[0]?.name || '',
      paymentMethod: 'prepaid'
    });
  };

  if (!isOpen) return null;

  // The rest of your component's JSX
  // It will now use the corrected `totalPrice` and `selectedPriceOption` variables
  // ...
  // For example, in the confirmation modal:
  // <p><strong>Chapati:</strong> {orderDetails.chapatiOption} ({selectedPriceOption?.name})</p>
  // <p><strong>Total:</strong> ₹{totalPrice}</p>
  
  return (
      <div className="modal-overlay">
          {/* ... The rest of your JSX is here ... */}
          {/* Make sure the radio buttons and price display use the new logic */}

          {/* This is the part for chapati options */}
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

          {/* This is the part for payment options */}
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
                      <div className="payment-details">
                        <span className="payment-name">✅ Prepaid</span>
                        <span className="payment-desc">No extra charges</span>
                      </div>
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
                      <div className="payment-details">
                          <span className="payment-name">✅ Cash on Delivery</span>
                          <span className="payment-desc">₹5 extra per parcel</span>
                      </div>
                  </label>
              )}
          </div>

          {/* This is the part for the total */}
          <div className="order-total">
            <div className="total-breakdown">
                <div className="total-row">
                    <span>Item Price:</span>
                    <span>₹{selectedPriceOption?.special || 0}</span>
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

        <button 
          type="button" 
          className="confirm-order-btn"
          onClick={handleConfirmOrder}
        >
          Confirm Order - ₹{totalPrice}
        </button>
      </div>
  );
};

export default OrderModal;