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
    const { menuData } = req.body;

    if (!menuData || !menuData.isLive) {
      return res.status(400).json({ error: 'Invalid menu data or menu is not live' });
    }

    const db = admin.firestore();
    
    // Get all users with FCM tokens who have notifications enabled
    const usersSnapshot = await db.collection('users')
      .where('fcmToken', '!=', null)
      .where('notificationsEnabled', '==', true)
      .get();

    if (usersSnapshot.empty) {
      return res.status(200).json({ 
        success: true, 
        message: 'No users with FCM tokens found' 
      });
    }

    const notifications = [];
    const failedTokens = [];

    // Prepare notification payload
    const payload = {
      title: '🍽️ New Menu Available!',
      body: `Today's delicious menu is now live. Check it out and place your order!`,
      icon: '/vite.svg',
      link: '/'
    };

    // Send notifications to all users
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      if (userData.fcmToken) {
        try {
          const message = {
            token: userData.fcmToken,
            notification: {
              title: payload.title,
              body: payload.body,
              icon: payload.icon
            },
            webpush: {
              fcm_options: {
                link: payload.link
              }
            }
          };

          const response = await admin.messaging().send(message);
          notifications.push({ userId: userDoc.id, messageId: response });
          
        } catch (error) {
          console.error(`Failed to send notification to user ${userDoc.id}:`, error);
          
          // If token is invalid, mark for cleanup
          if (error.code === 'messaging/registration-token-not-registered') {
            failedTokens.push(userDoc.id);
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

    return res.status(200).json({
      success: true,
      sentNotifications: notifications.length,
      cleanedTokens: failedTokens.length,
      message: `Sent ${notifications.length} notifications for new menu`
    });

  } catch (error) {
    console.error('Error sending new menu notifications:', error);
    return res.status(500).json({ 
      error: 'Failed to send notifications',
      details: error.message 
    });
  }
}