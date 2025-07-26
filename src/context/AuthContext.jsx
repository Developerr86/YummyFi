import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Check if token is expired
        if (decodedToken.exp * 1000 > Date.now()) {
          setUser(decodedToken);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Mock login with role-based tokens
      let mockToken;

      if (email === 'admin@yummyfi.com') {
        // Admin token with role
        mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJhZG1pbkB5dW1teWZpLmNvbSIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.abc123admin';
      } else {
        // Regular user token
        mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJuYW1lIjoiUmVndWxhciBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.abc123user';
      }

      localStorage.setItem('token', mockToken);
      const decodedToken = jwtDecode(mockToken);
      setUser(decodedToken);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const signup = async (email, password, name) => {
    try {
      // Mock signup - regular users only (admin accounts are pre-created)
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJuYW1lIjoiTmV3IFVzZXIiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.abc123newuser';

      localStorage.setItem('token', mockToken);
      const decodedToken = jwtDecode(mockToken);
      setUser(decodedToken);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Signup failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
