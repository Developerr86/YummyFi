import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderData, previousStatus } = req.body;

    if (!orderData || !orderData.userId || !orderData.status) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    // Only send notifications for specific status changes
    const notifiableStatuses = ['confirmed', 'cancelled', 'delivered'];
    if (!notifiableStatuses.includes(orderData.status)) {
      return res.status(200).json({ 
        success: true, 
        message: 'Status change does not require notification' 
      });
    }

    const db = admin.firestore();
    
    // Get the user's FCM token
    const userDoc = await db.collection('users').doc(orderData.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    if (!userData.fcmToken || !userData.notificationsEnabled) {
      return res.status(200).json({ 
        success: true, 
        message: 'User does not have notifications enabled' 
      });
    }

    // Prepare notification based on status
    let title, body, icon;
    
    switch (orderData.status) {
      case 'confirmed':
        title = '✅ Order Confirmed!';
        body = `Your order #${orderData.id?.slice(-6) || 'N/A'} has been confirmed and is being prepared.`;
        icon = '/vite.svg';
        break;
      case 'cancelled':
        title = '❌ Order Cancelled';
        body = `Your order #${orderData.id?.slice(-6) || 'N/A'} has been cancelled. Contact support if you have questions.`;
        icon = '/vite.svg';
        break;
      case 'delivered':
        title = '🎉 Order Delivered!';
        body = `Your order #${orderData.id?.slice(-6) || 'N/A'} has been delivered. Enjoy your meal!`;
        icon = '/vite.svg';
        break;
      default:
        return res.status(400).json({ error: 'Invalid status for notification' });
    }

    // Send the notification
    const message = {
      token: userData.fcmToken,
      notification: {
        title,
        body,
        icon
      },
      data: {
        orderId: orderData.id || '',
        status: orderData.status,
        type: 'order_status'
      },
      webpush: {
        fcm_options: {
          link: '/my-orders'
        }
      }
    };

    try {
      const response = await admin.messaging().send(message);
      
      return res.status(200).json({
        success: true,
        messageId: response,
        message: `Order status notification sent to user ${orderData.userId}`
      });

    } catch (error) {
      console.error('Error sending notification:', error);
      
      // If token is invalid, clean it up
      if (error.code === 'messaging/registration-token-not-registered') {
        await db.collection('users').doc(orderData.userId).update({
          fcmToken: admin.firestore.FieldValue.delete(),
          notificationsEnabled: false
        });
        
        return res.status(400).json({ 
          error: 'Invalid FCM token, cleaned up',
          code: 'INVALID_TOKEN' 
        });
      }
      
      throw error;
    }

  } catch (error) {
    console.error('Error in order status notification:', error);
    return res.status(500).json({ 
      error: 'Failed to send notification',
      details: error.message 
    });
  }
}