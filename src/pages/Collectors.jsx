// src/pages/Collectors.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 flex flex-col animate-pulse">
      <div className="h-48 bg-gray-100 rounded-[1rem] mb-4"></div>
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-100 rounded-full w-32"></div>
    </div>
  );
}

function CollectorCard({ collector }) {
  const imageUrl = collector.shop_photo 
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${collector.shop_photo}`
    : null;

  return (
    <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow group">
      <Link to={`/collectors/${collector.id}`} className="block">
        <div className="relative bg-gradient-to-tr from-green-50 to-teal-100 rounded-[1rem] h-48 mb-4 overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={collector.shop_name || collector.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl opacity-40">
              <i className="fas fa-store"></i>
            </div>
          )}
        </div>
        <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">
          {collector.shop_name || collector.name}
        </h3>
        <p className="text-gray-500 text-sm flex items-center gap-1 mb-2">
          <i className="fas fa-user"></i> {collector.name}
        </p>
        <p className="text-gray-600 text-sm flex items-start gap-2 mb-3 line-clamp-2">
          <i className="fas fa-map-marker-alt text-gray-400 mt-0.5"></i>
          <span>{collector.collection_address || collector.address || 'Alamat tidak tersedia'}</span>
        </p>
      </Link>
      {collector.whatsapp && (
        <a
          href={`https://wa.me/${collector.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          <i className="fab fa-whatsapp"></i> Hubungi via WhatsApp
        </a>
      )}
    </div>
  );
}

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

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill().map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengepul Sampah Terdekat</h1>
        <p className="text-gray-500 mb-8">Jual sampah anorganik Anda ke pengepul terpercaya</p>

        {collectors.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <i className="fas fa-store-slash text-5xl mb-3 block"></i>
            <p>Belum ada pengepul terdaftar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {collectors.map(collector => (
              <CollectorCard key={collector.id} collector={collector} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}