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
    data.append('google_maps_link', formData.google_maps_link);
    data.append('whatsapp', formData.whatsapp);
    if (formData.shop_photo instanceof File) {
      data.append('shop_photo', formData.shop_photo);
    }
    try {
      const res = await api.put('/collector/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(res.data);
      setMessage({ type: 'success', text: 'Profil pengepul berhasil diperbarui!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal update profil' });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Perbaikan utama: cek properti role langsung, bukan method isCollector()
  if (!user || user.role !== 'collector') {
    return (
      <div className="p-8 text-center text-red-500">
        Halaman ini hanya untuk pengepul. Role Anda saat ini: {user?.role || 'Belum login'}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pengaturan Toko Pengepul</h1>
      {message.text && (
        <div className={`p-3 rounded-xl mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Toko</label>
          <input
            name="shop_name"
            value={formData.shop_name}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            placeholder="Contoh: Pengepul Berkah Jaya"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Alamat Pengepulan</label>
          <textarea
            name="collection_address"
            rows="3"
            value={formData.collection_address}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan, Kota"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Link Google Maps</label>
          <input
            name="google_maps_link"
            value={formData.google_maps_link}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            placeholder="https://maps.app.goo.gl/..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nomor WhatsApp</label>
          <input
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            placeholder="628123456789"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Foto Toko</label>
          {preview && (
            <div className="mb-2">
              <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
          <p className="text-xs text-gray-400 mt-1">Format JPG, PNG, maks 2MB</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}