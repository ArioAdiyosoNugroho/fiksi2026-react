// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ cartCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const isActive = (path, exact = true) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const isActiveCategory = (path, queryValue) => {
    if (location.pathname !== path) return false;
    const params = new URLSearchParams(location.search);
    return params.get('q') === queryValue;
  };

  const getAvatarUrl = () => {
    if (!user?.avatar) return null;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl}/storage/${user.avatar}`;
  };

  console.log('User role:', user?.role);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Baris atas */}
        <header className="flex items-center justify-between py-5">
          <Link to="/" className="text-2xl font-bold tracking-tight text-gray-900">
            resik.<span className="text-blue-600">id</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk atau material di Resiik"
              className="w-full bg-gray-50 border border-gray-100 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="absolute left-4 top-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>
          </form>

          <div className="flex items-center space-x-6">
            <button className="text-gray-600 hover:text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <nav className="hidden md:flex space-x-5 text-sm font-medium">
              <Link to="/" className={`transition-colors ${isActive('/') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}>
                Beranda
              </Link>
              <Link to="/collectors" className={`transition-colors ${isActive('/collectors') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}>
                Pengepul
              </Link>
              <Link to="/materials" className={`transition-colors ${isActive('/materials') ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}>
                Material
              </Link>
            </nav>

            <Link to="/cart" className="text-gray-600 hover:text-blue-600 relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {user.avatar ? (
                    <img
                      src={getAvatarUrl()}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">${user.name?.charAt(0).toUpperCase() || 'U'}</div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <svg
                    className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profil Saya
                      </Link>
                      <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Pesanan Saya
                      </Link>
                      {user?.role === 'seller' && (
                        <Link to="/seller/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Dashboard Seller
                        </Link>
                      )}
                      {user?.role === 'collector' && (
                        <Link to="/collector-settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Dashboard Pengepul
                        </Link>
                      )}
                    </div>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                Masuk
              </Link>
            )}
          </div>
        </header>

        {/* Baris kategori */}
        <div className="flex items-center justify-between py-4 border-b border-gray-50 mb-8">
          <div className="flex space-x-3">
            <Link to="/materials" className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${isActive('/materials') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              Semua Material
            </Link>
            <Link to="/products" className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${isActive('/products') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              Semua Produk
            </Link>
            <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>
            {/* TOMBOL AI RECYCLE: EKSLUSIF & SIMPEL */}
            <Link 
              to="/ai-recycle" 
              className="group relative flex items-center ml-3 gap-2 px-6 py-2 overflow-hidden rounded-full bg-slate-900 text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95"
            >
              {/* Efek Kilauan (Shimmer) saat Hover */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              
              {/* Icon Sparkles sebagai simbol AI */}
              <svg 
                className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform duration-500 ease-out" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 2C12 2 12.6314 7.16642 15.5 10C18.3686 12.8336 22 12 22 12C22 12 16.8336 12.6314 14 15.5C11.1664 18.3686 12 22 12 22C12 22 11.3686 16.8336 8.5 14C5.63142 11.1664 2 12 2 12C2 12 7.16642 11.3686 10 8.5C12.8336 5.63142 12 2 12 2Z" 
                  fill="currentColor"
                />
              </svg>
              
              <span className="text-xs font-bold tracking-wider uppercase">AI Recycle</span>
            </Link>

          </div>
          <div className="hidden lg:flex space-x-6 text-sm font-medium text-gray-500">
            {[
              { label: 'Logam', path: '/materials', query: 'logam' },
              { label: 'Kayu', path: '/materials', query: 'kayu' },
              { label: 'Plastik', path: '/materials', query: 'plastik' },
              { label: 'Elektronik', path: '/products', query: 'elektronik' },
              { label: 'Fashion', path: '/products', query: 'fashion' },
              { label: 'Furnitur', path: '/products', query: 'furnitur' },
              { label: 'Kertas', path: '/materials', query: 'kertas' },
            ].map(({ label, path, query }) => (
              <Link key={label} to={`${path}?q=${query}`} className={`transition-colors ${isActiveCategory(path, query) ? 'text-blue-600 font-semibold' : 'hover:text-gray-900'}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}