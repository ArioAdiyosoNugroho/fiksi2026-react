// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import womenBuyingImg from '../assets/women-buying.png';
import kainImg from '../assets/img/kain.png';
import logamImg from '../assets/img/logam.png';
import plastikImg from '../assets/img/plastik.png';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col animate-pulse">
      <div className="h-36 sm:h-44 bg-gray-100"></div>
      <div className="p-3">
        <div className="h-3 bg-gray-100 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-3/4 mb-3"></div>
        <div className="h-8 bg-gray-100 rounded-xl"></div>
      </div>
    </div>
  );
}

function ProductCard({ item, type, onAddToCart }) {
  const navigate = useNavigate();
  const gradients = [
    'from-cyan-100 to-blue-200',
    'from-slate-100 to-gray-200',
    'from-pink-100 to-purple-200',
    'from-yellow-100 to-orange-200',
    'from-green-100 to-teal-200',
    'from-indigo-100 to-blue-200',
  ];
  const gradient = gradients[item.id % gradients.length] || gradients[0];
  const detailPath = type === 'material' ? `/materials/${item.id}` : `/products/${item.id}`;

  const getImageUrl = () => {
    if (!item.images || item.images.length === 0) return null;
    const firstImage = item.images[0];
    if (firstImage && typeof firstImage === 'object' && firstImage.image_url) return firstImage.image_url;
    if (typeof firstImage === 'string') return firstImage;
    return null;
  };
  const imageUrl = getImageUrl();

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col active:scale-[0.98] transition-transform duration-150">
      {/* Image area */}
      <div
        className={`relative bg-gradient-to-tr ${gradient} h-36 sm:h-44 overflow-hidden cursor-pointer`}
        onClick={() => navigate(detailPath)}
      >
        {/* Badge */}
        <span className="absolute top-2 left-2 bg-[#ffd233] text-gray-900 text-[9px] font-bold px-2 py-0.5 rounded-full z-10">
          {type === 'material' ? 'Material' : 'Populer'}
        </span>

        {/* Wishlist button */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm z-10 active:scale-90 transition-transform"
        >
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent) {
                const div = document.createElement('div');
                div.className = 'w-full h-full flex items-center justify-center text-4xl opacity-30 select-none';
                div.textContent = type === 'material' ? '♻️' : '🛍️';
                parent.appendChild(div);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30 select-none">
            {type === 'material' ? '♻️' : '🛍️'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-gray-500 text-[10px] mb-0.5 font-medium uppercase tracking-wide">
          {type === 'material' ? 'Bahan Baku' : 'Produk'}
        </p>
        <p className="text-gray-800 font-semibold text-xs sm:text-sm mb-1.5 line-clamp-2 leading-snug flex-1">
          {item.name}
        </p>
        <p className="text-blue-600 font-bold text-sm sm:text-base mb-2.5">
          Rp {Number(item.price).toLocaleString('id-ID')}
        </p>
        <button
          onClick={() => onAddToCart(item, type)}
          className="w-full bg-blue-600 active:bg-blue-800 text-white py-2 rounded-xl text-xs font-semibold transition-colors"
        >
          + Keranjang
        </button>
      </div>
    </div>
  );
}

// Section header component
function SectionHeader({ title, linkTo, linkLabel = 'Lihat semua' }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{title}</h2>
      <Link to={linkTo} className="text-blue-600 text-xs font-semibold flex items-center gap-1 py-1 px-2 rounded-lg active:bg-blue-50">
        {linkLabel}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts]   = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast]         = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, matRes] = await Promise.all([
          api.get('/products?per_page=4'),
          api.get('/materials?per_page=4'),
        ]);
        setProducts(prodRes.data.data ?? []);
        setMaterials(matRes.data.data ?? []);
      } catch (err) {
        console.error('Gagal memuat data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!user) { setCartCount(0); return; }
    api.get('/cart').then(res => {
      const items = res.data?.items ?? [];
      setCartCount(items.reduce((sum, i) => sum + i.quantity, 0));
    }).catch(() => {});
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = async (item, type) => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/cart', { type, id: item.id, quantity: 1 });
      setCartCount(prev => prev + 1);
      showToast(`${item.name} ditambahkan ke keranjang!`);
    } catch (err) {
      showToast('Gagal menambahkan ke keranjang.', 'error');
    }
  };

  return (
    <div className="bg-[#f7f8fa] text-gray-800 pb-24 md:pb-0" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-lg text-white text-sm font-semibold transition-all max-w-[90vw] text-center
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.message}
        </div>
      )}

      <Navbar cartCount={cartCount} />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── HERO ─────────────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl overflow-hidden mb-5 mt-2">
          {/* decorative circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-14 -left-8 w-44 h-44 bg-white/5 rounded-full"></div>

          <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between min-h-[200px] md:min-h-[340px]">
            <div className="w-full md:w-1/2 text-white mb-4 md:mb-0">
              <span className="inline-block bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                🌿 Platform Daur Ulang #1
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-3">
                Jual & Beli<br />Material Daur Ulang
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mb-5 max-w-sm leading-relaxed">
                Transaksi aman, pengiriman cepat, dan ikut menjaga lingkungan bersama.
              </p>
              <div className="flex gap-2.5">
                <Link to="/materials" className="bg-white text-blue-600 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-transform">
                  Mulai Beli
                </Link>
                <Link to="/ai-recycle" className="bg-white/20 border border-white/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-transform flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C12 2 12.6314 7.16642 15.5 10C18.3686 12.8336 22 12 22 12C22 12 16.8336 12.6314 14 15.5C11.1664 18.3686 12 22 12 22C12 22 11.3686 16.8336 8.5 14C5.63142 11.1664 2 12 2 12C2 12 7.16642 11.3686 10 8.5C12.8336 5.63142 12 2 12 2Z" />
                  </svg>
                  AI Recycle
                </Link>
              </div>
            </div>
            <div className="hidden md:block md:w-1/2 text-right">
              <img src={womenBuyingImg} alt="Resiik" className="inline-block h-64 object-contain drop-shadow-2xl" />
            </div>
          </div>
        </section>

        {/* ─── QUICK STATS ──────────────────────────────────────────── */}
        <section className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            { icon: '📦', value: '2.4K+', label: 'Produk' },
            { icon: '♻️', value: '800+', label: 'Material' },
            { icon: '🏪', value: '150+', label: 'Penjual' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-3.5 text-center shadow-sm border border-gray-100">
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-base font-extrabold text-gray-900">{stat.value}</div>
              <div className="text-[10px] text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* ─── KATEGORI SCROLL ──────────────────────────────────────── */}
        <section className="mb-5">
          <SectionHeader title="Kategori" linkTo="/products" linkLabel="Semua" />
          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
            {[
              { name: 'Logam', icon: '🔩', color: 'bg-orange-50 text-orange-600' },
              { name: 'Plastik', icon: '🫙', color: 'bg-blue-50 text-blue-600' },
              { name: 'Kayu', icon: '🪵', color: 'bg-emerald-50 text-emerald-600' },
              { name: 'Kertas', icon: '📄', color: 'bg-amber-50 text-amber-600' },
              { name: 'Kaca', icon: '🪟', color: 'bg-purple-50 text-purple-600' },
              { name: 'Elektronik', icon: '💻', color: 'bg-rose-50 text-rose-600' },
              { name: 'Tekstil', icon: '🧵', color: 'bg-teal-50 text-teal-600' },
            ].map((cat, i) => (
              <Link
                key={i}
                to={`/products?q=${cat.name.toLowerCase()}`}
                className="flex-none flex flex-col items-center gap-1.5"
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center text-2xl shadow-sm active:scale-95 transition-transform`}>
                  {cat.icon}
                </div>
                <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── FEATURED BANNER ──────────────────────────────────────── */}
        <section className="mb-5 grid grid-cols-2 gap-3">
          {/* Logam */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl relative overflow-hidden h-36 group active:scale-[0.98] transition-transform">
            <div className="absolute inset-0 p-4 z-20 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider">Premium</span>
              <div>
                <h3 className="text-sm font-extrabold text-white leading-tight mb-2">Material<br />Logam & Besi</h3>
                <Link to="/materials?q=logam" className="text-[9px] font-bold text-blue-300 flex items-center gap-1">
                  Jelajahi <i className="fas fa-arrow-right text-[8px]"></i>
                </Link>
              </div>
            </div>
            <img src={logamImg} alt="Logam" className="absolute right-[-8px] bottom-[-8px] w-24 h-24 object-contain z-10 opacity-80 group-hover:scale-110 transition-transform duration-500" />
          </div>

          {/* Plastik */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl relative overflow-hidden h-36 group active:scale-[0.98] transition-transform">
            <div className="absolute inset-0 p-4 z-20 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Recycle</span>
              <div>
                <h3 className="text-sm font-extrabold text-gray-800 leading-tight mb-2">Limbah<br />Plastik</h3>
                <Link to="/materials?q=plastik" className="text-[9px] font-bold text-blue-600 flex items-center gap-1">
                  Jelajahi <i className="fas fa-arrow-right text-[8px]"></i>
                </Link>
              </div>
            </div>
            <img src={plastikImg} alt="Plastik" className="absolute right-[-8px] bottom-[-8px] w-24 h-24 object-contain z-10 opacity-80 group-hover:scale-110 transition-transform duration-500" />
          </div>

          {/* Tekstil - full width */}
          <div className="col-span-2 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl relative overflow-hidden h-28 group active:scale-[0.98] transition-transform">
            <div className="absolute inset-0 p-4 z-20 flex flex-col justify-center">
              <span className="text-[9px] font-bold text-teal-500 uppercase tracking-wider mb-1">Sirkular Fashion</span>
              <h3 className="text-sm font-extrabold text-gray-800 mb-2">Limbah Tekstil & Kain Perca</h3>
              <Link to="/products?q=tekstil" className="text-[9px] font-bold text-teal-600 flex items-center gap-1 w-fit">
                Lihat Produk <i className="fas fa-arrow-right text-[8px]"></i>
              </Link>
            </div>
            <img src={kainImg} alt="Tekstil" className="absolute right-4 bottom-0 h-full w-32 object-contain z-10 opacity-70 group-hover:scale-105 transition-transform duration-500" />
          </div>
        </section>

        {/* ─── AI RECYCLE BANNER ────────────────────────────────────── */}
        <section className="mb-5">
          <Link to="/ai-recycle" className="block bg-slate-900 rounded-2xl p-4 relative overflow-hidden active:scale-[0.99] transition-transform">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C12 2 12.6314 7.16642 15.5 10C18.3686 12.8336 22 12 22 12C22 12 16.8336 12.6314 14 15.5C11.1664 18.3686 12 22 12 22C12 22 11.3686 16.8336 8.5 14C5.63142 11.1664 2 12 2 12C2 12 7.16642 11.3686 10 8.5C12.8336 5.63142 12 2 12 2Z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm mb-0.5">AI Recycle Identifier</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">Foto limbahmu, AI kami bantu identifikasi & berikan ide kreatifnya!</p>
              </div>
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </section>

        {/* ─── PRODUK BULAN INI ─────────────────────────────────────── */}
        <section className="mb-5">
          <SectionHeader title="Produk Bulan Ini" linkTo="/products" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {loading
              ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : products.map((p) => (
                  <ProductCard key={p.id} item={p} type="product" onAddToCart={handleAddToCart} />
                ))
            }
          </div>
        </section>

        {/* ─── MATERIAL TERBARU ─────────────────────────────────────── */}
        <section className="mb-6">
          <SectionHeader title="Material Terbaru" linkTo="/materials" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {loading
              ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : materials.map((m) => (
                  <ProductCard key={m.id} item={m} type="material" onAddToCart={handleAddToCart} />
                ))
            }
          </div>
        </section>

        {/* ─── CTA DAFTAR SELLER ────────────────────────────────────── */}
        {!user && (
          <section className="mb-6">
            <div className="bg-blue-600 rounded-3xl p-6 text-center text-white relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-8 -left-4 w-20 h-20 bg-white/5 rounded-full"></div>
              <div className="relative z-10">
                <div className="text-3xl mb-2">🌿</div>
                <h3 className="text-lg font-extrabold mb-1">Mulai Jual di Resiik</h3>
                <p className="text-blue-100 text-xs mb-4 max-w-xs mx-auto">Bergabung dengan ratusan penjual dan ikut berkontribusi dalam ekonomi sirkular.</p>
                <Link to="/register" className="inline-block bg-white text-blue-600 font-bold text-sm px-6 py-2.5 rounded-xl active:scale-95 transition-transform shadow-sm">
                  Daftar Gratis
                </Link>
              </div>
            </div>
          </section>
        )}

      </div>
      <Footer />
    </div>
  );
}