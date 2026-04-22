// src/pages/Orders.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';
import UploadProofModal from '../components/UploadProofModal';
import CancellationModal from '../components/CancellationModal';

function getItemImageUrl(itemable) {
  if (!itemable) return null;
  if (itemable.images && Array.isArray(itemable.images) && itemable.images.length > 0) {
    const first = itemable.images[0];
    if (typeof first === 'string') return first;
    if (first?.image_url) return first.image_url;
    if (first?.url) return first.url;
  }
  if (itemable.image_url) return itemable.image_url;
  if (itemable.url) return itemable.url;
  return null;
}

const statusConfig = {
  pending: {
    label: 'Menunggu Konfirmasi',
    dot: 'bg-amber-400',
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  confirmed: {
    label: 'Dikonfirmasi',
    dot: 'bg-blue-500',
    pill: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  ready_for_pickup: {
    label: 'Siap Diambil',
    dot: 'bg-violet-500',
    pill: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  completed: {
    label: 'Selesai',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  cancelled: {
    label: 'Dibatalkan',
    dot: 'bg-red-400',
    pill: 'bg-red-50 text-red-600 border-red-200',
  },
};

const paymentConfig = {
  transfer: { label: 'Transfer Bank', icon: 'fa-university', color: 'text-blue-600', bg: 'bg-blue-50' },
  cod: { label: 'Bayar di Tempat', icon: 'fa-money-bill-wave', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  midtrans: { label: 'Bayar Online', icon: 'fa-credit-card', color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

export default function Orders() {
  // ✅ Semua useState di paling atas
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [payingOrderId, setPayingOrderId] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmReceived = async (orderId) => {
    if (!confirm('Konfirmasi pesanan sudah diterima? Tindakan ini tidak bisa dibatalkan.')) return;
    try {
      await api.post(`/orders/${orderId}/confirm`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal konfirmasi pesanan');
    }
  };

  const handleCancelClick = (orderId) => {
    setCancelOrderId(orderId);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async (reason) => {
    try {
      await api.post(`/orders/${cancelOrderId}/cancel`, { cancellation_reason: reason });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membatalkan pesanan');
    } finally {
      setShowCancelModal(false);
      setCancelOrderId(null);
    }
  };

  const handlePayWithMidtrans = async (order) => {
    setPayingOrderId(order.id);
    try {
      const res = await api.get(`/payment-sessions/${order.payment_session_id}/snap-token`);
      window.snap.pay(res.data.snap_token, {
        onSuccess: () => { fetchOrders(); },
        onPending: () => { fetchOrders(); },
        onError: () => { alert('❌ Pembayaran gagal. Silakan coba lagi.'); },
        onClose: () => { /* user tutup popup — tidak ada aksi */ },
      });
    } catch (err) {
      alert('Gagal memuat pembayaran. Silakan coba lagi.');
    } finally {
      setPayingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8f8f6' }}>
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-[3px] border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#f8f8f6' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pesanan Saya</h1>
            <p className="text-sm text-slate-400 mt-0.5">{orders.length} pesanan</p>
          </div>
          <Link to="/products" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            <i className="fas fa-plus text-xs"></i> Belanja Lagi
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-box-open text-2xl text-slate-400"></i>
            </div>
            <p className="font-semibold text-slate-700">Belum ada pesanan</p>
            <p className="text-slate-400 text-sm mt-1 mb-6">Yuk mulai belanja produk favoritmu</p>
            <Link to="/products"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold hover:bg-slate-800 transition-colors">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.order_status] || statusConfig.pending;
              const payment = paymentConfig[order.payment_method] || paymentConfig.transfer;

              return (
                <div key={order.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">

                  {/* Card Header */}
                  <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-store text-slate-500 text-xs"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{order.seller?.name}</p>
                        <p className="text-xs text-slate-400 font-mono tracking-tight">{order.order_number}</p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${status.pill}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                      {status.label}
                    </div>
                  </div>

                  <div className="p-6 space-y-5">

                    {/* Items */}
                    <div className="space-y-3">
                      {order.items.map((item) => {
                        const imageUrl = getItemImageUrl(item.itemable);
                        return (
                          <div key={item.id} className="flex items-center gap-3">
                            {imageUrl ? (
                              <img src={imageUrl} alt={item.itemable?.name}
                                className="w-12 h-12 object-cover rounded-2xl bg-slate-50 flex-shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div class="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0"><i class="fas fa-box text-slate-400 text-sm"></i></div>';
                                }} />
                            ) : (
                              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <i className="fas fa-box text-slate-400 text-sm"></i>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-slate-900 truncate">{item.itemable?.name}</p>
                              <p className="text-xs text-slate-400">{item.quantity} item</p>
                            </div>
                            <p className="font-semibold text-sm text-slate-900 flex-shrink-0">
                              Rp {Number(item.price * item.quantity).toLocaleString('id-ID')}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Payment + Shipping */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-2xl p-3.5">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-2">Pembayaran</p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${payment.bg}`}>
                            <i className={`fas ${payment.icon} text-xs ${payment.color}`}></i>
                          </div>
                          <span className="text-sm font-medium text-slate-800">{payment.label}</span>
                        </div>
                        {order.payment_status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <i className="fas fa-check text-xs"></i> Lunas
                          </span>
                        ) : order.payment_method === 'midtrans' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            <i className="fas fa-clock text-xs"></i> Belum Dibayar
                          </span>
                        ) : null}
                        {order.proof_of_payment && (
                          <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${order.proof_of_payment}`}
                            target="_blank" rel="noopener noreferrer"
                            className="mt-2 block text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                            <i className="fas fa-receipt text-xs"></i> Lihat Bukti
                          </a>
                        )}
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3.5">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-2">Pengiriman</p>
                        <p className="text-sm text-slate-700 leading-snug flex items-start gap-1.5">
                          <i className="fas fa-map-marker-alt text-slate-400 text-xs mt-0.5 flex-shrink-0"></i>
                          <span className="line-clamp-2">{order.shipping_address}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                          <i className="fas fa-phone text-slate-400 text-xs"></i>
                          {order.phone}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-2xl p-3.5 text-sm text-amber-800">
                        <i className="fas fa-sticky-note text-amber-400 mt-0.5 flex-shrink-0 text-xs"></i>
                        <span>{order.notes}</span>
                      </div>
                    )}

                    {/* Cancellation reason */}
                    {order.order_status === 'cancelled' && order.cancellation_reason && (
                      <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-2xl p-3.5 text-sm text-red-700">
                        <i className="fas fa-info-circle text-red-400 mt-0.5 flex-shrink-0 text-xs"></i>
                        <span>Alasan: {order.cancellation_reason}</span>
                      </div>
                    )}

                    {/* Seller contact */}
                    {order.seller && (order.seller.whatsapp || order.seller.google_maps_link) && (
                      <div className="flex flex-wrap gap-2">
                        {order.seller.whatsapp && (
                          <a href={`https://wa.me/${order.seller.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors">
                            <i className="fab fa-whatsapp"></i> Chat Penjual
                          </a>
                        )}
                        {order.seller.google_maps_link && (
                          <a href={order.seller.google_maps_link} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                            <i className="fas fa-map-marker-alt"></i> Lokasi Toko
                          </a>
                        )}
                      </div>
                    )}

                    {/* Footer — Total & Actions */}
                    <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Total Pembayaran</p>
                        <p className="text-xl font-bold text-blue-600">Rp {Number(order.total).toLocaleString('id-ID')}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {/* Upload bukti transfer */}
                        {order.order_status === 'pending' &&
                          order.payment_method === 'transfer' &&
                          order.payment_status !== 'paid' && (
                          <button onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-2xl text-sm font-semibold transition-colors">
                            <i className="fas fa-upload text-xs"></i> Upload Bukti
                          </button>
                        )}

                        {/* Bayar Midtrans */}
                        {order.payment_method === 'midtrans' &&
                          order.payment_status !== 'paid' &&
                          order.order_status === 'pending' && (
                          <button onClick={() => handlePayWithMidtrans(order)}
                            disabled={payingOrderId === order.id}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-2 rounded-2xl text-sm font-semibold transition-colors">
                            {payingOrderId === order.id ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Memuat...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-credit-card text-xs"></i>
                                Bayar Sekarang
                              </>
                            )}
                          </button>
                        )}

                        {/* Konfirmasi diterima */}
                        {order.order_status === 'ready_for_pickup' && (
                          <button onClick={() => confirmReceived(order.id)}
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-2xl text-sm font-semibold transition-colors">
                            <i className="fas fa-check-circle text-xs"></i> Pesanan Diterima
                          </button>
                        )}

                        {/* Batalkan */}
                        {(order.order_status === 'pending' || order.order_status === 'confirmed') && (
                          <button onClick={() => handleCancelClick(order.id)}
                            className="inline-flex items-center gap-2 border border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-2xl text-sm font-semibold transition-all">
                            <i className="fas fa-times text-xs"></i> Batalkan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />

      {showModal && selectedOrder && (
        <UploadProofModal order={selectedOrder} onClose={() => setShowModal(false)} onSuccess={fetchOrders} />
      )}
      <CancellationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        title="Batalkan Pesanan"
        message="Silakan berikan alasan pembatalan pesanan Anda."
      />
    </div>
  );
}