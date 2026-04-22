// src/pages/Materials.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 flex flex-col animate-pulse">
      <div className="h-52 bg-gray-100 rounded-[1rem] mb-4"></div>
      <div className="h-3 bg-gray-100 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-4"></div>
      <div className="h-10 bg-gray-100 rounded-full"></div>
    </div>
  );
}

function MaterialCard({ item }) {
  const gradients = [
    'from-green-100 to-teal-200','from-gray-200 to-gray-300',
    'from-yellow-100 to-orange-200','from-cyan-100 to-blue-200',
    'from-pink-100 to-rose-200','from-indigo-100 to-purple-200',
  ];
  const gradient = gradients[item.id % gradients.length] || gradients[0];
  const conditionMap = { 
    good: { label: 'Baik', cls: 'bg-green-50 text-green-600' }, 
    fair: { label: 'Cukup', cls: 'bg-yellow-50 text-yellow-600' }, 
    poor: { label: 'Kurang', cls: 'bg-red-50 text-red-600' } 
  };
  const cond = conditionMap[item.condition];

  // ✅ Fungsi untuk mendapatkan URL gambar dari berbagai format
  const getImageUrl = () => {
    if (!item.images || item.images.length === 0) return null;
    
    const firstImage = item.images[0];
    // Jika berupa object dengan properti image_url (format baru)
    if (firstImage && typeof firstImage === 'object' && firstImage.image_url) {
      return firstImage.image_url;
    }
    // Jika berupa string URL langsung (format lama)
    if (typeof firstImage === 'string') {
      return firstImage;
    }
    return null;
  };

  const imageUrl = getImageUrl();

  return (
    <Link to={`/materials/${item.id}`} className="group w-full bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
      <div className={`relative bg-gradient-to-tr ${gradient} rounded-[1rem] h-52 mb-4 overflow-hidden`}>
        <span className="absolute top-3 left-3 bg-[#ffd233] text-gray-900 text-[10px] font-bold px-2 py-1 rounded z-10">
          Material
        </span>
        {cond && (
          <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded z-10 ${cond.cls}`}>
            {cond.label}
          </span>
        )}
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
                parent.innerHTML = '<div class="text-5xl opacity-40 select-none flex items-center justify-center w-full h-full">♻️</div>';
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-5xl opacity-40 select-none">♻️</div>
          </div>
        )}
      </div>
      <div className="flex-1">
        <h4 className="text-blue-600 font-bold text-lg mb-1">
          Rp {Number(item.price).toLocaleString('id-ID')}
          {item.unit && <span className="text-gray-400 text-xs font-normal">/{item.unit}</span>}
        </h4>
        <p className="text-gray-800 font-medium text-sm mb-1 line-clamp-2">{item.name}</p>
        <p className="text-gray-400 text-xs mb-1">{item.seller?.name}</p>
        {item.city && <p className="text-gray-400 text-xs mb-4"><i className="fas fa-map-marker-alt mr-1"></i>{item.city}</p>}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-full text-sm font-medium transition-colors">
          Lihat Material
        </button>
      </div>
    </Link>
  );
}
export default function Materials() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [categories, setCategories] = useState([]);

  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || '';
  const category_id = searchParams.get('category_id') || '';
  const condition = searchParams.get('condition') || '';
  const page = searchParams.get('page') || 1;

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: 12, page });
      if (q) params.set('q', q);
      if (sort) params.set('sort', sort);
      if (category_id) params.set('category_id', category_id);
      if (condition) params.set('condition', condition);
      const res = await api.get(`/materials?${params}`);
      setMaterials(res.data.data ?? []);
      setMeta(res.data.meta ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [q, sort, category_id, condition, page]);

  useEffect(() => {
    fetchMaterials();
    api.get('/categories?type=material').then(r => setCategories(r.data ?? [])).catch(() => {});
  }, [fetchMaterials]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  return (
    <div className="bg-white text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <Navbar />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Material Bekas</h1>
            {meta && <p className="text-sm text-gray-500 mt-1">{meta.total} material ditemukan</p>}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <input
                type="text" defaultValue={q}
                onKeyDown={(e) => { if (e.key === 'Enter') setParam('q', e.target.value); }}
                placeholder="Cari material..."
                className="bg-gray-50 border border-gray-100 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
              <i className="fas fa-search absolute left-3.5 top-2.5 text-gray-400 text-xs"></i>
            </div>

            <select value={sort} onChange={(e) => setParam('sort', e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Terbaru</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
            </select>

            <select value={condition} onChange={(e) => setParam('condition', e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Kondisi</option>
              <option value="good">Baik</option>
              <option value="fair">Cukup</option>
              <option value="poor">Kurang</option>
            </select>

            {categories.length > 0 && (
              <select value={category_id} onChange={(e) => setParam('category_id', e.target.value)}
                className="bg-gray-50 border border-gray-100 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Kategori</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : materials.length > 0
              ? materials.map(m => <MaterialCard key={m.id} item={m} />)
              : (
                <div className="col-span-full text-center py-24 text-gray-400">
                  <div className="text-5xl mb-4">♻️</div>
                  <p className="font-medium">Material tidak ditemukan</p>
                </div>
              )
          }
        </div>

        {meta && meta.last_page > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
              <button key={p}
                onClick={() => { const np = new URLSearchParams(searchParams); np.set('page', p); setSearchParams(np); }}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${Number(page) === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}