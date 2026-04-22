// src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [itemsBySeller, setItemsBySeller] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('midtrans');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user && (!user.address || !user.phone)) {
      alert('Silakan lengkapi alamat dan nomor telepon di halaman profil terlebih dahulu.');
      navigate('/profile');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data);
      const grouped = {};
      res.data.items.forEach(item => {
        const seller = item.itemable?.seller;
        if (!seller) return;
        const sellerId = seller.id;
        if (!grouped[sellerId]) {
          grouped[sellerId] = { seller, items: [], total: 0 };
        }
        grouped[sellerId].items.push(item);
        grouped[sellerId].total += item.price * item.quantity;
      });
      setItemsBySeller(Object.values(grouped));
    } catch (err) {
      console.error(err);
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

    const handleSubmit = async () => {
    setSubmitting(true);
    try {
        const res = await api.post('/orders', {
        payment_method: paymentMethod,
        notes,
        });

        if (paymentMethod === 'midtrans' && res.data.payment_session?.snap_token) {
        const sessionId = res.data.payment_session.id;

        window.snap.pay(res.data.payment_session.snap_token, {
            onSuccess: () => {
            navigate('/orders');
            },
            onPending: () => {
            navigate('/orders');
            },
            onError: () => {
            // Batalkan order di backend, tetap di halaman checkout
            api.delete(`/payment-sessions/${sessionId}`).catch(() => {});
            alert('❌ Pembayaran gagal. Silakan coba lagi.');
            // Tidak navigate — user bisa coba lagi
            },
            onClose: () => {
            // ✅ User klik ✕ — batalkan order, tetap di halaman checkout
            api.delete(`/payment-sessions/${sessionId}`).catch(() => {});
            // Tidak navigate, tidak alert — user tetap di sini
            },
        });
        } else {
        navigate('/orders');
        }
    } catch (err) {
        alert(err.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
        setSubmitting(false);
    }
    };

  const totalAll = itemsBySeller.reduce((sum, g) => sum + g.total, 0);

  if (loading) return <LoadingScreen />;
  if (!cart || cart.items?.length === 0) return <EmptyCart />;

  const paymentOptions = [
    {
      value: 'midtrans',
      title: 'Bayar Online',
      subtitle: 'QRIS · GoPay · OVO · Virtual Account · Kartu Kredit',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
          <rect x="2" y="5" width="20" height="14" rx="3" />
          <path d="M2 10h20" />
          <path d="M6 15h4" strokeLinecap="round" />
        </svg>
      ),
      badge: 'Rekomendasi',
      badgeColor: 'bg-blue-600 text-white',
      accent: 'border-blue-500 bg-blue-50',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      value: 'transfer',
      title: 'Transfer Bank Manual',
      subtitle: 'Transfer ke rekening penjual, lalu upload bukti',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
      ),
      badge: null,
      accent: 'border-slate-300 bg-white',
      iconBg: 'bg-slate-100 text-slate-500',
    },
    {
      value: 'cod',
      title: 'Bayar di Tempat (COD)',
      subtitle: 'Bayar langsung saat mengambil pesanan',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      ),
      badge: null,
      accent: 'border-slate-300 bg-white',
      iconBg: 'bg-slate-100 text-slate-500',
    },
  ];

  return (
    <div className="min-h-screen text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#f8f8f6' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {['Keranjang', 'Checkout', 'Selesai'].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 text-sm font-semibold ${i === 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${i === 0 ? 'bg-slate-200 text-slate-400' : i === 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {i === 0 ? <i className="fas fa-check text-xs" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{step}</span>
              </div>
              {i < 2 && <div className={`w-10 h-px ${i === 0 ? 'bg-slate-300' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* LEFT — Main Form */}
          <div className="lg:col-span-3 space-y-5">

            {/* Shipping Info */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">1</span>
                  Informasi Pengiriman
                </h2>
                <Link to="/profile" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
                  <i className="fas fa-pen text-xs"></i> Edit
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wide">Alamat</p>
                  <p className="text-sm font-medium text-slate-800 leading-snug">{user?.address || <span className="text-red-400">Belum diisi</span>}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wide">Telepon</p>
                  <p className="text-sm font-medium text-slate-800">{user?.phone || <span className="text-red-400">Belum diisi</span>}</p>
                </div>
              </div>
            </div>

            {/* Items per Seller */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2 mb-5">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">2</span>
                Detail Pesanan
              </h2>
              <div className="space-y-5">
                {itemsBySeller.map(group => (
                  <div key={group.seller.id} className="border border-slate-100 rounded-2xl overflow-hidden">
                    {/* Seller Header */}
                    <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                          <i className="fas fa-store text-slate-500 text-xs"></i>
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{group.seller.name}</span>
                      </div>
                      {group.seller.whatsapp && (
                        <a href={`https://wa.me/${group.seller.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-green-600 flex items-center gap-1 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                          <i className="fab fa-whatsapp"></i> Chat
                        </a>
                      )}
                    </div>
                    {/* Items */}
                    <div className="p-4 space-y-3">
                      {group.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-slate-700">{item.itemable?.name} <span className="text-slate-400">×{item.quantity}</span></span>
                          <span className="font-semibold text-slate-900">Rp {Number(item.price * item.quantity).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                      <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-semibold">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="text-slate-900">Rp {Number(group.total).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                    {/* Bank accounts for transfer */}
                    {paymentMethod === 'transfer' && group.seller.bank_accounts?.length > 0 && (
                      <div className="mx-4 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm">
                        <p className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">Rekening Transfer</p>
                        {group.seller.bank_accounts.map((bank, idx) => (
                          <div key={idx} className="text-slate-700">
                            <span className="font-mono font-semibold">{bank.bank_name} — {bank.account_number}</span>
                            <span className="text-slate-400 text-xs ml-2">a.n. {bank.account_name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2 mb-5">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">3</span>
                Metode Pembayaran
              </h2>
              <div className="space-y-3">
                {paymentOptions.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150
                      ${paymentMethod === opt.value ? opt.accent + ' shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="sr-only"
                    />
                    {/* Custom Radio */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${paymentMethod === opt.value ? 'border-blue-600' : 'border-slate-300'}`}>
                      {paymentMethod === opt.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${opt.iconBg}`}>
                      {opt.icon}
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">{opt.title}</span>
                        {opt.badge && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${opt.badgeColor}`}>
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{opt.subtitle}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Info banner */}
              {paymentMethod === 'midtrans' && (
                <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
                  <i className="fas fa-shield-alt mt-0.5 flex-shrink-0"></i>
                  <span>Pembayaran diproses aman oleh <strong>Midtrans</strong>. Setelah klik "Buat Pesanan", popup pembayaran akan muncul.</span>
                </div>
              )}
              {paymentMethod === 'transfer' && (
                <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700">
                  <i className="fas fa-info-circle mt-0.5 flex-shrink-0"></i>
                  <span>Setelah pesanan dibuat, unggah bukti transfer di halaman <strong>Pesanan Saya</strong>.</span>
                </div>
              )}
              {paymentMethod === 'cod' && (
                <div className="mt-4 flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-600">
                  <i className="fas fa-map-marker-alt mt-0.5 flex-shrink-0"></i>
                  <span>Siapkan uang pas saat mengambil pesanan langsung ke toko penjual.</span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">4</span>
                Catatan (opsional)
              </h2>
              <textarea
                rows="3"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-300"
                placeholder="Instruksi khusus untuk penjual..."
              />
            </div>
          </div>

          {/* RIGHT — Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h2 className="font-bold text-lg text-slate-900 mb-5">Ringkasan Pesanan</h2>
                <div className="max-h-56 overflow-auto space-y-2 mb-5 pr-1">
                  {itemsBySeller.map(group => (
                    <div key={group.seller.id} className="mb-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{group.seller.name}</p>
                      {group.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm text-slate-600 mb-1">
                          <span className="truncate mr-2">{item.itemable?.name} <span className="text-slate-400">×{item.quantity}</span></span>
                          <span className="flex-shrink-0 font-medium">Rp {Number(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Ongkos Kirim</span>
                    <span className="text-emerald-600 font-semibold">Gratis</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-slate-900 pt-1">
                    <span>Total</span>
                    <span className="text-blue-600 text-xl">Rp {Number(totalAll).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'midtrans' ? (
                      <><i className="fas fa-lock text-xs"></i> Bayar Sekarang</>
                    ) : (
                      <><i className="fas fa-check text-xs"></i> Buat Pesanan</>
                    )}
                    <i className="fas fa-arrow-right text-xs opacity-60"></i>
                  </>
                )}
              </button>

              <Link to="/cart" className="block text-center text-sm text-slate-400 hover:text-slate-600 transition-colors py-1">
                ← Kembali ke Keranjang
              </Link>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <span className="text-xs text-slate-300 flex items-center gap-1"><i className="fas fa-lock text-slate-300"></i> SSL Aman</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-300 flex items-center gap-1"><i className="fas fa-shield-alt text-slate-300"></i> Terproteksi</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f6' }}>
      <Navbar />
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <Footer />
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f6' }}>
      <Navbar />
      <div className="text-center py-24 max-w-sm mx-auto px-4">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-slate-100">
          <span className="text-4xl">🛒</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Keranjang kosong</h2>
        <p className="text-slate-400 text-sm mb-6">Tambahkan produk dulu sebelum checkout</p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-slate-800 transition-colors">
          Belanja Sekarang
        </Link>
      </div>
      <Footer />
    </div>
  );
}