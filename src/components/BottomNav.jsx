// src/components/BottomNav.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  House,
  ShoppingBag,
  Layers,
  Truck,
  ShoppingCart,
  User,
  Sparkles,
} from 'lucide-react';

export default function BottomNav({ cartCount = 0 }) {
  const { user } = useAuth();

  const getAvatarUrl = () => {
    if (!user?.avatar) return null;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl}/storage/${user.avatar}`;
  };

  // Avatar / profile icon
  const ProfileIcon = ({ active }) => {
    const avatarUrl = getAvatarUrl();
    if (user && avatarUrl) {
      return (
        <div className={`w-[22px] h-[22px] rounded-full overflow-hidden ring-2 transition-all ${active ? 'ring-blue-600' : 'ring-gray-300'}`}>
          <img
            src={avatarUrl}
            alt={user?.name || 'Profil'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              const wrap = e.target.closest('[data-avatar-wrap]');
              if (wrap) {
                wrap.innerHTML = `<span class="w-[22px] h-[22px] rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">${user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>`;
              }
            }}
          />
        </div>
      );
    }
    if (user) {
      return (
        <div
          data-avatar-wrap
          className={`w-[22px] h-[22px] rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold ring-2 transition-all ${active ? 'ring-blue-600 ring-offset-1' : 'ring-transparent'}`}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      );
    }
    return (
      <User
        size={20}
        strokeWidth={active ? 0 : 1.75}
        fill={active ? 'currentColor' : 'none'}
        className="transition-all"
      />
    );
  };

  // Left items: Beranda, Produk, Material
  const leftItems = [
    { path: '/',          label: 'Beranda',  exact: true,
      icon: (a) => <House size={20} strokeWidth={a ? 0 : 1.75} fill={a ? 'currentColor' : 'none'} /> },
    { path: '/products',  label: 'Produk',   exact: false,
      icon: (a) => <ShoppingBag size={20} strokeWidth={a ? 0 : 1.75} fill={a ? 'currentColor' : 'none'} /> },
    { path: '/materials', label: 'Material', exact: false,
      icon: (a) => <Layers size={20} strokeWidth={a ? 0 : 1.75} fill={a ? 'currentColor' : 'none'} /> },
  ];

  // Right items: Keranjang, Pengepul, Profil
  const rightItems = [
    { path: '/cart',       label: 'Keranjang', exact: false, isCart: true,
      icon: (a) => <ShoppingCart size={20} strokeWidth={a ? 0 : 1.75} fill={a ? 'currentColor' : 'none'} /> },
    { path: '/collectors', label: 'Pengepul',  exact: false,
      icon: (a) => <Truck size={20} strokeWidth={a ? 0 : 1.75} fill={a ? 'currentColor' : 'none'} /> },
    { path: user ? '/profile' : '/login', label: user ? 'Profil' : 'Masuk', exact: false, isProfile: true,
      icon: (a) => <ProfileIcon active={a} /> },
  ];

  const NavItem = ({ path, label, exact, icon, isCart, isProfile }) => (
    <NavLink
      to={path}
      end={exact}
      className="flex flex-col items-center justify-center flex-1 h-full relative group"
    >
      {({ isActive }) => (
        <>
          {/* Active pill indicator at top */}
          <span
            className={`absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] rounded-b-full transition-all duration-300 ${
              isActive ? 'w-6 bg-blue-600' : 'w-0 bg-transparent'
            }`}
          />

          {/* Icon wrapper */}
          <div className={`relative flex items-center justify-center transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
            {icon(isActive)}

            {/* Cart badge */}
            {isCart && cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-bold min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center leading-none">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>

          <span className={`text-[9px] font-semibold mt-0.5 leading-none transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white border-t border-gray-100 shadow-[0_-2px_20px_rgba(0,0,0,0.07)]">
        <div className="flex items-stretch h-[58px] max-w-lg mx-auto">

          {/* LEFT: Beranda, Produk, Material */}
          {leftItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}

          {/* CENTER: AI Recycle — elevated FAB */}
          <div className="flex flex-col items-center justify-end pb-2 px-1 relative flex-shrink-0">
            <NavLink to="/ai-recycle" className="flex flex-col items-center gap-0.5 -translate-y-3">
              {({ isActive }) => (
                <>
                  <div
                    className={`w-12 h-12 rounded-[14px] flex items-center justify-center transition-all duration-200 active:scale-90
                      shadow-[0_4px_14px_rgba(37,99,235,0.45)]
                      ${isActive ? 'bg-blue-700' : 'bg-blue-600'}`}
                  >
                    <Sparkles size={20} strokeWidth={1.5} className="text-white" fill="white" />
                  </div>
                  <span className={`text-[9px] font-semibold leading-none transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    AI
                  </span>
                </>
              )}
            </NavLink>
          </div>

          {/* RIGHT: Keranjang, Pengepul, Profil */}
          {rightItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}

        </div>

        {/* iPhone home indicator safe area */}
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </nav>
  );
}