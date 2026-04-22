// src/pages/Cart.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-2/3"></div>
        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
      </div>
      <div className="h-8 bg-gray-100 rounded-full w-24"></div>
    </div>
  );
}

// Helper function untuk mendapatkan URL gambar (lebih robust)
function getImageUrl(item) {
  if (!item) return null;
  // Coba ambil dari images array
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    const first = item.images[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object') {
      return first.image_url || first.url || null;
    }
  }
  // Fallback: jika tidak ada, cek properti langsung (misal dari response lama)
  if (item.image_url) return item.image_url;
  if (item.url) return item.url;
  return null;
}

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      console.log('Cart response:', res.data);
      setCart(res.data);
    } catch (err) {
      console.error('Fetch cart error:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQty = async (itemId, quantity) => {
    try {
      // Pastikan endpoint sesuai dengan route di backend: PUT /cart/{id}
      await api.put(`/cart/${itemId}`, { quantity });
      fetchCart();
    } catch (err) {
      console.error('Update quantity error:', err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      fetchCart();
    } catch (err) {
      console.error('Remove item error:', err);
    }
  };

  const clearCart = async () => {
    if (!confirm('Kosongkan semua keranjang?')) return;
    try {
      await api.delete('/cart/clear');
      fetchCart();
    } catch (err) {
      console.error('Clear cart error:', err);
    }
  };

  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="bg-white text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <Navbar />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Keranjang Belanja</h1>

        {loading ? (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm divide-y divide-gray-50">
            {Array(3).fill(0).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Keranjang kamu kosong</h2>
            <p className="text-gray-400 text-sm mb-6">
              Yuk mulai belanja produk & material daur ulang!
            </p>
            <Link
              to="/products"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-sm font-semibold transition-colors"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Daftar Item */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm divide-y divide-gray-50">
                {items.map((item) => {
                  const imageUrl = getImageUrl(item.itemable);
                  const isMaterial = item.itemable_type?.includes('Material');
                  // Debug: lihat item
                  console.log('Cart item:', item.id, item.itemable?.name, 'imageUrl:', imageUrl);
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-5">
                      {/* Gambar */}
                      <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.itemable?.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image failed to load:', imageUrl);
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `<span class="text-2xl">${
                                isMaterial ? '♻️' : '🛍️'
                              }</span>`;
                            }}
                          />
                        ) : (
                          <span className="text-2xl">{isMaterial ? '♻️' : '🛍️'}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm line-clamp-2">
                          {item.itemable?.name}
                        </p>
                        <p className="text-blue-600 font-bold mt-1">
                          Rp {Number(item.price).toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-400">{item.itemable?.seller?.name}</p>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center border border-gray-200 rounded-full">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateQty(item.id, item.quantity - 1)
                              : removeItem(item.id)
                          }
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 rounded-full"
                        >
                          <i className="fas fa-minus text-xs"></i>
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 rounded-full"
                        >
                          <i className="fas fa-plus text-xs"></i>
                        </button>
                      </div>

                      {/* Subtotal & Hapus */}
                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-sm text-gray-800">
                          Rp {Number(item.price * item.quantity).toLocaleString('id-ID')}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600 text-xs mt-1 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={clearCart}
                className="mt-4 text-sm text-red-400 hover:text-red-600 transition-colors"
              >
                <i className="fas fa-trash mr-1"></i> Kosongkan keranjang
              </button>
            </div>

            {/* Ringkasan */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Ringkasan Pesanan</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal ({items.length} item)</span>
                    <span>Rp {Number(total).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Ongkir</span>
                    <span className="text-green-600 font-medium">Gratis</span>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-blue-600">Rp {Number(total).toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full text-sm font-semibold transition-colors"
                >
                  Lanjut ke Pembayaran
                </button>
                <Link
                  to="/products"
                  className="block text-center text-sm text-gray-400 hover:text-blue-600 mt-4 transition-colors"
                >
                  Lanjut Belanja
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}