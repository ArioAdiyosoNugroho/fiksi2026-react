// src/components/BottomNav.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BottomNav({ cartCount = 0 }) {
  const { user } = useAuth();

  const navItems = [
    {
      path: '/',
      label: 'Beranda',
      icon: (active) => (
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      activeColor: 'text-blue-600',
    },
    {
      path: '/products',
      label: 'Jelajahi',
      icon: (active) => (
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      activeColor: 'text-blue-600',
    },
    {
      path: '/cart',
      label: 'Keranjang',
      icon: (active) => (
        <div className="relative">
          <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </div>
      ),
      activeColor: 'text-blue-600',
    },
    {
      path: '/profile',
      label: 'Profil',
      icon: (active) => (
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      activeColor: 'text-blue-600',
      requireAuth: true, // hanya tampil jika user login? opsional
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] z-50 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          // Jika item memerlukan auth dan user tidak ada, tetap tampilkan tapi arahkan ke login
          if (item.requireAuth && !user) {
            return (
              <NavLink
                key={item.path}
                to="/login"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full transition-colors ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.icon(isActive)}
                    <span className="text-[10px] font-medium mt-1">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label === 'Keranjang'
                    ? item.icon(isActive) // sudah handle badge di dalam
                    : item.icon(isActive)}
                  <span className="text-[10px] font-medium mt-1">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}