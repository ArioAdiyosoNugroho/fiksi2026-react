// src/pages/seller/SellerOrders.jsx
import { useState, useEffect } from 'react';
import api from '../../api/axios';
import CancellationModal from '../../components/CancellationModal';

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

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/seller/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    if (newStatus === 'cancelled') {
      setCancelOrderId(orderId);
      setShowCancelModal(true);
      return;
    }
    if (!confirm(`Ubah status pesanan menjadi "${newStatus}"?`)) return;
    try {
      await api.put(`/orders/${orderId}/status`, { order_status: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal update status');
    }
  };

  const handleCancelConfirm = async (reason) => {
    try {
      await api.put(`/orders/${cancelOrderId}/status`, { order_status: 'cancelled', cancellation_reason: reason });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membatalkan pesanan');
    } finally {
      setShowCancelModal(false);
      setCancelOrderId(null);
    }
  };

  const statusLabels = {
    pending: 'Menunggu Konfirmasi',
    confirmed: 'Dikonfirmasi',
    ready_for_pickup: 'Siap Diambil',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };

  const allowedNext = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['ready_for_pickup', 'cancelled'],
    ready_for_pickup: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pesanan Masuk</h1>
          <p className="text-gray-500 text-sm">Kelola pesanan dari pembeli</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <i className="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
          <p className="text-gray-500">Belum ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Informasi Pemesan */}
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      No. Pesanan: <span className="font-mono">{order.order_number}</span>
                    </p>
                    <p className="font-semibold text-gray-800 mt-1">{order.user?.name}</p>
                    <p className="text-sm text-gray-500">Telepon: {order.phone}</p>
                    <p className="text-sm text-gray-500">Alamat: {order.shipping_address}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Metode: {order.payment_method === 'transfer' ? 'Transfer Bank' : 'COD'}
                    </p>
                    {order.proof_of_payment && (
                      <a
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${order.proof_of_payment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
                      >
                        <i className="fas fa-image"></i> Lihat Bukti Transfer
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-tag text-xs text-gray-400"></i>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {statusLabels[order.order_status]}
                    </span>
                  </div>
                </div>

                {/* Daftar Item dengan Gambar */}
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  {order.items.map((item) => {
                    const imageUrl = getItemImageUrl(item.itemable);
                    return (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.itemable?.name}
                              className="w-12 h-12 object-cover rounded-lg bg-gray-50"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML =
                                  '<div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><i class="fas fa-box text-gray-400"></i></div>';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <i className="fas fa-box text-gray-400"></i>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">{item.itemable?.name}</p>
                            <p className="text-xs text-gray-400">x{item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-800">
                          Rp {Number(item.price * item.quantity).toLocaleString('id-ID')}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Tampilkan alasan pembatalan jika ada */}
                {order.order_status === 'cancelled' && order.cancellation_reason && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                    <i className="fas fa-info-circle mr-1"></i> Alasan pembatalan: {order.cancellation_reason}
                  </div>
                )}

                {/* Footer dengan Total dan Tombol Aksi */}
                <div className="border-t border-gray-100 mt-4 pt-4 flex flex-wrap justify-between items-center gap-3">
                  <div className="font-bold text-gray-900">
                    Total: <span className="text-blue-600">Rp {Number(order.total).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {allowedNext[order.order_status]?.includes('confirmed') && (
                      <button
                        onClick={() => updateStatus(order.id, 'confirmed')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      >
                        Konfirmasi Pesanan
                      </button>
                    )}
                    {allowedNext[order.order_status]?.includes('ready_for_pickup') && (
                      <button
                        onClick={() => updateStatus(order.id, 'ready_for_pickup')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      >
                        Siap Diambil
                      </button>
                    )}
                    {allowedNext[order.order_status]?.includes('completed') && (
                      <button
                        onClick={() => updateStatus(order.id, 'completed')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      >
                        Selesai
                      </button>
                    )}
                    {allowedNext[order.order_status]?.includes('cancelled') && (
                      <button
                        onClick={() => updateStatus(order.id, 'cancelled')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      >
                        Batalkan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CancellationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        title="Batalkan Pesanan"
        message="Berikan alasan pembatalan (stok habis, barang rusak, dll)"
      />
    </div>
  );
}