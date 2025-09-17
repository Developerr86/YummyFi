# 🍽️ YummyFi - Smart Food Ordering Platform

YummyFi is a comprehensive food ordering platform, featuring a modern React frontend with
Firebase backend, real-time push notifications, and separate interfaces for
customers and administrators.

## ✨ Features

### 🔐 User Management

- **Secure Authentication**: Firebase Auth with email/password
- **Role-based Access**: Separate interfaces for users and admins
- **User Profiles**: Account management and preferences

### 🍕 Menu Management

- **Dynamic Menus**: Daily menu creation and management
- **Live Menu Publishing**: Real-time menu activation
- **Image Upload**: Menu item photos with Vercel Blob storage
- **Pricing Management**: Flexible pricing for menu items

### 📱 Order System

- **Intuitive Ordering**: Easy-to-use order placement
- **Order Tracking**: Real-time order status updates
- **Order History**: Complete order history for users
- **QR Code Integration**: Quick payment processing

### 🔔 Push Notifications

- **Real-time Alerts**: Instant notifications for order updates
- **Menu Notifications**: Alerts when new menus go live
- **Admin Notifications**: New order alerts for administrators
- **Scheduled Reminders**: Daily order deadline reminders
- **Smart Targeting**: Notifications only to relevant users

### 👨‍💼 Admin Dashboard

- **Order Management**: View, update, and track all orders
- **Menu Control**: Create, edit, and publish daily menus
- **User Analytics**: Monitor user activity and orders
- **Notification Center**: Send custom notifications

### 📱 Mobile-First Design

- **Responsive Layout**: Optimized for all device sizes
- **Touch-Friendly**: Mobile-optimized user interface
- **Progressive Web App**: App-like experience on mobile

## 🛠️ Tech Stack

### Frontend

- **React 19.1.0** - Modern React with latest features
- **Vite 7.0.4** - Fast build tool and dev server
- **React Router 7.6.3** - Client-side routing
- **CSS3** - Custom styling with responsive design

### Backend & Services

- **Firebase 12.1.0** - Authentication, Firestore database, Cloud Messaging
- **Vercel** - Serverless functions and hosting
- **Vercel Blob** - Image storage and management

### Notifications

- **Firebase Cloud Messaging (FCM)** - Push notifications
- **Service Workers** - Background notification handling
- **Vercel Cron Jobs** - Scheduled notification reminders

### Additional Libraries

- **QR Code React** - QR code generation for payments
- **JWT Decode** - Token handling
- **Formidable** - File upload processing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication, Firestore, and Cloud Messaging enabled
- Vercel account for deployment

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yummyfi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project at
     [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Enable Cloud Messaging
   - Generate Web Push Certificate (VAPID key)

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase configuration and Admin SDK credentials.

5. **Update Firebase Config**
   - Replace the Firebase config in `src/firebase.js`
   - Add your VAPID key for push notifications

6. **Start Development Server**
   ```bash
   npm run dev
   ```

### Deployment

1. **Deploy to Vercel**
   ```bash
   npm run build
   vercel --prod
   ```

2. **Set Environment Variables** Add all Firebase Admin SDK variables to your
   Vercel project settings.

3. **Update API URLs** Update the production URL in
   `src/utils/notifications.js`.

## 📁 Project Structure

```
yummyfi/
├── public/
│   ├── firebase-messaging-sw.js    # Service worker for notifications
│   └── ...
├── src/
│   ├── components/                 # React components
│   │   ├── AdminPanel.jsx         # Admin dashboard
│   │   ├── Auth.jsx               # Authentication
│   │   ├── Home.jsx               # User home page
│   │   ├── MenuManagement.jsx     # Menu CRUD operations
│   │   ├── OrdersManagement.jsx   # Order management
│   │   ├── TodaysMenu.jsx         # Menu display
│   │   ├── NotificationHandler.jsx # Push notification handler
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.jsx        # Authentication context
│   ├── utils/
│   │   └── notifications.js       # Notification utilities
│   ├── firebase.js                # Firebase configuration
│   └── App.jsx                    # Main app component
├── api/                           # Vercel serverless functions
│   ├── send-notification.js       # Generic notification sender
│   ├── notify-new-menu.js         # New menu notifications
│   ├── notify-order-status.js     # Order status notifications
│   ├── notify-new-order.js        # New order notifications (admins)
│   ├── send-order-reminders.js    # Daily reminder cron job
│   └── upload.js                  # Image upload handler
├── vercel.json                    # Vercel configuration & cron jobs
└── package.json
```

## 🔔 Notification System

YummyFi includes a comprehensive push notification system:

### Notification Types

- **New Menu Available**: When daily menu goes live
- **Order Status Updates**: Confirmed, cancelled, delivered
- **New Order Alerts**: For administrators
- **Daily Reminders**: Order deadline reminders

## 🗄️ Database Schema

### Firestore Collections

#### Users Collection

```javascript
{
  name: "John Doe",
  email: "john@example.com",
  role: "user" | "admin",
  fcmToken: "fcm-device-token",
  notificationsEnabled: true,
  lastTokenUpdate: timestamp
}
```

#### Menus Collection

```javascript
{
  date: "2024-01-15",
  items: [
    {
      name: "Chicken Curry",
      price: 150,
      description: "Spicy chicken curry",
      imageUrl: "https://blob-url",
      available: true
    }
  ],
  isLive: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Orders Collection

```javascript
{
  userId: "user-id",
  customerName: "John Doe",
  items: [
    {
      name: "Chicken Curry",
      price: 150,
      quantity: 2
    }
  ],
  totalAmount: 300,
  status: "pending" | "confirmed" | "cancelled" | "delivered",
  date: "2024-01-15",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🎯 Usage

### For Customers

1. **Sign Up/Login**: Create account or login
2. **Browse Menu**: View today's available menu
3. **Place Order**: Select items and place order
4. **Track Order**: Monitor order status in real-time
5. **Receive Notifications**: Get updates on order status

### For Administrators

1. **Access Admin Panel**: Login with admin role
2. **Manage Menus**: Create and publish daily menus
3. **Process Orders**: View and update order statuses
4. **Monitor Activity**: Track orders and user activity
5. **Send Notifications**: Custom notifications to users

## 🔧 Configuration

### Firebase Configuration

Update `src/firebase.js` with your Firebase project credentials:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    // ... other config
};
```

### Notification Timing

Modify cron schedule in `vercel.json`:

```json
{
    "crons": [
        {
            "path": "/api/send-order-reminders",
            "schedule": "0 16 * * *" // 4:00 PM daily
        }
    ]
}
```

## 🧪 Testing

### Development Testing

```bash
npm run dev
```

### Build Testing

```bash
npm run build
npm run preview
```

### Notification Testing

Use the utility functions in `src/utils/notifications.js` to test notifications
manually.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for
details.

## 🆘 Support

For support and questions:

- Check the [NOTIFICATIONS_SETUP.md](NOTIFICATIONS_SETUP.md) for notification
  setup
- Review Vercel function logs for debugging
- Check Firebase Console for authentication and database issues

## 🔮 Future Enhancements

- **Payment Integration**: Online payment processing
- **Analytics Dashboard**: Detailed analytics and reporting
- **Multi-location Support**: Support for multiple restaurant locations
- **Inventory Management**: Stock tracking and management
- **Customer Reviews**: Rating and review system
- **Loyalty Program**: Customer loyalty and rewards
- **Advanced Notifications**: Rich notifications with images and actions

---

Built with ❤️ using React, Firebase, and Vercel
