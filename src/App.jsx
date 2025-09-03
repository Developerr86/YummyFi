import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import UserLayout from "./components/UserLayout";
import MyOrders from "./components/MyOrders";
import Auth from "./components/Auth";
import Home from "./components/Home";
import AdminPanel from "./components/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Placeholder for the My Account page
const MyAccount = () => <div style={{padding: '20px'}}><h2>My Account</h2><p>This page is under construction.</p></div>;

function AppRoutes() {
  const { user } = useAuth();

  // REMOVED the faulty redirect block that was here to prevent the infinite loop.

  return (
    <Routes>
      {/* Auth route remains the same */}
      <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" replace />} />

      {/* Admin Route is now fully independent */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            {/* This logic correctly ensures only admins see the panel */}
            {user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />}
          </ProtectedRoute>
        } 
      />

      {/* User Routes are wrapped in the UserLayout */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            {/* If a logged-in admin tries to visit the user homepage, send them to their panel instead */}
            {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <UserLayout />}
          </ProtectedRoute>
        }
      >
          {/* These routes will render inside UserLayout and have the sidebar */}
          <Route index element={<Home />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="account" element={<MyAccount />} />
      </Route>

      {/* A catch-all to redirect any other path to the home page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;