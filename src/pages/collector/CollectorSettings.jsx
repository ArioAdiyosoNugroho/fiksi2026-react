// src/pages/collector/CollectorSettings.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function CollectorSettings() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    shop_name: '',
    collection_address: '',
    google_maps_link: '',
    whatsapp: '',
    shop_photo: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        shop_name: user.shop_name || '',
        collection_address: user.collection_address || '',
        google_maps_link: user.google_maps_link || '',
        whatsapp: user.whatsapp || '',
        shop_photo: null,
      });
      if (user.shop_photo) {
        setPreview(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${user.shop_photo}`);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, shop_photo: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('shop_name', formData.shop_name);
    data.append('collection_address', formData.collection_address);
    if (formData.google_maps_link) data.append('google_maps_link', formData.google_maps_link);
    if (formData.whatsapp) data.append('whatsapp', formData.whatsapp);
    if (formData.shop_photo instanceof File) {
      data.append('shop_photo', formData.shop_photo);
    }
    data.append('_method', 'PUT');

    try {
      const res = await api.post('/collector/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(res.data);
      setMessage({ type: 'success', text: 'Profil pengepul berhasil diperbarui!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error:', err.response);
      const errorMsg = err.response?.data?.message ||
                       (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : 'Gagal update profil');
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'collector') {
    return (
      <div className="p-8 text-center text-red-500">
        Halaman ini hanya untuk pengepul. Role Anda saat ini: {user?.role || 'Belum login'}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
          <i className="fas fa-store text-white text-lg"></i>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Toko Pengepul</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola profil toko agar pembeli mudah menemukan Anda</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Foto Toko */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-image text-blue-500"></i> Foto Toko
            </h2>
            <div className="aspect-square w-full bg-gray-50 rounded-xl overflow-hidden mb-4 border border-gray-100">
              {preview ? (
                <img src={preview} alt="Preview toko" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <i className="fas fa-store text-5xl mb-2"></i>
                  <p className="text-xs text-center">Belum ada foto</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
            />
            <p className="text-xs text-gray-400 mt-2">Format JPG, PNG, maks 2MB</p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Toko</label>
              <input
                name="shop_name"
                value={formData.shop_name}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Pengepul Berkah Jaya"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Pengepulan</label>
              <textarea
                name="collection_address"
                rows="3"
                value={formData.collection_address}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan, Kota"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Link Google Maps</label>
              <input
                name="google_maps_link"
                value={formData.google_maps_link}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://maps.app.goo.gl/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor WhatsApp</label>
              <input
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="628123456789"
              />
              <p className="text-xs text-gray-400 mt-1">Gunakan format 628xxx (tanpa spasi/karakter)</p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}