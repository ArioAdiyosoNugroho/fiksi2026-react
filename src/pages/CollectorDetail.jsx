// src/pages/CollectorDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';

function SkeletonDetail() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-gray-100 rounded-2xl h-96"></div>
        </div>
        <div className="lg:col-span-2">
          <div className="h-8 bg-gray-100 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-100 rounded-xl"></div>
            <div className="h-32 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MaterialCard({ material }) {
  const imageUrl = material.images?.[0]?.image_url || null;
  return (
    <Link to={`/materials/${material.id}`} className="bg-white border rounded-xl p-3 hover:shadow-md transition group">
      {imageUrl ? (
        <img src={imageUrl} alt={material.name} className="w-full h-32 object-cover rounded-lg mb-2 group-hover:scale-105 transition-transform" />
      ) : (
        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
          <i className="fas fa-recycle text-3xl text-gray-400"></i>
        </div>
      )}
      <p className="font-medium text-gray-800 line-clamp-1">{material.name}</p>
      <p className="text-blue-600 font-bold">Rp {Number(material.price).toLocaleString('id-ID')}</p>
    </Link>
  );
}

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

  if (loading) return <SkeletonDetail />;
  if (!collector) return <NotFound />;

  const imageUrl = collector.shop_photo
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${collector.shop_photo}`
    : null;

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
          <Link to="/collectors" className="hover:text-blue-600">Pengepul</Link>
          <i className="fas fa-chevron-right text-xs"></i>
          <span className="text-gray-700 truncate">{collector.shop_name || collector.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Toko */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-8 shadow-sm">
              <div className="aspect-square w-full bg-gradient-to-tr from-green-50 to-teal-100 rounded-xl mb-4 overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt={collector.shop_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
                    <i className="fas fa-store"></i>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{collector.shop_name || collector.name}</h2>
              <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">
                <i className="fas fa-user"></i> {collector.name}
              </p>
              <div className="space-y-3 text-sm border-t pt-4">
                {collector.collection_address && (
                  <p className="flex items-start gap-2">
                    <i className="fas fa-map-marker-alt text-gray-400 mt-0.5"></i>
                    <span>{collector.collection_address}</span>
                  </p>
                )}
                {collector.google_maps_link && (
                  <a href={collector.google_maps_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                    <i className="fas fa-map"></i> Lihat di Google Maps
                  </a>
                )}
                {collector.phone && (
                  <p className="flex items-center gap-2">
                    <i className="fas fa-phone text-gray-400"></i> {collector.phone}
                  </p>
                )}
              </div>
              {collector.whatsapp && (
                <a
                  href={`https://wa.me/${collector.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  <i className="fab fa-whatsapp"></i> Hubungi via WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Daftar Material yang Dijual */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-recycle text-green-600"></i> Material yang Dijual
            </h2>
            {collector.materials && collector.materials.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {collector.materials.map(mat => (
                  <MaterialCard key={mat.id} material={mat} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl">
                <i className="fas fa-box-open text-4xl mb-2 block"></i>
                <p>Pengepul ini belum menjual material.</p>
              </div>
            )}
          </div>
        </div>
      </div>
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
        <Link to="/collectors" className="inline-block mt-4 text-blue-600 hover:text-blue-700">Kembali ke daftar pengepul</Link>
      </div>
      <Footer />
    </div>
  );
}