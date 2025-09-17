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
  // This endpoint can be called by Vercel cron or manually
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = admin.firestore();
    
    // Check if there's a live menu today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const menusSnapshot = await db.collection('menus')
      .where('date', '==', todayStr)
      .where('isLive', '==', true)
      .limit(1)
      .get();

    if (menusSnapshot.empty) {
      return res.status(200).json({ 
        success: true, 
        message: 'No live menu found for today, skipping reminders' 
      });
    }

    // Get all users with FCM tokens who have notifications enabled
    // Exclude users who already ordered today
    const usersSnapshot = await db.collection('users')
      .where('fcmToken', '!=', null)
      .where('notificationsEnabled', '==', true)
      .where('role', '==', 'user') // Only send to regular users, not admins
      .get();

    if (usersSnapshot.empty) {
      return res.status(200).json({ 
        success: true, 
        message: 'No users with FCM tokens found' 
      });
    }

    // Get today's orders to exclude users who already ordered
    const ordersSnapshot = await db.collection('orders')
      .where('date', '==', todayStr)
      .get();

    const usersWhoOrdered = new Set();
    ordersSnapshot.forEach(doc => {
      const orderData = doc.data();
      if (orderData.userId) {
        usersWhoOrdered.add(orderData.userId);
      }
    });

    const notifications = [];
    const failedTokens = [];

    // Prepare notification payload
    const payload = {
      title: '⏰ Last Chance to Order!',
      body: `Don't miss out on today's delicious menu. Order deadline is approaching soon!`,
      icon: '/vite.svg',
      link: '/'
    };

    // Send notifications to users who haven't ordered yet
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Skip users who already ordered today
      if (usersWhoOrdered.has(userId)) {
        continue;
      }
      
      if (userData.fcmToken) {
        try {
          const message = {
            token: userData.fcmToken,
            notification: {
              title: payload.title,
              body: payload.body,
              icon: payload.icon
            },
            data: {
              type: 'order_reminder',
              date: todayStr
            },
            webpush: {
              fcm_options: {
                link: payload.link
              }
            }
          };

          const response = await admin.messaging().send(message);
          notifications.push({ userId: userId, messageId: response });
          
        } catch (error) {
          console.error(`Failed to send reminder to user ${userId}:`, error);
          
          // If token is invalid, mark for cleanup
          if (error.code === 'messaging/registration-token-not-registered') {
            failedTokens.push(userId);
          }
        }
      }
    }

    // Clean up invalid tokens
    if (failedTokens.length > 0) {
      const batch = db.batch();
      failedTokens.forEach(userId => {
        const userRef = db.collection('users').doc(userId);
        batch.update(userRef, { 
          fcmToken: admin.firestore.FieldValue.delete(),
          notificationsEnabled: false 
        });
      });
      await batch.commit();
    }

    // Log the reminder execution
    await db.collection('notification_logs').add({
      type: 'order_reminder',
      date: todayStr,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      sentCount: notifications.length,
      cleanedTokens: failedTokens.length,
      totalUsers: usersSnapshot.size,
      usersWhoOrdered: usersWhoOrdered.size
    });

    return res.status(200).json({
      success: true,
      sentReminders: notifications.length,
      cleanedTokens: failedTokens.length,
      totalUsers: usersSnapshot.size,
      usersWhoOrdered: usersWhoOrdered.size,
      message: `Sent ${notifications.length} order reminders`
    });

  } catch (error) {
    console.error('Error sending order reminders:', error);
    return res.status(500).json({ 
      error: 'Failed to send reminders',
      details: error.message 
    });
  }
}