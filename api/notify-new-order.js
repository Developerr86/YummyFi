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
    const { orderData } = req.body;

    if (!orderData || !orderData.id) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    const db = admin.firestore();
    
    // Get all admin users with FCM tokens
    const adminsSnapshot = await db.collection('users')
      .where('role', '==', 'admin')
      .where('fcmToken', '!=', null)
      .where('notificationsEnabled', '==', true)
      .get();

    if (adminsSnapshot.empty) {
      return res.status(200).json({ 
        success: true, 
        message: 'No admin users with FCM tokens found' 
      });
    }

    const notifications = [];
    const failedTokens = [];

    // Calculate total amount if items exist
    let totalAmount = 0;
    if (orderData.items && Array.isArray(orderData.items)) {
      totalAmount = orderData.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
    }

    // Prepare notification payload
    const title = '🔔 New Order Received!';
    const body = `Order #${orderData.id.slice(-6)} from ${orderData.customerName || 'Customer'}${totalAmount > 0 ? ` - ₹${totalAmount}` : ''}`;

    // Send notifications to all admins
    for (const adminDoc of adminsSnapshot.docs) {
      const adminData = adminDoc.data();
      
      if (adminData.fcmToken) {
        try {
          const message = {
            token: adminData.fcmToken,
            notification: {
              title,
              body,
              icon: '/vite.svg'
            },
            data: {
              orderId: orderData.id,
              customerName: orderData.customerName || '',
              totalAmount: totalAmount.toString(),
              type: 'new_order'
            },
            webpush: {
              fcm_options: {
                link: '/admin'
              }
            }
          };

          const response = await admin.messaging().send(message);
          notifications.push({ adminId: adminDoc.id, messageId: response });
          
        } catch (error) {
          console.error(`Failed to send notification to admin ${adminDoc.id}:`, error);
          
          // If token is invalid, mark for cleanup
          if (error.code === 'messaging/registration-token-not-registered') {
            failedTokens.push(adminDoc.id);
          }
        }
      }
    }

    // Clean up invalid tokens
    if (failedTokens.length > 0) {
      const batch = db.batch();
      failedTokens.forEach(adminId => {
        const adminRef = db.collection('users').doc(adminId);
        batch.update(adminRef, { 
          fcmToken: admin.firestore.FieldValue.delete(),
          notificationsEnabled: false 
        });
      });
      await batch.commit();
    }

    return res.status(200).json({
      success: true,
      sentNotifications: notifications.length,
      cleanedTokens: failedTokens.length,
      message: `Sent ${notifications.length} notifications to admins for new order`
    });

  } catch (error) {
    console.error('Error sending new order notifications:', error);
    return res.status(500).json({ 
      error: 'Failed to send notifications',
      details: error.message 
    });
  }
}