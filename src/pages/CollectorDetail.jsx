// src/pages/CollectorDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';

export default function CollectorDetail() {
  const { id } = useParams();
  const [collector, setCollector] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollector();
  }, [id]);

  const fetchCollector = async () => {
    try {
      const res = await api.get(`/collectors/${id}`);
      setCollector(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!collector) return <NotFound />;

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info Toko */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border p-6 sticky top-8">
              {collector.shop_photo ? (
                <img 
                  src={`${import.meta.env.VITE_API_URL}/storage/${collector.shop_photo}`}
                  alt={collector.shop_name}
                  className="w-full h-56 object-cover rounded-xl mb-4"
                />
              ) : (
                <div className="w-full h-56 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <i className="fas fa-store text-6xl text-gray-300"></i>
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-800">{collector.shop_name || collector.name}</h2>
              <p className="text-gray-500 text-sm mb-4">Pengepul</p>
              <div className="space-y-3 text-sm">
                {collector.collection_address && (
                  <p className="flex items-start gap-2"><i className="fas fa-map-marker-alt text-gray-400 mt-1"></i> {collector.collection_address}</p>
                )}
                {collector.google_maps_link && (
                  <a href={collector.google_maps_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600">
                    <i className="fas fa-map"></i> Lihat di Google Maps
                  </a>
                )}
                {collector.whatsapp && (
                  <a href={`https://wa.me/${collector.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-600">
                    <i className="fab fa-whatsapp"></i> Chat WhatsApp
                  </a>
                )}
                {collector.phone && (
                  <p className="flex items-center gap-2"><i className="fas fa-phone text-gray-400"></i> {collector.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Material yang dijual */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Material yang Dijual</h2>
            {collector.materials && collector.materials.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {collector.materials.map(mat => (
                  <Link to={`/materials/${mat.id}`} key={mat.id} className="bg-white border rounded-xl p-3 hover:shadow-md transition">
                    {mat.images?.[0]?.image_url ? (
                      <img src={mat.images[0].image_url} alt={mat.name} className="w-full h-32 object-cover rounded-lg mb-2" />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center"><i className="fas fa-recycle text-3xl text-gray-400"></i></div>
                    )}
                    <p className="font-medium text-gray-800 line-clamp-1">{mat.name}</p>
                    <p className="text-blue-600 font-bold">Rp {Number(mat.price).toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Pengepul ini belum menjual material.</p>
            )}
          </div>
        </div>
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

function NotFound() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="text-center py-24">
        <i className="fas fa-store-slash text-6xl text-gray-300 mb-4"></i>
        <p className="text-gray-500">Pengepul tidak ditemukan</p>
        <Link to="/collectors" className="inline-block mt-4 text-blue-600">Kembali ke daftar pengepul</Link>
      </div>
      <Footer />
    </div>
  );
}