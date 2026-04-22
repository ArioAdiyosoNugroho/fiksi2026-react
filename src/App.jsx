// src/App.jsx (Update)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Materials from './pages/Materials';
import MaterialDetail from './pages/MaterialDetail';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import AiRecycle from './pages/AiRecycle';
import Collectors from './pages/Collectors';
import CollectorDetail from './pages/CollectorDetail';



// Seller Pages
import SellerLayout from './components/SellerLayout';
import SellerDashboard from './pages/seller/Dashboard';
import ManageProducts from './pages/seller/ManageProducts';
import ManageMaterials from './pages/seller/ManageMaterials';
import SellerOrders from './pages/seller/SellerOrders';
import CollectorSettings from './pages/collector/CollectorSettings';

// Guard: halaman yang butuh login
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

// Guard untuk seller
function SellerRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'seller' && user.role !== 'collector') return <Navigate to="/" replace />;
  return children;
}

// Guard: redirect ke home jika sudah login
function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Publik */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/materials" element={<Materials />} />
      <Route path="/materials/:id" element={<MaterialDetail />} />

      {/* Hanya untuk tamu */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Hanya untuk user login */}
      <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
      
      {/* ai */}
      <Route path="/ai-recycle" element={<AiRecycle />} />

      {/* Pengepul */}
      <Route path="/collectors" element={<Collectors />} />
      <Route path="/collectors/:id" element={<CollectorDetail />} />

      {/* Seller Routes */}
      <Route path="/seller" element={<SellerRoute><SellerLayout /></SellerRoute>}>
        <Route index element={<Navigate to="/seller/dashboard" replace />} />
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="products" element={<ManageProducts />} />
        <Route path="products/edit/:id" element={<ManageProducts />} />
        <Route path="materials" element={<ManageMaterials />} />
        <Route path="materials/edit/:id" element={<ManageMaterials />} />
        <Route path="orders" element={<SellerOrders />} />

        {/* pengepul */}
        <Route path="collector-settings" element={<CollectorSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />  
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}