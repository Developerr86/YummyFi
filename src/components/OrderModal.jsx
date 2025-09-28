import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import './OrderModal.css'; 
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderModal = ({ isOpen, onClose, itemData }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && itemData) {
      // Navigate to the full-page order component
      navigate(`/order/${itemData.id}`, { state: { itemData } });
      // Close the modal since we're navigating away
      onClose();
    }
  }, [isOpen, itemData, navigate, onClose]);

  // Render nothing since we're redirecting to the full-page component
  return null;
};

export default OrderModal;