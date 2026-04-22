// src/pages/Products.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[1.5rem] p-3 sm:p-4 shadow-sm border border-gray-100 flex flex-col animate-pulse">
      <div className="h-44 sm:h-52 bg-gray-100 rounded-[1rem] mb-3 sm:mb-4"></div>
      <div className="h-3 bg-gray-100 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-3 sm:mb-4"></div>
      <div className="h-9 sm:h-10 bg-gray-100 rounded-full"></div>
    </div>
  );
}

function ProductCard({ item }) {
  const gradients = [
    'from-cyan-100 to-blue-200','from-gray-200 to-gray-300',
    'from-pink-200 to-purple-300','from-yellow-100 to-orange-200',
    'from-green-100 to-teal-200','from-indigo-100 to-blue-300',
  ];
  const gradient = gradients[item.id % gradients.length] || gradients[0];

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
    <Link to={`/products/${item.id}`} className="group w-full bg-white rounded-[1.5rem] p-3 sm:p-4 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
      <div className={`relative bg-gradient-to-tr ${gradient} rounded-[1rem] h-44 sm:h-52 mb-3 sm:mb-4 overflow-hidden`}>
        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#ffd233] text-gray-900 text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded z-10">
          Populer
        </span>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl sm:text-5xl opacity-40 select-none">🛍️</div>';
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl sm:text-5xl opacity-40 select-none">🛍️</div>
          </div>
        )}
      </div>
      <div className="flex-1">
        <h4 className="text-blue-600 font-bold text-base sm:text-lg mb-1">
          Rp {Number(item.price).toLocaleString('id-ID')}
        </h4>
        <p className="text-gray-800 font-medium text-xs sm:text-sm mb-1 line-clamp-2">{item.name}</p>
        <p className="text-gray-400 text-[10px] sm:text-xs mb-3 sm:mb-4">{item.seller?.name}</p>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors">
          Lihat Produk
        </button>
      </div>
    </Link>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [categories, setCategories] = useState([]);

  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || '';
  const category_id = searchParams.get('category_id') || '';
  const page = searchParams.get('page') || 1;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: 12, page });
      if (q) params.set('q', q);
      if (sort) params.set('sort', sort);
      if (category_id) params.set('category_id', category_id);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.data ?? []);
      setMeta(res.data.meta ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [q, sort, category_id, page]);

  useEffect(() => {
    fetchProducts();
    api.get('/categories?type=product').then(r => setCategories(r.data ?? [])).catch(() => {});
  }, [fetchProducts]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  return (
    <div className="bg-white text-gray-800 pb-20 md:pb-0" style={{ fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <Navbar />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Semua Produk</h1>
            {meta && <p className="text-xs md:text-sm text-gray-500 mt-1">{meta.total} produk ditemukan</p>}
          </div>

          {/* Search Bar - Full width on mobile */}
          <div className="relative w-full sm:w-auto sm:min-w-[260px]">
            <input
              type="text"
              defaultValue={q}
              onKeyDown={(e) => { if (e.key === 'Enter') setParam('q', e.target.value); }}
              placeholder="Cari produk..."
              className="w-full bg-gray-50 border border-gray-100 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <i className="fas fa-search absolute left-4 top-3 text-gray-400 text-xs"></i>
          </div>
        </div>

        {/* Filter Bar - Scrollable on mobile */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar md:overflow-visible md:flex-wrap">
            {/* Sort Dropdown */}
            <select 
              value={sort} 
              onChange={(e) => setParam('sort', e.target.value)}
              className="flex-shrink-0 bg-gray-50 border border-gray-100 rounded-full py-2 px-4 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Terbaru</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
            </select>

            {/* Category Dropdown */}
            {categories.length > 0 && (
              <select 
                value={category_id} 
                onChange={(e) => setParam('category_id', e.target.value)}
                className="flex-shrink-0 bg-gray-50 border border-gray-100 rounded-full py-2 px-4 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Kategori</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}

            {/* Clear Filters Button (optional) */}
            {(q || sort || category_id) && (
              <button
                onClick={() => setSearchParams({})}
                className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-2"
              >
                <i className="fas fa-times mr-1"></i>Reset
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : products.length > 0
              ? products.map(p => <ProductCard key={p.id} item={p} />)
              : (
                <div className="col-span-full text-center py-16 md:py-24 text-gray-400">
                  <div className="text-4xl md:text-5xl mb-4">🛍️</div>
                  <p className="font-medium text-sm md:text-base">Produk tidak ditemukan</p>
                </div>
              )
          }
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex justify-center gap-1 md:gap-2 mt-8 md:mt-12">
            {Array.from({ length: Math.min(meta.last_page, 7) }, (_, i) => {
              // Simple logic to show limited pages on mobile
              let pageNum;
              if (meta.last_page <= 7) {
                pageNum = i + 1;
              } else if (Number(page) <= 4) {
                pageNum = i + 1;
              } else if (Number(page) >= meta.last_page - 3) {
                pageNum = meta.last_page - 6 + i;
              } else {
                pageNum = Number(page) - 3 + i;
              }
              
              return (
                <button 
                  key={pageNum}
                  onClick={() => { 
                    const np = new URLSearchParams(searchParams); 
                    np.set('page', pageNum); 
                    setSearchParams(np); 
                  }}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full text-xs md:text-sm font-medium transition-colors ${
                    Number(page) === pageNum 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}