// src/components/SellerSidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SellerSidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Menu untuk seller
  const sellerMenuItems = [
    { path: '/seller/dashboard', icon: 'fas fa-chart-line', label: 'Dashboard' },
    { path: '/seller/products', icon: 'fas fa-box', label: 'Produk Saya' },
    { path: '/seller/materials', icon: 'fas fa-recycle', label: 'Material Saya' },
    { path: '/seller/orders', icon: 'fas fa-shopping-cart', label: 'Pesanan Masuk' },
  ];

  // Menu untuk collector (tanpa produk)
  const collectorMenuItems = [
    { path: '/seller/dashboard', icon: 'fas fa-chart-line', label: 'Dashboard' },
    { path: '/seller/materials', icon: 'fas fa-recycle', label: 'Material Saya' },
    { path: '/seller/orders', icon: 'fas fa-shopping-cart', label: 'Pesanan Masuk' },
    { path: '/seller/collector-settings', icon: 'fas fa-store', label: 'Pengaturan Toko Pengepul' },
  ];

  let menuItems = [];
  if (user?.role === 'seller') {
    menuItems = sellerMenuItems;
  } else if (user?.role === 'collector') {
    menuItems = collectorMenuItems;
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ${isOpen ? 'w-72' : 'w-0 lg:w-72'} overflow-hidden`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <i className="fas fa-store text-white text-lg"></i>
              </div>
              <div>
                <h2 className="font-bold text-gray-800">
                  {user?.role === 'collector' ? 'Dashboard Pengepul' : 'Dashboard Penjual'}
                </h2>
                <p className="text-xs text-gray-500">{user?.name || 'User'}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`
                }
              >
                <i className={`${item.icon} w-5 text-lg`}></i>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <i className="fas fa-sign-out-alt w-5"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}