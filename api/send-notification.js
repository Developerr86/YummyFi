import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // You'll need to add your Firebase service account key as environment variables
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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fcmToken, payload } = req.body;

    // Validate required fields
    if (!fcmToken || !payload || !payload.title || !payload.body) {
      return res.status(400).json({ 
        error: 'Missing required fields: fcmToken, payload.title, payload.body' 
      });
    }

    // Prepare the message
    const message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/vite.svg'
      },
      data: payload.data || {},
      webpush: {
        fcm_options: {
          link: payload.link || '/'
        }
      }
    };

    // Send the notification
    const response = await admin.messaging().send(message);
    
    console.log('Successfully sent message:', response);
    
    return res.status(200).json({ 
      success: true, 
      messageId: response 
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    
    // Handle specific FCM errors
    if (error.code === 'messaging/registration-token-not-registered') {
      return res.status(400).json({ 
        error: 'Invalid FCM token', 
        code: 'INVALID_TOKEN' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to send notification',
      details: error.message 
    });
  }
}