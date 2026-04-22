// src/pages/seller/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <i className={`${icon} text-white text-xl`}></i>
        </div>
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <h3 className="text-gray-600 font-medium">{title}</h3>
    </div>
  );
}

export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    materials: 0,
    orders: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch products
      const productsRes = await api.get('/products?seller_id=' + user.id);
      const products = productsRes.data.data || [];
      
      // Fetch materials
      const materialsRes = await api.get('/materials?seller_id=' + user.id);
      const materials = materialsRes.data.data || [];
      
      // Fetch orders - dengan error handling karena endpoint mungkin belum ada
      let orders = [];
      try {
        const ordersRes = await api.get('/orders?seller_id=' + user.id);
        orders = ordersRes.data.data || [];
      } catch (orderErr) {
        // Jika endpoint orders belum ada, lanjutkan tanpa error
        console.warn('Endpoint orders belum tersedia:', orderErr.message);
      }

      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const recent = orders.slice(0, 5);

      setStats({
        products: products.length,
        materials: materials.length,
        orders: orders.length,
        revenue: totalRevenue,
      });
      setRecentOrders(recent);
    } catch (err) {
      console.error('Gagal memuat data dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-500">Selamat datang kembali, {user?.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Produk"
          value={stats.products}
          icon="fas fa-box"
          color="bg-blue-500"
        />
        <StatCard
          title="Total Material"
          value={stats.materials}
          icon="fas fa-recycle"
          color="bg-green-500"
        />
        <StatCard
          title="Total Pesanan"
          value={stats.orders}
          icon="fas fa-shopping-cart"
          color="bg-orange-500"
        />
        <StatCard
          title="Total Pendapatan"
          value={`Rp ${stats.revenue.toLocaleString('id-ID')}`}
          icon="fas fa-money-bill-wave"
          color="bg-purple-500"
        />
      </div>

      {/* Recent Orders - Sembunyikan jika belum ada data */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Pesanan Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Pesanan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">#{order.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      Rp {Number(order.total || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full
                        ${order.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${order.status === 'processing' ? 'bg-blue-100 text-blue-700' : ''}
                      `}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/seller/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pesan jika belum ada aktivitas */}
      {stats.products === 0 && stats.materials === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <i className="fas fa-store text-5xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Selamat Datang di Dashboard Penjual!</h3>
          <p className="text-gray-500 mb-4">
            Mulai jualan Anda dengan menambahkan produk atau material bekas.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/seller/products"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              <i className="fas fa-plus mr-2"></i>Tambah Produk
            </Link>
            <Link
              to="/seller/materials"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              <i className="fas fa-plus mr-2"></i>Tambah Material
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}