// Utility functions for triggering notifications from the frontend

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://yummy-fi.vercel.app' 
  : 'http://localhost:3000';

// Trigger new menu notification
export const triggerNewMenuNotification = async (menuData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notify-new-menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ menuData })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send notifications');
    }

    console.log('New menu notifications sent:', result);
    return result;
  } catch (error) {
    console.error('Error triggering new menu notification:', error);
    throw error;
  }
};

// Trigger order status notification
export const triggerOrderStatusNotification = async (orderData, previousStatus = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notify-order-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderData, previousStatus })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send notification');
    }

    console.log('Order status notification sent:', result);
    return result;
  } catch (error) {
    console.error('Error triggering order status notification:', error);
    throw error;
  }
};

// Trigger new order notification for admins
export const triggerNewOrderNotification = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notify-new-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderData })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send notifications');
    }

    console.log('New order notifications sent to admins:', result);
    return result;
  } catch (error) {
    console.error('Error triggering new order notification:', error);
    throw error;
  }
};

// Manually trigger order reminders (for testing)
export const triggerOrderReminders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/send-order-reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send reminders');
    }

    console.log('Order reminders sent:', result);
    return result;
  } catch (error) {
    console.error('Error triggering order reminders:', error);
    throw error;
  }
};

// Send custom notification to specific user
export const sendCustomNotification = async (fcmToken, payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fcmToken, payload })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send notification');
    }

    console.log('Custom notification sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending custom notification:', error);
    throw error;
  }
};