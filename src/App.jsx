import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Import new components
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

  // Redirect logic for the root path
  if (user && user.role === 'admin') {
      return <Navigate to="/admin" replace />;
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />

      {/* Admin Route */}
      <Route path="/admin" element={
          <ProtectedRoute>
              {user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />}
          </ProtectedRoute>
      } />

      {/* User Routes inside the UserLayout */}
      <Route path="/" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="account" element={<MyAccount />} />
      </Route>

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