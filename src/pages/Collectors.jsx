// src/pages/Collectors.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';

export default function Collectors() {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollectors();
  }, []);

  const fetchCollectors = async () => {
    try {
      const res = await api.get('/collectors');
      setCollectors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengepul Sampah Terdekat</h1>
        <p className="text-gray-500 mb-8">Jual sampah anorganik Anda ke pengepul terpercaya</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectors.map(collector => (
            <div key={collector.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {collector.shop_photo ? (
                <img 
                  src={`${import.meta.env.VITE_API_URL}/storage/${collector.shop_photo}`}
                  alt={collector.shop_name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <i className="fas fa-store text-5xl text-gray-300"></i>
                </div>
              )}
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{collector.shop_name || collector.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                  <i className="fas fa-user"></i> {collector.name}
                </p>
                <p className="text-sm text-gray-600 flex items-start gap-2 mb-3">
                  <i className="fas fa-map-marker-alt text-gray-400 mt-1"></i>
                  <span className="line-clamp-2">{collector.collection_address || collector.address || 'Alamat tidak tersedia'}</span>
                </p>
                {collector.whatsapp && (
                  <a
                    href={`https://wa.me/${collector.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    <i className="fab fa-whatsapp"></i> Hubungi via WhatsApp
                  </a>
                )}
                <Link to={`/collectors/${collector.id}`} className="mt-3 inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Lihat Detail <i className="fas fa-arrow-right text-xs"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {collectors.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <i className="fas fa-store-slash text-5xl mb-3 block"></i>
            <p>Belum ada pengepul terdaftar.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
      <Footer />
    </div>
  );
}