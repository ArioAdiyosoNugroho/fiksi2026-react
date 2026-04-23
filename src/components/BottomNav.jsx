// src/components/BottomNav.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BottomNav({ cartCount = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      path: '/',
      label: 'Beranda',
      exact: true,
      icon: ({ active }) => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
          {active ? (
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          )}
        </svg>
      ),
    },
    {
      path: '/products',
      label: 'Jelajahi',
      exact: false,
      icon: ({ active }) => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
          {active ? (
            <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" fillRule="evenodd" clipRule="evenodd" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          )}
        </svg>
      ),
    },
    {
      // AI Recycle - center special button
      path: '/ai-recycle',
      label: 'AI Recycle',
      exact: false,
      special: true,
      icon: ({ active }) => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C12 2 12.6314 7.16642 15.5 10C18.3686 12.8336 22 12 22 12C22 12 16.8336 12.6314 14 15.5C11.1664 18.3686 12 22 12 22C12 22 11.3686 16.8336 8.5 14C5.63142 11.1664 2 12 2 12C2 12 7.16642 11.3686 10 8.5C12.8336 5.63142 12 2 12 2Z" />
        </svg>
      ),
    },
    {
      path: '/cart',
      label: 'Keranjang',
      exact: false,
      icon: ({ active }) => (
        <div className="relative">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
            {active ? (
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
            )}
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center leading-none">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </div>
      ),
    },
    {
      path: user ? '/profile' : '/login',
      label: 'Profil',
      exact: false,
      icon: ({ active }) =>
        user?.avatar ? (
          <img
            src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${user.avatar}`}
            alt={user.name}
            className={`w-6 h-6 rounded-full object-cover ring-2 ${active ? 'ring-blue-600' : 'ring-transparent'}`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '';
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
            {active ? (
              <path fillRule="evenodd" clipRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            )}
          </svg>
        ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glassmorphism background */}
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around h-[60px] px-1 max-w-lg mx-auto relative">
          {navItems.map((item) => {
            // Special center AI Recycle button
            if (item.special) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center justify-center relative -mt-5"
                >
                  {({ isActive }) => (
                    <>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90
                        ${isActive
                          ? 'bg-blue-700 shadow-blue-500/40'
                          : 'bg-blue-600 shadow-blue-500/30'
                        }`}>
                        <span className="text-white">{item.icon({ active: isActive })}</span>
                      </div>
                      <span className="text-[9px] font-semibold text-blue-600 mt-1">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className="flex flex-col items-center justify-center flex-1 h-full py-1 active:scale-95 transition-transform"
              >
                {({ isActive }) => (
                  <>
                    <div className={`relative transition-colors duration-200 mb-0.5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                      {item.icon({ active: isActive })}
                    </div>
                    <span className={`text-[9px] font-semibold transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                      {item.label}
                    </span>
                    {/* Active dot indicator */}
                    {isActive && (
                      <span className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full"></span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Safe area for iPhone */}
        <div className="h-safe-area-inset-bottom bg-transparent" style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </nav>
  );
}