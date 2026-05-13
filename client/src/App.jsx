import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';   // ← ADD
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import Landing        from './pages/Landing';
import Register       from './pages/Register';
import Login          from './pages/Login';
import Dashboard      from './pages/shopkeeper/Dashboard';
import CreateListing  from './pages/shopkeeper/CreateListing';
import ShopSetup      from './pages/shopkeeper/ShopSetup';
import OrdersManage   from './pages/shopkeeper/OrdersManage';
import ScanQR         from './pages/shopkeeper/ScanQR';
import Analytics      from './pages/shopkeeper/Analytics';
import BuyerHome      from './pages/buyer/BuyerHome';
import MapPage        from './pages/buyer/MapPage';
import ProductDetail  from './pages/buyer/ProductDetail';
import MyOrders       from './pages/buyer/MyOrders';
import MyBids         from './pages/buyer/MyBids';

import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/login"    element={user ? <Navigate to="/" /> : <Login />} />

        {/* Shopkeeper routes */}
        <Route path="/dashboard"      element={<ProtectedRoute role="shopkeeper"><Dashboard /></ProtectedRoute>} />
        <Route path="/shop/setup"     element={<ProtectedRoute role="shopkeeper"><ShopSetup /></ProtectedRoute>} />
        <Route path="/create-listing" element={<ProtectedRoute role="shopkeeper"><CreateListing /></ProtectedRoute>} />
        <Route path="/orders/manage"  element={<ProtectedRoute role="shopkeeper"><OrdersManage /></ProtectedRoute>} />
        <Route path="/scan-qr"        element={<ProtectedRoute role="shopkeeper"><ScanQR /></ProtectedRoute>} />
        <Route path="/analytics"      element={<ProtectedRoute role="shopkeeper"><Analytics /></ProtectedRoute>} />

        {/* Buyer routes */}
        <Route path="/browse"         element={<ProtectedRoute role="buyer"><BuyerHome /></ProtectedRoute>} />
        <Route path="/map"            element={<ProtectedRoute role="buyer"><MapPage /></ProtectedRoute>} />
        <Route path="/product/:id"    element={<ProtectedRoute role="buyer"><ProductDetail /></ProtectedRoute>} />
        <Route path="/my-orders"      element={<ProtectedRoute role="buyer"><MyOrders /></ProtectedRoute>} />
        <Route path="/my-bids"        element={<ProtectedRoute role="buyer"><MyBids /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    // ↓ Wrap everything — must be outside BrowserRouter so it covers the whole tree
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
