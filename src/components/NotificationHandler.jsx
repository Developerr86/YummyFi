import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermission, onMessageListener } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const NotificationHandler = () => {
  const { user } = useAuth();
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  useEffect(() => {
    if (user) {
      initializeNotifications();
    }
  }, [user]);

  useEffect(() => {
    // Listen for foreground messages
    const unsubscribe = onMessageListener()
      .then((payload) => {
        console.log('Received foreground message: ', payload);
        
        // Show notification in foreground
        if (Notification.permission === 'granted') {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/vite.svg',
            tag: 'yummyfi-notification'
          });
        }
      })
      .catch((err) => console.log('Failed to receive foreground message: ', err));

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      // Request permission and get FCM token
      const fcmToken = await requestNotificationPermission();
      
      if (fcmToken && user) {
        // Check if token is different from stored token
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Only update if token is different
          if (userData.fcmToken !== fcmToken) {
            await updateDoc(userDocRef, {
              fcmToken: fcmToken,
              notificationsEnabled: true,
              lastTokenUpdate: new Date()
            });
            console.log('FCM token saved to user document');
          }
        }
        
        setNotificationPermission('granted');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const requestPermissionAgain = async () => {
    const fcmToken = await requestNotificationPermission();
    if (fcmToken) {
      setNotificationPermission('granted');
    }
  };

  // Show permission request UI if needed
  if (notificationPermission === 'default' && user) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: 1000,
        maxWidth: '300px'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Enable Notifications</h4>
        <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#666' }}>
          Get notified about new menus, order updates, and reminders!
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={requestPermissionAgain}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Enable
          </button>
          <button 
            onClick={() => setNotificationPermission('denied')}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Later
          </button>
        </div>
      </div>
    );
  }

  return null; // Component doesn't render anything when permission is granted or denied
};

export default NotificationHandler;