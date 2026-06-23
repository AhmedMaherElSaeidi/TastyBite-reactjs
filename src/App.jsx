import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';
import Navbar from './components/layout/Navbar';
import CartDrawer from './components/cart/CartDrawer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Auth from './pages/Auth';
import Admin from './pages/Admin';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role.en !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <CartDrawer />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'inherit',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.9rem',
          },
          success: { iconTheme: { primary: '#F4A01C', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={
          <ProtectedRoute><Orders /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly><Admin /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
