// src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import womenBuyingImg from '../assets/women-buying.png';
import kainImg from '../assets/img/kain.png';
import logamImg from '../assets/img/logam.png';
import plastikImg from '../assets/img/plastik.png';

/* ─────────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 w-[175px] sm:w-auto animate-pulse">
      <div className="h-44 bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-8 bg-gray-100 rounded-xl mt-3" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRODUCT CARD  (horizontal scroll on mobile)
───────────────────────────────────────────── */
const BG_GRADIENTS = [
  'from-cyan-50 to-blue-100',
  'from-gray-100 to-slate-200',
  'from-pink-50 to-rose-100',
  'from-amber-50 to-orange-100',
  'from-emerald-50 to-teal-100',
  'from-indigo-50 to-blue-100',
];

function ProductCard({ item, type, onAddToCart }) {
  const navigate = useNavigate();
  const gradient = BG_GRADIENTS[(item.id ?? 0) % BG_GRADIENTS.length];
  const detailPath = type === 'material' ? `/materials/${item.id}` : `/products/${item.id}`;

  const getImageUrl = () => {
    if (!item.images?.length) return null;
    const first = item.images[0];
    if (first?.image_url) return first.image_url;
    if (typeof first === 'string') return first;
    return null;
  };
  const imageUrl = getImageUrl();

  return (
    <div
      className="flex-shrink-0 w-[175px] sm:w-auto bg-white rounded-2xl overflow-hidden border border-gray-100
                 shadow-sm active:scale-[0.97] transition-transform duration-150"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Image area */}
      <div
        className={`relative bg-gradient-to-br ${gradient} h-44 overflow-hidden cursor-pointer`}
        onClick={() => navigate(detailPath)}
      >
        {/* Badge */}
        <span className="absolute top-2.5 left-2.5 z-10 bg-[#FFD233] text-gray-900 text-[9px] font-bold
                         px-2 py-0.5 rounded-full tracking-wide">
          {type === 'material' ? 'MATERIAL' : 'POPULER'}
        </span>

        {/* Action buttons */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(item, type); }}
            className="w-7 h-7 bg-black/40 hover:bg-black/70 active:bg-black rounded-lg
                       text-white flex items-center justify-center backdrop-blur-sm transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707
                   1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </button>
          <button
            className="w-7 h-7 bg-black/40 hover:bg-black/70 active:bg-black rounded-lg
                       text-white flex items-center justify-center backdrop-blur-sm transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5
                   0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.insertAdjacentHTML(
                'beforeend',
                `<div class="w-full h-full flex items-center justify-center text-4xl opacity-30">
                  ${type === 'material' ? '♻️' : '🛍️'}
                </div>`
              );
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30 select-none">
            {type === 'material' ? '♻️' : '🛍️'}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-wide mb-0.5">
          {type === 'material' ? 'Material' : 'Produk'}
        </p>
        <p className="text-gray-800 font-semibold text-[13px] leading-snug line-clamp-2 mb-2">{item.name}</p>
        <p className="text-blue-600 font-bold text-base mb-3">
          Rp {Number(item.price).toLocaleString('id-ID')}
        </p>
        <button
          onClick={() => onAddToCart(item, type)}
          className="w-full bg-blue-600 active:bg-blue-700 text-white py-2 rounded-xl text-[12px]
                     font-bold transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Beli Sekarang
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN HOME PAGE
───────────────────────────────────────────── */
export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products,  setProducts]  = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [toast,     setToast]     = useState(null);
  const toastTimer = useRef(null);

  /* fetch */
  useEffect(() => {
    (async () => {
      try {
        const [pr, mr] = await Promise.all([
          api.get('/products?per_page=6'),
          api.get('/materials?per_page=6'),
        ]);
        setProducts(pr.data.data ?? []);
        setMaterials(mr.data.data ?? []);
      } catch (err) {
        console.error('Gagal memuat data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user) { setCartCount(0); return; }
    api.get('/cart')
      .then(res => {
        const items = res.data?.items ?? [];
        setCartCount(items.reduce((s, i) => s + i.quantity, 0));
      })
      .catch(() => {});
  }, [user]);

  /* toast */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = async (item, type) => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/cart', { type, id: item.id, quantity: 1 });
      setCartCount(p => p + 1);
      showToast(`${item.name} ditambahkan ke keranjang!`);
    } catch {
      showToast('Gagal menambahkan ke keranjang.', 'error');
    }
  };

  /* categories */
  const CATEGORIES = [
    { name: 'Logam',     emoji: '🔩', bg: 'bg-orange-50',  ring: 'ring-orange-200' },
    { name: 'Plastik',   emoji: '♻️', bg: 'bg-blue-50',    ring: 'ring-blue-200'   },
    { name: 'Kayu',      emoji: '🪵', bg: 'bg-emerald-50', ring: 'ring-emerald-200'},
    { name: 'Kertas',    emoji: '📄', bg: 'bg-amber-50',   ring: 'ring-amber-200'  },
    { name: 'Kaca',      emoji: '🪟', bg: 'bg-purple-50',  ring: 'ring-purple-200' },
    { name: 'Elektronik',emoji: '💻', bg: 'bg-rose-50',    ring: 'ring-rose-200'   },
    { name: 'Tekstil',   emoji: '👕', bg: 'bg-teal-50',    ring: 'ring-teal-200'   },
    { name: 'Semua',     emoji: '🗂️', bg: 'bg-gray-100',   ring: 'ring-gray-300'   },
  ];

  return (
    <div className="bg-[#F8F9FC] min-h-screen text-gray-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap"
        rel="stylesheet"
      />

      {/* ── Toast ─────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl
                      text-white text-sm font-semibold whitespace-nowrap transition-all
                      ${toast.type === 'error' ? 'bg-rose-500' : 'bg-gray-900'}`}
        >
          {toast.type !== 'error' && '✅ '}{toast.message}
        </div>
      )}

      {/* ── Navbar (desktop) ──────────────── */}
      <div className="hidden md:block">
        <Navbar cartCount={cartCount} />
      </div>

      {/* ── Mobile Top Bar ────────────────── */}
      <header
        className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 pt-3 pb-2"
      >
        {/* Logo + actions */}
        <div className="flex items-center justify-between mb-2.5">
          <span style={{ fontFamily: "'Syne', sans-serif" }} className="text-xl font-extrabold text-blue-600 tracking-tight">
            resiik<span className="text-gray-900">.id</span>
          </span>
          <div className="flex items-center gap-2">
            {/* Notification */}
            <button className="relative w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg className="w-4.5 h-4.5 w-[18px] h-[18px] text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2
                     0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold
                               rounded-full flex items-center justify-center">3</span>
            </button>
            {/* Cart */}
            <button
              onClick={() => navigate('/cart')}
              className="relative w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center"
            >
              <svg className="w-[18px] h-[18px] text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold
                                 rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <button
          onClick={() => navigate('/search')}
          className="w-full flex items-center gap-2.5 bg-gray-100 rounded-2xl px-4 py-2.5 text-left"
        >
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <span className="text-gray-400 text-sm">Cari material & produk daur ulang...</span>
        </button>
      </header>

      <div className="max-w-7xl mx-auto">

        {/* ════════════════════════════════════
            HERO
        ════════════════════════════════════ */}
        <section className="px-4 md:px-6 lg:px-8 pt-4 md:pt-8 mb-8 md:mb-16">

          {/* Mobile hero */}
          <div
            className="md:hidden rounded-3xl overflow-hidden relative min-h-[220px]"
            style={{ background: 'linear-gradient(135deg,#0D3694 0%,#1D6EFB 55%,#4D9EFF 100%)' }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute top-10 -right-4 w-24 h-24 bg-white/5 rounded-full" />

            <div className="relative z-10 p-6 pb-0">
              {/* Live badge */}
              <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20
                              rounded-full px-3 py-1 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white text-[11px] font-semibold">Marketplace Daur Ulang #1</span>
              </div>

              <h1
                style={{ fontFamily: "'Syne', sans-serif" }}
                className="text-3xl font-extrabold text-white leading-tight mb-2"
              >
                Jual & Beli<br />
                <span className="text-[#FFD233]">Material</span> Daur<br />
                Ulang!
              </h1>
              <p className="text-white/70 text-sm leading-relaxed mb-5 max-w-[220px]">
                Transaksi aman, pengiriman cepat, ramah lingkungan.
              </p>

              <div className="flex gap-2.5 mb-6">
                <Link
                  to="/materials"
                  className="bg-white text-blue-600 text-[13px] font-bold px-5 py-2.5 rounded-xl
                             shadow-lg active:scale-95 transition-transform"
                >
                  Jelajahi
                </Link>
                <Link
                  to="/ai-recycle"
                  className="bg-white/15 border border-white/25 text-white text-[13px] font-semibold
                             px-4 py-2.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C12 2 12.6 7.2 15.5 10C18.4 12.8 22 12 22 12C22 12 16.8 12.6 14 15.5C11.2 18.4 12 22 12 22C12 22 11.4 16.8 8.5 14C5.6 11.2 2 12 2 12C2 12 7.2 11.4 10 8.5C12.8 5.6 12 2 12 2Z" />
                  </svg>
                  AI Recycle
                </Link>
              </div>

              {/* Stats strip */}
              <div className="flex gap-5 border-t border-white/15 pt-4 pb-5">
                {[['2K+', 'Produk'], ['500+', 'Penjual'], ['10K+', 'Transaksi']].map(([val, lbl]) => (
                  <div key={lbl}>
                    <p style={{ fontFamily: "'Syne', sans-serif" }} className="text-white font-bold text-lg leading-none">{val}</p>
                    <p className="text-white/55 text-[11px] mt-0.5">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop hero (preserved original layout) */}
          <div
            className="hidden md:flex items-center justify-between relative overflow-hidden rounded-[2rem]
                       min-h-[450px] p-10"
            style={{ background: '#f2f4f7' }}
          >
            <div className="w-1/2 z-10">
              <h1
                style={{ fontFamily: "'Syne', sans-serif" }}
                className="text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-gray-900"
              >
                Jual & Beli{' '}
                <span className="text-blue-600">Material<br />& Produk</span> Daur<br />Ulang!
              </h1>
              <p className="text-gray-500 mb-8 max-w-md text-sm leading-relaxed">
                Pengiriman cepat, layanan ramah, dan transaksi aman terjamin di resiik.id!
              </p>
              <div className="flex gap-4">
                <div className="bg-white rounded-2xl p-5 w-48 shadow-sm">
                  <h3 className="text-blue-600 font-bold text-xl leading-tight mb-2">Material dan produk Pilihan</h3>
                  <p className="text-xs text-gray-600 mb-4">Beli material berkualitas dengan harga terbaik!</p>
                  <Link to="/materials" className="inline-block bg-blue-600 text-white text-xs px-4 py-2 rounded-full font-medium">
                    Jelajahi
                  </Link>
                </div>

                <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-6 w-52 shadow-xl border border-slate-800">
                  <div className="mb-4 text-blue-400">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C12 2 12.6314 7.16642 15.5 10C18.3686 12.8336 22 12 22 12C22 12 16.8336 12.6314 14 15.5C11.1664 18.3686 12 22 12 22C12 22 11.3686 16.8336 8.5 14C5.63142 11.1664 2 12 2 12C2 12 7.16642 11.3686 10 8.5C12.8336 5.63142 12 2 12 2Z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">AI Recycle</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-5">
                    Identifikasi limbah secara cerdas dan temukan potensi kreatifnya.
                  </p>
                  <Link to="/ai-recycle" className="text-blue-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1">
                    Coba Sekarang
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 h-full flex items-end">
              <img src={womenBuyingImg} alt="Resiik" className="h-full object-cover object-top drop-shadow-2xl" />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            PROMO BANNER (mobile only)
        ════════════════════════════════════ */}
        <section className="md:hidden px-4 mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl px-4 py-3.5
                          flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">Gratis Ongkir Hari Ini! 🚚</p>
              <p className="text-white/75 text-xs mt-0.5">Min. pembelian Rp 150.000</p>
            </div>
            <div className="bg-white/20 border border-dashed border-white/50 rounded-lg px-3 py-1.5">
              <p className="text-white text-xs font-bold tracking-widest">RESIIK25</p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            CATEGORIES
        ════════════════════════════════════ */}
        <section className="mb-8 md:mb-16">
          <div className="px-4 md:px-6 lg:px-8 flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: "'Syne', sans-serif" }} className="text-xl md:text-3xl font-bold tracking-tight">
              Kategori
            </h2>
            <Link to="/products" className="text-blue-600 text-sm font-semibold">Semua →</Link>
          </div>

          {/* Horizontal scroll pill chips */}
          <div className="flex gap-3 overflow-x-auto px-4 md:px-6 lg:px-8 pb-2 no-scrollbar">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={i}
                to="/products"
                className={`flex-shrink-0 flex flex-col items-center gap-2 active:scale-95 transition-transform`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className={`w-[58px] h-[58px] ${cat.bg} ring-1 ${cat.ring} rounded-2xl
                                 flex items-center justify-center text-2xl`}>
                  {cat.emoji}
                </div>
                <span className="text-[11px] font-semibold text-gray-600 whitespace-nowrap">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════
            FEATURED CATEGORIES GRID
        ════════════════════════════════════ */}
        <section className="px-4 md:px-6 lg:px-8 mb-8 md:mb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: "'Syne', sans-serif" }} className="text-xl md:text-3xl font-bold tracking-tight">
              Pilihan Kategori
            </h2>
          </div>

          {/* Mobile: stacked cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {/* Logam - Big card */}
            <Link
              to="/materials?q=logam"
              className="relative overflow-hidden rounded-3xl min-h-[170px] flex flex-col justify-between p-5 active:scale-[0.98] transition-transform"
              style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)' }}
            >
              <div>
                <span className="bg-white/10 border border-white/20 text-white text-[10px] font-bold
                                 px-3 py-1 rounded-full uppercase tracking-wider">Premium Quality</span>
                <h3 style={{ fontFamily: "'Syne', sans-serif" }}
                    className="text-white text-2xl font-extrabold mt-2 leading-tight">
                  Material Logam<br />&amp; Besi Industri
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25
                               text-white text-xs font-bold px-4 py-2 rounded-xl w-fit">
                Lihat Produk →
              </span>
              {/* decorative emoji */}
              <span className="absolute right-4 bottom-2 text-7xl opacity-10 select-none pointer-events-none">⚙️</span>
            </Link>

            {/* Plastik + Tekstil: side by side */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/materials?q=plastik"
                className="relative bg-blue-50 rounded-2xl p-4 overflow-hidden min-h-[130px] flex flex-col justify-between active:scale-[0.97] transition-transform"
              >
                <div>
                  <h4 style={{ fontFamily: "'Syne', sans-serif" }} className="text-blue-800 font-bold text-base leading-tight">Limbah Plastik</h4>
                  <p className="text-blue-600/70 text-[11px] mt-1 leading-snug">HDPE, PET & LDPE</p>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 bg-blue-600 text-white text-[11px] font-bold
                                 px-3 py-1.5 rounded-lg w-fit">
                  Lihat →
                </span>
                <span className="absolute -right-3 -bottom-3 text-5xl opacity-15 select-none">♻️</span>
              </Link>

              <Link
                to="/products?q=tekstil"
                className="relative bg-pink-50 rounded-2xl p-4 overflow-hidden min-h-[130px] flex flex-col justify-between active:scale-[0.97] transition-transform"
              >
                <div>
                  <h4 style={{ fontFamily: "'Syne', sans-serif" }} className="text-pink-800 font-bold text-base leading-tight">Limbah Tekstil</h4>
                  <p className="text-pink-600/70 text-[11px] mt-1 leading-snug">Kain perca & pakaian</p>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 bg-pink-500 text-white text-[11px] font-bold
                                 px-3 py-1.5 rounded-lg w-fit">
                  Lihat →
                </span>
                <span className="absolute -right-3 -bottom-3 text-5xl opacity-15 select-none">👕</span>
              </Link>
            </div>
          </div>

          {/* Desktop: original 12-col grid */}
          <div className="hidden md:grid md:grid-cols-12 gap-6 h-[450px]">
            <div className="col-span-7 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2.5rem]
                            relative overflow-hidden group shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent" />
              <div className="absolute top-8 left-8 z-20 max-w-[60%]">
                <span className="bg-white/10 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider
                                 px-3 py-1 rounded-full font-semibold mb-4 inline-block border border-white/20">
                  Premium Quality
                </span>
                <h3 style={{ fontFamily: "'Syne', sans-serif" }}
                    className="text-4xl font-extrabold text-white mb-4 leading-tight">
                  Material Logam<br />&amp; Besi Industri
                </h3>
                <Link to="/materials?q=logam"
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-blue-600 text-white
                             font-semibold px-5 py-2.5 rounded-xl text-sm transition-all border border-white/30">
                  Explore Product →
                </Link>
              </div>
              <img src={logamImg} alt="Logam" className="absolute right-[-10%] bottom-[-5%] w-3/4 object-contain z-10
                                                         group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700 opacity-90" />
            </div>

            <div className="col-span-5 grid grid-rows-2 gap-6">
              <div className="bg-gray-50 rounded-[2.5rem] relative overflow-hidden group border border-gray-100 hover:shadow-lg transition-all">
                <div className="absolute inset-0 p-8 z-20 flex flex-col justify-center">
                  <h3 style={{ fontFamily: "'Syne', sans-serif" }} className="text-2xl font-extrabold text-gray-800 mb-2">Limbah Plastik</h3>
                  <p className="text-gray-500 text-sm mb-4">Daur ulang plastik HDPE, PET, & LDPE.</p>
                  <Link to="/materials?q=plastik"
                    className="inline-flex items-center gap-2 bg-gray-200 hover:bg-blue-600 hover:text-white
                               text-gray-800 font-semibold px-4 py-2 rounded-xl text-sm w-fit transition-all">
                    Explore Product →
                  </Link>
                </div>
                <img src={plastikImg} alt="Plastik"
                  className="absolute right-[-20px] bottom-[-20px] w-44 h-44 object-contain z-10 opacity-80 group-hover:scale-110 transition-transform duration-500" />
              </div>

              <div className="bg-gray-50 rounded-[2.5rem] relative overflow-hidden group border border-gray-100 hover:shadow-lg transition-all">
                <div className="absolute inset-0 p-8 z-20 flex flex-col justify-center">
                  <h3 style={{ fontFamily: "'Syne', sans-serif" }} className="text-2xl font-extrabold text-gray-800 mb-2">Limbah Tekstil</h3>
                  <p className="text-gray-500 text-sm mb-4">Sisa kain perca & pakaian layak guna.</p>
                  <Link to="/products?q=tekstil"
                    className="inline-flex items-center gap-2 bg-gray-200 hover:bg-blue-600 hover:text-white
                               text-gray-800 font-semibold px-4 py-2 rounded-xl text-sm w-fit transition-all">
                    Explore Product →
                  </Link>
                </div>
                <img src={kainImg} alt="Tekstil"
                  className="absolute right-[-20px] bottom-[-20px] w-44 h-44 object-contain z-10 opacity-80 group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            AI RECYCLE BANNER (mobile only)
        ════════════════════════════════════ */}
        <section className="md:hidden px-4 mb-8">
          <Link
            to="/ai-recycle"
            className="flex items-center justify-between bg-gray-900 rounded-2xl px-5 py-4 active:scale-[0.98] transition-transform"
          >
            <div>
              <p style={{ fontFamily: "'Syne', sans-serif" }} className="text-white font-bold text-base">AI Recycle ✨</p>
              <p className="text-gray-400 text-xs mt-0.5 leading-relaxed max-w-[200px]">
                Identifikasi limbah secara cerdas & temukan potensinya
              </p>
            </div>
            <div className="bg-blue-600 rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0 ml-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M9 5l7 7-7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
          </Link>
        </section>

        {/* ════════════════════════════════════
            PRODUCTS – horizontal scroll mobile
        ════════════════════════════════════ */}
        <section className="mb-8 md:mb-16">
          <div className="px-4 md:px-6 lg:px-8 flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: "'Syne', sans-serif" }} className="text-xl md:text-3xl font-bold tracking-tight">
              Produk Bulan Ini
            </h2>
            <Link to="/products" className="text-blue-600 text-sm font-semibold">Semua →</Link>
          </div>

          {/* Mobile: horizontal scroll */}
          <div className="flex md:hidden gap-3.5 overflow-x-auto px-4 pb-2 no-scrollbar">
            {loading
              ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : products.map(p => (
                  <ProductCard key={p.id} item={p} type="product" onAddToCart={handleAddToCart} />
                ))
            }
          </div>

          {/* Desktop: 3-col grid */}
          <div className="hidden md:grid grid-cols-3 gap-6 px-6 lg:px-8">
            {loading
              ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : products.slice(0, 3).map(p => (
                  <ProductCard key={p.id} item={p} type="product" onAddToCart={handleAddToCart} />
                ))
            }
          </div>
        </section>

        {/* ════════════════════════════════════
            MATERIALS
        ════════════════════════════════════ */}
        <section className="mb-28 md:mb-20">
          <div className="px-4 md:px-6 lg:px-8 flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: "'Syne', sans-serif" }} className="text-xl md:text-3xl font-bold tracking-tight">
              Material Terbaru
            </h2>
            <Link to="/materials" className="text-blue-600 text-sm font-semibold">Semua →</Link>
          </div>

          {/* Mobile: horizontal scroll */}
          <div className="flex md:hidden gap-3.5 overflow-x-auto px-4 pb-2 no-scrollbar">
            {loading
              ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : materials.map(m => (
                  <ProductCard key={m.id} item={m} type="material" onAddToCart={handleAddToCart} />
                ))
            }
          </div>

          {/* Desktop: 3-col grid */}
          <div className="hidden md:grid grid-cols-3 gap-6 px-6 lg:px-8">
            {loading
              ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : materials.slice(0, 3).map(m => (
                  <ProductCard key={m.id} item={m} type="material" onAddToCart={handleAddToCart} />
                ))
            }
          </div>
        </section>

      </div>{/* /max-w-7xl */}

      {/* Desktop footer */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* ════════════════════════════════════
          MOBILE BOTTOM NAV
      ════════════════════════════════════ */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100
                   flex items-center justify-around px-2 pt-2 pb-safe"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {[
          {
            label: 'Beranda', to: '/', active: true,
            icon: (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[22px] h-[22px]">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            ),
          },
          {
            label: 'Produk', to: '/products', active: false,
            icon: (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[22px] h-[22px]">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            ),
          },
          // Center button: Cart
          null,
          {
            label: 'Material', to: '/materials', active: false,
            icon: (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[22px] h-[22px]">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            ),
          },
          {
            label: 'Akun', to: user ? '/profile' : '/login', active: false,
            icon: (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[22px] h-[22px]">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
          },
        ].map((item, i) => {
          // Center cart button
          if (item === null) {
            return (
              <button
                key="cart"
                onClick={() => navigate('/cart')}
                className="relative -mt-6 w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center
                           shadow-lg shadow-blue-600/40 active:scale-95 transition-transform"
              >
                <svg className="w-6 h-6" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold
                                   rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            );
          }
          return (
            <Link
              key={item.label}
              to={item.to}
              className="flex flex-col items-center gap-1 min-w-[48px]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <span className={item.active ? 'text-blue-600' : 'text-gray-400'}>{item.icon}</span>
              <span className={`text-[10px] font-semibold ${item.active ? 'text-blue-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}