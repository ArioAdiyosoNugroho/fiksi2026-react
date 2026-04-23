// src/components/BottomNav.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BottomNav({ cartCount = 0 }) {
  const { user } = useAuth();

  const getAvatarUrl = () => {
    if (!user?.avatar) return null;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl}/storage/${user.avatar}`;
  };

  // Icon components
  const HomeIcon = ({ active }) => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {active ? (
        <>
          <path d="M11.293 3.293a1 1 0 011.414 0l6 6 2 2a1 1 0 01-1.414 1.414L19 12.414V19a2 2 0 01-2 2h-3a1 1 0 01-1-1v-3h-2v3a1 1 0 01-1 1H7a2 2 0 01-2-2v-6.586l-.293.293a1 1 0 01-1.414-1.414l2-2 6-6z" fill="currentColor" />
        </>
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} stroke="currentColor"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      )}
    </svg>
  );

  const ProductIcon = ({ active }) => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {active ? (
        <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.137a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          fill="currentColor" stroke="currentColor" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} stroke="currentColor"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.137a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      )}
    </svg>
  );

  const MaterialIcon = ({ active }) => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {active ? (
        <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
          fill="currentColor" stroke="currentColor" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} stroke="currentColor"
          d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      )}
    </svg>
  );

  const CollectorIcon = ({ active }) => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {active ? (
        <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
          fill="currentColor" stroke="currentColor" strokeWidth={0.3} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} stroke="currentColor"
          d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      )}
    </svg>
  );

  const AISparkIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 12.6314 7.16642 15.5 10C18.3686 12.8336 22 12 22 12C22 12 16.8336 12.6314 14 15.5C11.1664 18.3686 12 22 12 22C12 22 11.3686 16.8336 8.5 14C5.63142 11.1664 2 12 2 12C2 12 7.16642 11.3686 10 8.5C12.8336 5.63142 12 2 12 2Z" />
    </svg>
  );

  const navItems = [
    { path: '/',          label: 'Beranda',  exact: true,  Icon: HomeIcon      },
    { path: '/products',  label: 'Produk',   exact: false, Icon: ProductIcon   },
    { path: '/materials', label: 'Material', exact: false, Icon: MaterialIcon  },
    { path: '/collectors',label: 'Pengepul', exact: false, Icon: CollectorIcon },
  ];

  // Profile icon or avatar
  const ProfileIcon = ({ active }) => {
    const avatarUrl = getAvatarUrl();
    if (user && avatarUrl) {
      return (
        <div className={`w-6 h-6 rounded-full overflow-hidden ring-2 transition-all ${active ? 'ring-blue-600' : 'ring-gray-200'}`}>
          <img
            src={avatarUrl}
            alt={user?.name || 'Profil'}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails
              e.target.onerror = null;
              e.target.parentElement.innerHTML = `<div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-bold">${user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>`;
            }}
          />
        </div>
      );
    }
    if (user) {
      // Logged in but no avatar → show initial
      return (
        <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-bold ring-2 transition-all ${active ? 'ring-blue-600' : 'ring-transparent'}`}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      );
    }
    // Not logged in → person icon
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {active ? (
          <path fillRule="evenodd" clipRule="evenodd"
            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
            fill="currentColor" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} stroke="currentColor"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        )}
      </svg>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white border-t border-gray-100 shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-stretch h-[58px] max-w-lg mx-auto relative">

          {/* LEFT SIDE: Beranda, Produk */}
          {navItems.slice(0, 2).map(({ path, label, exact, Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              className="flex flex-col items-center justify-center flex-1 relative"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
                  )}
                  <span className={`transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    <Icon active={isActive} />
                  </span>
                  <span className={`text-[9px] font-semibold mt-0.5 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {/* CENTER: AI Recycle — floating elevated button */}
          <div className="flex flex-col items-center justify-center px-3 relative -top-3.5">
            <NavLink to="/ai-recycle" className="flex flex-col items-center gap-1">
              {({ isActive }) => (
                <>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90
                    ${isActive ? 'bg-blue-700' : 'bg-blue-600'}
                    shadow-blue-500/30`}
                  >
                    <span className="text-white"><AISparkIcon /></span>
                  </div>
                  <span className={`text-[9px] font-semibold transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    AI
                  </span>
                </>
              )}
            </NavLink>
          </div>

          {/* RIGHT SIDE: Material, Pengepul */}
          {navItems.slice(2, 4).map(({ path, label, exact, Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              className="flex flex-col items-center justify-center flex-1 relative"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
                  )}
                  <span className={`transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    <Icon active={isActive} />
                  </span>
                  <span className={`text-[9px] font-semibold mt-0.5 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {/* PROFILE */}
          <NavLink
            to={user ? '/profile' : '/login'}
            className="flex flex-col items-center justify-center flex-1 relative"
          >
            {({ isActive }) => (
              <>
                {isActive && !user && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
                )}
                {isActive && user && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
                )}
                <span className={`transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  <ProfileIcon active={isActive} />
                </span>
                <span className={`text-[9px] font-semibold mt-0.5 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {user ? 'Profil' : 'Masuk'}
                </span>
              </>
            )}
          </NavLink>

        </div>
        {/* iPhone safe area */}
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </nav>
  );
}