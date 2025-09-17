// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDSWcepTylLa2avucg8LcY-XtDo78BFMa0",
  authDomain: "yummyfi.firebaseapp.com",
  projectId: "yummyfi",
  storageBucket: "yummyfi.firebasestorage.app",
  messagingSenderId: "620173656169",
  appId: "1:620173656169:web:6610c303ba3b1ed1dce2f8",
  measurementId: "G-Z8NGG52S3F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);
const db = getFirestore(app);
const auth = getAuth(app);

// VAPID key for FCM (you'll need to generate this in Firebase Console)
const vapidKey = "BKQoqPmvdvADxV-Rj9ZS5upyxhy81bSV7O6TZzaZlTEObi6L9nsy_KMu1gKVp25FxUwTFw9hSsVtmbFyTUipUoM"; // Replace with your actual VAPID key

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    console.log('Requesting notification permission...');
    
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Register service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);
      }
      
      // Get FCM token
      const token = await getToken(messaging, { 
        vapidKey: vapidKey,
        serviceWorkerRegistration: await navigator.serviceWorker.getRegistration()
      });
      
      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('No registration token available');
        return null;
      }
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Foreground message received: ', payload);
      resolve(payload);
    });
  });

export { app, analytics, messaging, db, auth };