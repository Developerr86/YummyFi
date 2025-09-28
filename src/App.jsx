import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import UserLayout from "./components/UserLayout";
import MyOrders from "./components/MyOrders";
import MyAccount from "./components/MyAccount"; // Import the new component
import Auth from "./components/Auth";
import Home from "./components/Home";
import AdminPanel from "./components/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import NotificationHandler from "./components/NotificationHandler";
import OrderPage from "./components/OrderPage"; // Import the new OrderPage component
import "./App.css";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" replace />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <UserLayout />}
          </ProtectedRoute>
        }
      >
          <Route index element={<Home />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="account" element={<MyAccount />} /> {/* Add the new account route */}
          <Route path="order/:itemId" element={<OrderPage />} /> {/* Add the new order page route */}
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
          <NotificationHandler />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;