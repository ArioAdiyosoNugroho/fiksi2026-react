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
    <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 flex flex-col animate-pulse">
      <div className="h-56 bg-gray-100 rounded-[1rem] mb-4"></div>
      <div className="h-4 bg-gray-100 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-4"></div>
      <div className="h-10 bg-gray-100 rounded-full"></div>
    </div>
  );
}

// ✅ ProductCard yang diperbaiki (gambar full container)
function ProductCard({ item, type, onAddToCart }) {
  const navigate = useNavigate();
  const gradients = [
    'from-cyan-100 to-blue-200',
    'from-gray-200 to-gray-300',
    'from-pink-200 to-purple-300',
    'from-yellow-100 to-orange-200',
    'from-green-100 to-teal-200',
    'from-indigo-100 to-blue-300',
  ];
  const gradient = gradients[item.id % gradients.length] || gradients[0];
  const detailPath = type === 'material' ? `/materials/${item.id}` : `/products/${item.id}`;

  const getImageUrl = () => {
    if (!item.images || item.images.length === 0) return null;
    const firstImage = item.images[0];
    if (firstImage && typeof firstImage === 'object' && firstImage.image_url) {
      return firstImage.image_url;
    }
    if (typeof firstImage === 'string') return firstImage;
    return null;
  };

  const imageUrl = getImageUrl();

  return (
    <div className="w-full bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 flex flex-col">
      {/* Container gambar - diubah agar full */}
      <div
        className={`relative bg-gradient-to-tr ${gradient} rounded-[1rem] h-56 mb-4 overflow-hidden cursor-pointer`}
        onClick={() => navigate(detailPath)}
      >
        <span className="absolute top-3 left-3 bg-[#ffd233] text-gray-900 text-[10px] font-bold px-2 py-1 rounded z-10">
          {type === 'material' ? 'Material' : 'Populer'}
        </span>

        <div className="absolute top-3 right-3 flex flex-col space-y-2 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(item, type); }}
            className="w-8 h-8 bg-black/50 hover:bg-black rounded-full text-white flex items-center justify-center text-xs backdrop-blur-sm transition-colors"
            title="Tambah ke keranjang"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
            </svg>
          </button>
          <button className="w-8 h-8 bg-black/50 hover:bg-black rounded-full text-white flex items-center justify-center text-xs backdrop-blur-sm transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-5xl opacity-40 select-none">${type === 'material' ? '♻️' : '🛍️'}</div>`;
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-40 select-none">
            {type === 'material' ? '♻️' : '🛍️'}
          </div>
        )}
      </div>

      <div className="flex-1">
        <h4 className="text-blue-600 font-bold text-xl mb-1">
          Rp {Number(item.price).toLocaleString('id-ID')}
        </h4>
        <p className="text-gray-800 font-medium text-sm mb-4 line-clamp-2">{item.name}</p>
        <button
          onClick={() => onAddToCart(item, type)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-full text-sm font-medium transition-colors"
        >
          Beli Sekarang
        </button>
      </div>
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
          api.get('/products?per_page=3'),
          api.get('/materials?per_page=3'),
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
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await api.post('/cart', { type, id: item.id, quantity: 1 });
      setCartCount(prev => prev + 1);
      showToast(`${item.name} ditambahkan ke keranjang!`);
    } catch (err) {
      showToast('Gagal menambahkan ke keranjang.', 'error');
      console.error(err);
    }
  };

  return (
    <div className="bg-white text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}

      <Navbar cartCount={cartCount} />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section - tidak diubah */}
        <section className="bg-[#f2f4f7] rounded-[2rem] p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden mb-16 min-h-[450px]">
          <div className="w-full md:w-1/2 z-10 relative text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4 text-gray-900">
              Jual & Beli <span className="text-blue-600">Material<br />& Produk</span> Daur<br />Ulang!
            </h1>
            <p className="text-gray-600 mb-8 max-w-md text-sm leading-relaxed">
              Pengiriman cepat, layanan ramah, dan transaksi aman terjamin di resiik.id!
            </p>
            <div className="flex space-x-4">
              <div className="bg-white rounded-2xl p-5 w-48 shadow-sm">
                <h3 className="text-blue-600 font-bold text-xl leading-tight mb-2">Material dan produk<br />Pilihan</h3>
                <p className="text-xs text-gray-800 mb-4 opacity-80">Beli material dan produk berkualitas dengan harga terbaik!</p>
                <Link to="/materials" className="inline-block bg-blue-600 text-white text-xs px-4 py-2 rounded-full font-medium">
                  Jelajahi
                </Link>
              </div>
              {/* <div className="bg-white rounded-2xl p-5 w-48 shadow-sm">
                <span className="bg-[#ffd233] text-gray-900 text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block">20% OFF</span>
                <h3 className="text-blue-600 font-bold text-lg leading-tight mb-4 mt-1">Untuk<br />Semua<br />Produk</h3>
                <Link to="/products" className="inline-block bg-blue-600 text-white text-xs px-4 py-2 rounded-full font-medium">
                  Jelajahi
                </Link>
              </div> */}

              <div className="relative group overflow-hidden bg-slate-900 rounded-2xl p-6 w-52 shadow-xl transition-all duration-500 hover:shadow-blue-500/20 hover:-translate-y-1 border border-slate-800">
                {/* Glow Effect Background */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-600/20 blur-3xl rounded-full group-hover:bg-blue-500/30 transition-colors"></div>

                {/* Icon AI - Menggunakan SVG Bintang Minimalis sebelumnya */}
                <div className="mb-4 text-blue-400">
                  <svg 
                    /* Menggunakan scale-110 atau 125 biasanya sudah cukup untuk kesan eksklusif. 
                      Scale 200 (seperti di snippet kamu) mungkin akan terlalu menutupi teks.
                    */
                    className="w-8 h-8 transition-all duration-700 ease-in-out transform 
                              group-hover:scale-125 group-hover:rotate-12 group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M12 2C12 2 12.6314 7.16642 15.5 10C18.3686 12.8336 22 12 22 12C22 12 16.8336 12.6314 14 15.5C11.1664 18.3686 12 22 12 22C12 22 11.3686 16.8336 8.5 14C5.63142 11.1664 2 12 2 12C2 12 7.16642 11.3686 10 8.5C12.8336 5.63142 12 2 12 2Z" 
                      fill="currentColor"
                    />
                  </svg>
                </div>
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-white font-bold text-lg tracking-tight mb-1">AI Recycle</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-5">
                    Identifikasi limbah secara cerdas dan temukan potensi kreatifnya.
                  </p>

                  <Link 
                    to="/ai-recycle" 
                    className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-blue-400 group-hover:text-blue-300 transition-colors"
                  >
                    Coba Sekarang
                    <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:flex md:w-1/2 justify-end absolute right-0 bottom-0 h-full">
            <img
              src={womenBuyingImg}
              alt="Resiik Marketplace"
              className="h-full object-cover object-top drop-shadow-2xl z-0"
            />
          </div>
        </section>

        {/* Categories Section - Ultra Clean & Premium */}
        <section className="mb-16 py-4">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Kategori Populer</h2>
              <p className="text-gray-500 text-sm mt-1">Pilih jenis material atau produk yang Anda butuhkan</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Semua Kategori <i className="fas fa-arrow-right ml-2 text-xs"></i>
            </Link>
          </div>

          {/* Quick Access Section - Monochrome to Color Reveal */}
          <div className="flex overflow-x-auto pb-8 pt-4 mb-6 no-scrollbar gap-4 md:gap-0 md:justify-between w-full snap-x px-2">            {[
              { name: 'Logam', icon: 'fa-cube', hoverText: 'group-hover:text-orange-500', hoverBorder: 'group-hover:border-orange-200', hoverBg: 'group-hover:bg-orange-50' },
              { name: 'Plastik', icon: 'fa-recycle', hoverText: 'group-hover:text-blue-500', hoverBorder: 'group-hover:border-blue-200', hoverBg: 'group-hover:bg-blue-50' },
              { name: 'Kayu', icon: 'fa-tree', hoverText: 'group-hover:text-emerald-500', hoverBorder: 'group-hover:border-emerald-200', hoverBg: 'group-hover:bg-emerald-50' },
              { name: 'Kertas', icon: 'fa-file-alt', hoverText: 'group-hover:text-amber-500', hoverBorder: 'group-hover:border-amber-200', hoverBg: 'group-hover:bg-amber-50' },
              { name: 'Kaca', icon: 'fa-wine-glass', hoverText: 'group-hover:text-purple-500', hoverBorder: 'group-hover:border-purple-200', hoverBg: 'group-hover:bg-purple-50' },
              { name: 'Elektronik', icon: 'fa-microchip', hoverText: 'group-hover:text-rose-500', hoverBorder: 'group-hover:border-rose-200', hoverBg: 'group-hover:bg-rose-50' },
              { name: 'Tekstil', icon: 'fa-shirt', hoverText: 'group-hover:text-teal-500', hoverBorder: 'group-hover:border-teal-200', hoverBg: 'group-hover:bg-teal-50' },
              { name: 'Semua', icon: 'fa-th-large', hoverText: 'group-hover:text-gray-900', hoverBorder: 'group-hover:border-gray-300', hoverBg: 'group-hover:bg-gray-100' },
            ].map((cat, i) => (
              <Link 
                key={i} 
                to="/products" 
                className="flex flex-col items-center group min-w-[76px] snap-center outline-none"
              >
                {/* Circle Icon - Very Subtle Shadow, Changes on Hover */}
                <div className={`relative w-[60px] h-[60px] md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center mb-3 
                  border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] 
                  transition-all duration-300 ease-out
                  group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.06)] group-hover:-translate-y-1
                  ${cat.hoverBorder} ${cat.hoverBg}`}
                >
                  <i className={`fas ${cat.icon} text-xl text-gray-400 transition-colors duration-300 ${cat.hoverText}`}></i>
                </div>
                
                {/* Label - Clean Typography */}
                <span className="text-[13px] font-semibold text-gray-500 group-hover:text-gray-900 transition-colors duration-300">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        
          {/* Featured Categories Grid - Clean & Consistent */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[450px]">
            
            {/* 1. KATEGORI LOGAM - Kartu Utama Kiri */}
            <div className="md:col-span-7 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2.5rem] relative overflow-hidden group shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent z-0"></div>
              
              <div className="absolute top-8 left-8 z-20 max-w-[60%]">
                <span className="bg-white/10 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-semibold mb-4 inline-block border border-white/20">
                  Premium Quality
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">Material Logam<br/>& Besi Industri</h3>
                {/* Tombol seragam: hover biru primary */}
                <Link 
                  to="/materials?q=logam" 
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-blue-600 hover:text-white text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-300 border border-white/30 hover:border-blue-600"
                >
                  Explore Product <i className="fas fa-arrow-right text-xs"></i>
                </Link>
              </div>

              <img 
                src={logamImg} 
                alt="Logam Waste" 
                className="absolute right-[-10%] bottom-[-5%] w-3/4 h-auto object-contain z-10 transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:-rotate-3 opacity-90" 
              />
            </div>

            {/* Secondary Column (Kanan) */}
            <div className="md:col-span-5 grid grid-rows-2 gap-6">
              
              {/* 2. KATEGORI PLASTIK - Atas Kanan */}
              <div className="bg-gray-50 rounded-[2.5rem] relative overflow-hidden group border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 p-8 z-20 flex flex-col justify-center">
                  <h3 className="text-2xl font-extrabold text-gray-800 mb-2">Limbah Plastik</h3>
                  <p className="text-gray-500 text-sm mb-4 max-w-[180px] leading-relaxed">Daur ulang plastik HDPE, PET, & LDPE.</p>
                  <Link 
                    to="/materials?q=plastik" 
                    className="inline-flex items-center gap-2 bg-gray-200 hover:bg-blue-600 hover:text-white text-gray-800 font-semibold px-4 py-2 rounded-xl text-sm w-fit transition-all duration-300"
                  >
                    Explore Product <i className="fas fa-arrow-right text-xs"></i>
                  </Link>
                </div>
                <img 
                  src={plastikImg}
                  alt="Plastic Waste" 
                  className="absolute right-[-20px] bottom-[-20px] w-44 h-44 object-contain z-10 opacity-80 group-hover:scale-110 transition-transform duration-500" 
                />
              </div>

              {/* 3. KATEGORI TEKSTIL - Bawah Kanan */}
              <div className="bg-gray-50 rounded-[2.5rem] relative overflow-hidden group border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 p-8 z-20 flex flex-col justify-center">
                  <h3 className="text-2xl font-extrabold text-gray-800 mb-2">Limbah Tekstil</h3>
                  <p className="text-gray-500 text-sm mb-4 max-w-[180px] leading-relaxed">Sisa kain perca & pakaian layak guna.</p>
                  <Link 
                    to="/products?q=tekstil" 
                    className="inline-flex items-center gap-2 bg-gray-200 hover:bg-blue-600 hover:text-white text-gray-800 font-semibold px-4 py-2 rounded-xl text-sm w-fit transition-all duration-300"
                  >
                    Explore Product <i className="fas fa-arrow-right text-xs"></i>
                  </Link>
                </div>
                <img 
                  src={kainImg}
                  alt="Textile Waste" 
                  className="absolute right-[-20px] bottom-[-20px] w-44 h-44 object-contain z-10 opacity-80 group-hover:scale-110 transition-transform duration-500" 
                />
              </div>

            </div>
          </div>
        
          {/* Mobile "See All" Button */}
          <div className="mt-6 md:hidden">
            <Link to="/products" className="w-full flex justify-center items-center py-3.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold text-sm shadow-sm active:bg-gray-50 transition-colors">
              Lihat Semua Kategori <i className="fas fa-chevron-right ml-2 text-[10px]"></i>
            </Link>
          </div>
        </section>
        
        {/* Products Section */}
        <section className="mb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Produk Bulan Ini</h2>
            <Link to="/products" className="text-blue-600 text-sm font-medium hover:underline flex items-center">
              Lihat semua <i className="fas fa-chevron-right ml-1 text-xs"></i>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {loading
              ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : products.map((p) => (
                  <ProductCard key={p.id} item={p} type="product" onAddToCart={handleAddToCart} />
                ))
            }
          </div>
        </section>

        {/* Materials Section */}
        <section className="mb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Material Bekas Terbaru</h2>
            <Link to="/materials" className="text-blue-600 text-sm font-medium hover:underline flex items-center">
              Lihat semua <i className="fas fa-chevron-right ml-1 text-xs"></i>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {loading
              ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : materials.map((m) => (
                  <ProductCard key={m.id} item={m} type="material" onAddToCart={handleAddToCart} />
                ))
            }
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}