// src/pages/MaterialDetail.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Skeleton loading (sama seperti ProductDetail)
function SkeletonDetail() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="bg-gray-100 rounded-[2rem] h-[460px] mb-4"></div>
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-20 bg-gray-100 rounded-[1rem]"></div>
            ))}
          </div>
        </div>
        <div className="space-y-4 pt-4">
          <div className="h-4 bg-gray-100 rounded w-1/4"></div>
          <div className="h-8 bg-gray-100 rounded w-3/4"></div>
          <div className="h-5 bg-gray-100 rounded w-1/3"></div>
          <div className="h-24 bg-gray-100 rounded-2xl"></div>
          <div className="h-14 bg-gray-100 rounded-2xl"></div>
          <div className="h-12 bg-gray-100 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

// StarRating (sama)
function StarRating({ rating = 0, size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-sm' : 'text-base';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        if (rating >= star) return <i key={star} className={`fas fa-star text-amber-400 ${sizeClass}`}></i>;
        if (rating >= star - 0.5) return <i key={star} className={`fas fa-star-half-alt text-amber-400 ${sizeClass}`}></i>;
        return <i key={star} className={`far fa-star text-gray-300 ${sizeClass}`}></i>;
      })}
    </div>
  );
}

// Related Material Card (mirip RelatedCard)
function RelatedMaterialCard({ material }) {
  const imageUrl = material?.images?.[0]?.image_url || null;
  return (
    <Link
      to={`/materials/${material.id}`}
      className="group bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 flex flex-col hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="relative bg-gradient-to-tr from-gray-100 to-blue-50 rounded-[1rem] h-40 mb-3 flex items-center justify-center p-3 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={material.name}
            className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="text-5xl opacity-20">♻️</div>
        )}
      </div>
      <p className="text-xs font-semibold text-gray-800 mb-1 leading-tight line-clamp-2">{material.name}</p>
      <span className="text-blue-600 font-bold text-sm mt-auto">
        Rp {Number(material.price).toLocaleString('id-ID')}
      </span>
    </Link>
  );
}

// ReviewForm (sama persis, hanya untuk material)
function ReviewForm({ materialId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rating) { setError('Pilih rating terlebih dahulu.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/reviews/material/${materialId}`, { rating, comment });
      setRating(0);
      setComment('');
      onSubmitted();
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal mengirim ulasan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-100 rounded-[1.5rem] p-5 bg-gray-50 mb-6">
      <h4 className="font-semibold text-gray-800 mb-3">Tulis Ulasan Anda</h4>
      <div className="flex items-center gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            className="text-2xl transition-colors"
          >
            <i className={`${(hovered || rating) >= star ? 'fas text-amber-400' : 'far text-gray-300'} fa-star`}></i>
          </button>
        ))}
        <span className="text-sm text-gray-500 ml-1">{rating > 0 ? `${rating} bintang` : 'Pilih rating'}</span>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Bagikan pengalaman Anda dengan material ini..."
        className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        rows={3}
        maxLength={1000}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-2"
      >
        {submitting ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Mengirim...</> : <><i className="fas fa-paper-plane"></i> Kirim Ulasan</>}
      </button>
    </div>
  );
}

export default function MaterialDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Material state
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  // Cart state
  const [addingCart, setAddingCart] = useState(false);
  const [cartMsg, setCartMsg] = useState({ text: '', type: '' });

  // Image modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImgIndex, setModalImgIndex] = useState(0);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewMeta, setReviewMeta] = useState({ avg_rating: 0, total_reviews: 0, distribution: {} });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(5);
  const [hasPurchased, setHasPurchased] = useState(false);

  // Related materials
  const [related, setRelated] = useState([]);

  // Active tab
  const [activeTab, setActiveTab] = useState('description');

  // Kondisi mapping
  const conditionMap = {
    good: { label: 'Baik', color: 'bg-green-100 text-green-700', icon: 'fa-check-circle' },
    fair: { label: 'Cukup', color: 'bg-yellow-100 text-yellow-700', icon: 'fa-exclamation-circle' },
    poor: { label: 'Kurang', color: 'bg-red-100 text-red-700', icon: 'fa-times-circle' },
  };

  // Fetch Material
  useEffect(() => {
    setLoading(true);
    api.get(`/materials/${id}`)
      .then(r => {
        setMaterial(r.data);
        setActiveImg(0);
        if (r.data.category_id) {
          api.get(`/materials?category_id=${r.data.category_id}&per_page=4`)
            .then(res => {
              const filtered = (res.data.data || []).filter(m => m.id !== r.data.id).slice(0, 4);
              setRelated(filtered);
            })
            .catch(() => {});
        }
      })
      .catch(() => navigate('/materials'))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch Reviews
  const fetchReviews = useCallback(() => {
    setReviewsLoading(true);
    api.get(`/reviews/material/${id}`)
      .then(r => {
        setReviews(r.data.reviews || []);
        setReviewMeta({
          avg_rating: r.data.avg_rating || 0,
          total_reviews: r.data.total_reviews || 0,
          distribution: r.data.distribution || {},
        });
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [id]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // Check if user purchased this material
  useEffect(() => {
    if (!user) return;
    api.get(`/orders/check-purchased/material/${id}`)
      .then(r => setHasPurchased(r.data.purchased || false))
      .catch(() => setHasPurchased(false));
  }, [user, id]);

  // Image URLs
  const imageUrls = useMemo(() => {
    if (!material?.images || !Array.isArray(material.images)) return [];
    return material.images
      .map(img => (typeof img === 'string' ? img : img?.image_url))
      .filter(url => typeof url === 'string' && url.length > 0);
  }, [material]);

  // Cart actions
  const addToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAddingCart(true);
    try {
      await api.post('/cart', { type: 'material', id: material.id, quantity: qty });
      setCartMsg({ text: 'Material ditambahkan ke keranjang!', type: 'success' });
    } catch {
      setCartMsg({ text: 'Gagal menambahkan ke keranjang.', type: 'error' });
    } finally {
      setAddingCart(false);
      setTimeout(() => setCartMsg({ text: '', type: '' }), 3000);
    }
  };

  const buyNow = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/cart', { type: 'material', id: material.id, quantity: qty });
      navigate('/checkout');
    } catch {
      setCartMsg({ text: 'Gagal memproses. Coba lagi.', type: 'error' });
      setTimeout(() => setCartMsg({ text: '', type: '' }), 3000);
    }
  };

  // Share
  const shareMaterial = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(material?.name || '');
    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
    };
    if (platform === 'copy') {
      navigator.clipboard.writeText(window.location.href);
      setCartMsg({ text: 'Link disalin!', type: 'success' });
      setTimeout(() => setCartMsg({ text: '', type: '' }), 2000);
      return;
    }
    window.open(links[platform], '_blank');
  };

  // Modal
  const openModal = (index) => { setModalImgIndex(index); setIsModalOpen(true); document.body.style.overflow = 'hidden'; };
  const closeModal = () => { setIsModalOpen(false); document.body.style.overflow = 'auto'; };
  const nextImage = () => setModalImgIndex(p => (p + 1) % imageUrls.length);
  const prevImage = () => setModalImgIndex(p => (p - 1 + imageUrls.length) % imageUrls.length);

  useEffect(() => {
    const handler = (e) => {
      if (!isModalOpen) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isModalOpen, imageUrls.length]);

  // Rating distribution
  const getRatingPercent = (star) => {
    const total = reviewMeta.total_reviews;
    if (!total) return 0;
    return Math.round(((reviewMeta.distribution[star] || 0) / total) * 100);
  };

  if (loading) return <SkeletonDetail />;
  if (!material) return <NotFound />;

  return (
    <div className="bg-white text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
          <Link to="/" className="hover:text-blue-600">Beranda</Link>
          <i className="fas fa-chevron-right text-xs"></i>
          <Link to="/materials" className="hover:text-blue-600">Material</Link>
          {material?.category && <>
            <i className="fas fa-chevron-right text-xs"></i>
            <Link to={`/materials?category_id=${material.category.id}`} className="hover:text-blue-600">
              {material.category.name}
            </Link>
          </>}
          <i className="fas fa-chevron-right text-xs"></i>
          <span className="text-gray-700 truncate max-w-[200px]">{material.name}</span>
        </nav>

        {/* ── MATERIAL SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* LEFT: Images */}
          <div>
            <div
              className="bg-gradient-to-tr from-cyan-100 to-blue-200 rounded-[2rem] h-[460px] flex items-center justify-center mb-4 relative overflow-hidden cursor-pointer group"
              onClick={() => imageUrls.length > 0 && openModal(activeImg)}
            >
              {imageUrls.length > 0 ? (
                <img
                  key={imageUrls[activeImg]}
                  src={imageUrls[activeImg]}
                  alt={material.name}
                  className="w-full h-full object-cover drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl opacity-20">♻️</div>
              )}
              {/* Zoom hint */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/90 rounded-full p-3 shadow-lg">
                  <i className="fas fa-search-plus text-gray-700 text-xl"></i>
                </div>
              </div>
              {/* Badges */}
              {material.condition && (
                <span className={`absolute top-5 left-5 text-xs font-bold px-3 py-1 rounded-full z-10 ${conditionMap[material.condition]?.color || 'bg-gray-100 text-gray-700'}`}>
                  {conditionMap[material.condition]?.label || material.condition}
                </span>
              )}
              {material.quantity === 0 && (
                <span className="absolute top-5 right-5 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">Habis</span>
              )}
            </div>

            {/* Thumbnails */}
            {imageUrls.length > 1 && (
              <div className="flex gap-3 justify-center overflow-x-auto pb-2">
                {imageUrls.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-20 h-20 rounded-[1rem] overflow-hidden border-2 transition-all flex-shrink-0 bg-gradient-to-tr from-gray-100 to-blue-50 ${
                      activeImg === i ? 'border-blue-600 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${i + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }} 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Info */}
          <div>
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {material.category && (
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">
                  {material.category.name}
                </span>
              )}
              <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${
                material.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${material.quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {material.quantity > 0 ? 'Tersedia' : 'Habis'}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{material.name}</h1>

            {/* Rating Row */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <StarRating rating={reviewMeta.avg_rating} size="md" />
              <span className="text-sm font-semibold text-gray-700">{reviewMeta.avg_rating || '0.0'}</span>
              <span className="text-sm text-gray-300">|</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-sm text-blue-600 hover:underline"
              >
                {reviewMeta.total_reviews} ulasan
              </button>
              <span className="text-sm text-gray-300">|</span>
              <span className="text-sm text-gray-500">
                Stok: <strong className="text-gray-800">{material.quantity}</strong> {material.unit || 'kg'}
              </span>
            </div>

            {/* Price Box */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6 flex items-end gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Harga</p>
                <span className="text-4xl font-bold text-blue-600">
                  Rp {Number(material.price).toLocaleString('id-ID')}
                </span>
                {material.unit && <span className="text-gray-400 text-sm ml-1">/{material.unit}</span>}
              </div>
            </div>

            {/* Qty + Actions */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-lg font-medium"
                >−</button>
                <span className="w-12 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  disabled={material.quantity === 0}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-lg font-medium"
                >+</button>
              </div>

              <button
                onClick={addToCart}
                disabled={addingCart || material.quantity === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-full text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                {addingCart
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Menambahkan...</>
                  : material.quantity === 0
                    ? <><i className="fas fa-times-circle"></i> Stok Habis</>
                    : <><i className="fas fa-shopping-cart"></i> Tambah ke Keranjang</>
                }
              </button>

              <button
                onClick={buyNow}
                disabled={material.quantity === 0}
                className="px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Beli Sekarang
              </button>
            </div>

            {/* Cart Notification */}
            {cartMsg.text && (
              <div className={`text-sm px-4 py-3 rounded-xl flex items-center gap-2 mb-4 ${
                cartMsg.type === 'error'
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'bg-green-50 text-green-600 border border-green-100'
              }`}>
                <i className={`fas ${cartMsg.type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
                {cartMsg.text}
              </div>
            )}

            {/* Delivery Info (sama) */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: 'fa-truck', color: 'blue', label: 'Pengiriman', sub: 'Tersedia' },
                { icon: 'fa-shield-alt', color: 'green', label: 'Material Asli', sub: 'Terjamin' },
                { icon: 'fa-headset', color: 'yellow', label: 'Dukungan', sub: '24/7' },
              ].map(({ icon, color, label, sub }) => (
                <div key={label} className="bg-gray-50 rounded-2xl p-4 text-center">
                  <div className={`w-8 h-8 bg-${color}-100 rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <i className={`fas ${icon} text-${color}-600 text-xs`}></i>
                  </div>
                  <p className="text-xs font-semibold text-gray-700">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Share */}
            <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
              <span className="text-sm text-gray-500 font-medium">Bagikan:</span>
              <button onClick={() => shareMaterial('facebook')} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-600 hover:text-white flex items-center justify-center text-gray-500 text-xs transition-colors">
                <i className="fab fa-facebook-f"></i>
              </button>
              <button onClick={() => shareMaterial('twitter')} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#1DA1F2] hover:text-white flex items-center justify-center text-gray-500 text-xs transition-colors">
                <i className="fab fa-twitter"></i>
              </button>
              <button onClick={() => shareMaterial('whatsapp')} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#25D366] hover:text-white flex items-center justify-center text-gray-500 text-xs transition-colors">
                <i className="fab fa-whatsapp"></i>
              </button>
              <button onClick={() => shareMaterial('copy')} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-800 hover:text-white flex items-center justify-center text-gray-500 text-xs transition-colors ml-auto" title="Salin link">
                <i className="fas fa-link"></i>
              </button>
            </div>
          </div>
        </div>

        {/* ── TABS SECTION ── */}
        <div className="mb-20">
          {/* Tab Buttons */}
          <div className="flex border-b border-gray-100 mb-8 gap-8 overflow-x-auto">
            {[
              { key: 'description', label: 'Deskripsi' },
              { key: 'seller', label: 'Informasi Toko' },
              { key: 'reviews', label: `Ulasan (${reviewMeta.total_reviews})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-sm font-semibold pb-3 whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 hover:text-gray-800 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Description */}
          {activeTab === 'description' && (
            <div className="animate-fadeIn">
              {material.description ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Deskripsi Material</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{material.description}</p>
                  </div>
                  {imageUrls.length > 0 && (
                    <div className="relative bg-gradient-to-tr from-cyan-100 to-blue-200 rounded-[2rem] h-72 overflow-hidden">
                      <img
                        src={imageUrls[0]}
                        alt={material.name}
                        className="absolute inset-0 w-full h-full object-cover drop-shadow-xl"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">Tidak ada deskripsi untuk material ini.</p>
              )}
            </div>
          )}

          {/* Tab: Seller Info (sama persis dengan ProductDetail) */}
          {activeTab === 'seller' && (
            <div className="animate-fadeIn">
              {material.seller ? (
                <div className="bg-gray-50 rounded-[1.5rem] p-6">
                  {/* Header - Foto Profil & Nama Toko */}
                  <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-200">
                    <div className="flex-shrink-0">
                      {material.seller.avatar ? (
                        <img 
                          src={material.seller.avatar.startsWith('http') 
                            ? material.seller.avatar 
                            : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${material.seller.avatar}`
                          }
                          alt={material.seller.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg font-bold border-2 border-white shadow-sm ${material.seller.avatar ? 'hidden' : 'flex'}`}
                        style={{ display: material.seller.avatar ? 'none' : 'flex' }}
                      >
                        {material.seller.name?.[0]?.toUpperCase() || 'S'}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{material.seller.name}</h3>
                      {material.seller.bio && (
                        <p className="text-sm text-gray-500">{material.seller.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* Info Kontak */}
                  <div className="space-y-3 text-sm">
                    {material.seller.phone && (
                      <p className="flex items-center gap-3 text-gray-600">
                        <i className="fas fa-phone text-gray-400 w-4"></i>
                        {material.seller.phone}
                      </p>
                    )}
                    {material.seller.address && (
                      <p className="flex items-start gap-3 text-gray-600">
                        <i className="fas fa-map-marker-alt text-gray-400 w-4 mt-0.5"></i>
                        <span>{material.seller.address}</span>
                      </p>
                    )}
                    {material.seller.google_maps_link && (
                      <a
                        href={material.seller.google_maps_link}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <i className="fas fa-map text-gray-400 w-4"></i>
                        Lihat di Google Maps
                      </a>
                    )}
                  </div>

                  {/* Metode Pembayaran */}
                  {material.seller.bank_accounts && material.seller.bank_accounts.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-2">
                        <i className="fas fa-credit-card"></i> METODE PEMBAYARAN
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {material.seller.bank_accounts.map((bank, i) => (
                          <span 
                            key={i} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200 text-xs text-gray-700"
                          >
                            <i className="fas fa-university text-gray-400 text-[10px]"></i>
                            {bank.bank_name}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2">
                        *Detail nomor rekening akan ditampilkan saat checkout
                      </p>
                    </div>
                  )}

                  {/* Tombol Aksi */}
                  <div className="flex gap-3 mt-6">
                    {material.seller.whatsapp && (
                      <a
                        href={`https://wa.me/${material.seller.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fab fa-whatsapp"></i> Chat Penjual
                      </a>
                    )}
                    <Link
                      to={`/seller/${material.seller.id}`}
                      className="flex-1 border border-gray-300 hover:border-blue-600 hover:text-blue-600 text-gray-700 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-store"></i> Lihat Toko
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-[1.5rem] p-8 text-center">
                  <i className="fas fa-store-slash text-3xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500 text-sm">Informasi toko tidak tersedia.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Reviews */}
          {activeTab === 'reviews' && (
            <div className="animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Rating Summary */}
                <div className="bg-gray-50 rounded-[1.5rem] p-6 h-fit">
                  <div className="text-center mb-6">
                    <div className="text-7xl font-bold text-gray-900 mb-2">
                      {reviewMeta.avg_rating || '0.0'}
                    </div>
                    <div className="flex justify-center mb-2">
                      <StarRating rating={reviewMeta.avg_rating} size="md" />
                    </div>
                    <p className="text-sm text-gray-500">
                      Berdasarkan {reviewMeta.total_reviews} ulasan
                    </p>
                  </div>

                  {/* Distribution bars */}
                  <div className="space-y-2.5">
                    {[5, 4, 3, 2, 1].map(star => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-600 w-4">{star}</span>
                        <i className="fas fa-star text-amber-400 text-xs"></i>
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 rounded-full h-1.5 transition-all duration-500"
                            style={{ width: `${getRatingPercent(star)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{getRatingPercent(star)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Write Review (only if purchased) */}
                  {user && hasPurchased && (
                    <ReviewForm materialId={id} onSubmitted={() => { fetchReviews(); }} />
                  )}
                  {user && !hasPurchased && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700 mb-4 flex items-center gap-2">
                      <i className="fas fa-info-circle"></i>
                      Anda dapat memberi ulasan setelah membeli dan menyelesaikan pesanan material ini.
                    </div>
                  )}
                  {!user && (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm text-gray-600 mb-4 flex items-center gap-2">
                      <i className="fas fa-lock text-gray-400"></i>
                      <Link to="/login" className="text-blue-600 hover:underline font-medium">Masuk</Link> untuk menulis ulasan.
                    </div>
                  )}

                  {reviewsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <i className="far fa-comment-dots text-4xl mb-3 block"></i>
                      <p className="text-sm">Belum ada ulasan untuk material ini.</p>
                    </div>
                  ) : (
                    <>
                      {reviews.slice(0, reviewPage).map((review) => (
                        <div key={review.id} className="border border-gray-100 rounded-[1.5rem] p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {review.user?.avatar ? (
                                <img
                                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${review.user.avatar}`}
                                  alt={review.user.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `<div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">${review.user?.name?.[0]?.toUpperCase() || '?'}</div>`;
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                                  {review.user?.name?.[0]?.toUpperCase() || '?'}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-sm text-gray-800">{review.user?.name || 'Anonim'}</p>
                                <StarRating rating={review.rating} size="sm" />
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      ))}

                      {reviews.length > reviewPage && (
                        <button
                          onClick={() => setReviewPage(p => p + 5)}
                          className="w-full py-3 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-blue-600 hover:text-blue-600 font-medium transition-colors"
                        >
                          Muat Lebih Banyak Ulasan
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RELATED MATERIALS ── */}
        {related.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Material Serupa</h2>
              {material?.category_id && (
                <Link
                  to={`/materials?category_id=${material.category_id}`}
                  className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
                >
                  Lihat semua <i className="fas fa-chevron-right text-xs"></i>
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map(m => <RelatedMaterialCard key={m.id} material={m} />)}
            </div>
          </div>
        )}
      </div>

      {/* ── IMAGE MODAL ── */}
      {isModalOpen && imageUrls.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={closeModal}>
          <button onClick={closeModal} className="absolute top-5 right-5 text-white/80 hover:text-white bg-black/30 rounded-full w-10 h-10 flex items-center justify-center z-10">
            <i className="fas fa-times text-xl"></i>
          </button>
          {imageUrls.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/30 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/50">
              <i className="fas fa-chevron-left text-xl"></i>
            </button>
          )}
          {imageUrls.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/30 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/50">
              <i className="fas fa-chevron-right text-xl"></i>
            </button>
          )}
          <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={imageUrls[modalImgIndex]} alt={`${material.name} - ${modalImgIndex + 1}`} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
          </div>
          <div className="absolute bottom-5 text-white/70 text-sm bg-black/40 py-2 px-4 rounded-full backdrop-blur-sm">
            {modalImgIndex + 1} / {imageUrls.length} • {material.name}
          </div>
          {imageUrls.length > 1 && (
            <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 overflow-x-auto px-4">
              {imageUrls.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setModalImgIndex(idx); }}
                  className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === modalImgIndex ? 'border-white ring-2 ring-blue-400' : 'border-white/40 hover:border-white'
                  }`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Footer />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease; }
      `}</style>
    </div>
  );
}

function NotFound() {
  return (
    <div className="text-center py-24">
      <i className="fas fa-recycle text-6xl text-gray-300 mb-4 block"></i>
      <p className="text-gray-500">Material tidak ditemukan</p>
      <Link to="/materials" className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium">
        ← Kembali ke halaman material
      </Link>
    </div>
  );
}