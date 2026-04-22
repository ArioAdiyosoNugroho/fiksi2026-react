// src/pages/Profile.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bio: '',
    google_maps_link: '',
    whatsapp: '',
    bank_accounts: [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        google_maps_link: user.google_maps_link || '',
        whatsapp: user.whatsapp || '',
        bank_accounts: user.bank_accounts || [],
      });
      if (user.avatar) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        setAvatarPreview(`${baseUrl}/storage/${user.avatar}`);
      } else {
        setAvatarPreview(null);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBankChange = (index, field, value) => {
    const newAccounts = [...formData.bank_accounts];
    newAccounts[index][field] = value;
    setFormData({ ...formData, bank_accounts: newAccounts });
  };

  const addBankAccount = () => {
    setFormData({
      ...formData,
      bank_accounts: [...formData.bank_accounts, { bank_name: '', account_number: '', account_name: '' }]
    });
  };

  const removeBankAccount = (index) => {
    const newAccounts = formData.bank_accounts.filter((_, i) => i !== index);
    setFormData({ ...formData, bank_accounts: newAccounts });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Format file harus JPG, JPEG, atau PNG' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran file maksimal 2MB' });
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setMessage({ type: '', text: '' });
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const res = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(res.data.user);
      setMessage({ type: 'success', text: 'Foto profil berhasil diubah' });
      setAvatarFile(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      let errorMsg = 'Gagal upload foto';
      if (err.response?.data?.message) errorMsg = err.response.data.message;
      else if (err.message) errorMsg = err.message;
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async () => {
    if (!confirm('Hapus foto profil?')) return;
    try {
      const res = await api.delete('/profile/avatar');
      updateUser(res.data.user);
      setAvatarPreview(null);
      setAvatarFile(null);
      setMessage({ type: 'success', text: 'Foto profil dihapus' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal hapus foto' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi wajib untuk alamat dan nomor telepon
    if (!formData.address) {
      setMessage({ type: 'error', text: 'Alamat lengkap wajib diisi' });
      return;
    }
    if (!formData.phone) {
      setMessage({ type: 'error', text: 'Nomor telepon wajib diisi' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.put('/profile', formData);
      updateUser(res.data.user);
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal update profil' });
    } finally {
      setLoading(false);
    }
  };

  const isSeller = user?.role === 'seller';

  return (
    <div className="bg-white text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <Navbar />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profil Saya</h1>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Avatar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden mb-4">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/jpg" onChange={handleAvatarChange} className="hidden" />
                <div className="flex gap-2 flex-wrap justify-center">
                  <button onClick={() => fileInputRef.current.click()} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm">
                    Pilih Foto
                  </button>
                  {avatarFile && (
                    <button onClick={uploadAvatar} disabled={uploading} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm">
                      {uploading ? 'Mengunggah...' : 'Upload'}
                    </button>
                  )}
                  {avatarPreview && !avatarFile && (
                    <button onClick={deleteAvatar} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm">
                      Hapus
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-3">Format JPG, PNG, maks 2MB</p>
              </div>
            </div>
          </div>

          {/* Form Profil */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon <span className="text-red-500">*</span>
                </label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea name="address" rows="3" value={formData.address} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Deskripsi Singkat</label>
                <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3" />
              </div>

              {isSeller && (
                <>
                  <div className="border-t pt-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Toko</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link Google Maps</label>
                        <input type="url" name="google_maps_link" value={formData.google_maps_link} onChange={handleChange} placeholder="https://maps.app.goo.gl/..." className="w-full border border-gray-200 rounded-xl p-3" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp (contoh: 628123456789)</label>
                        <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Rekening Bank</h2>
                    {formData.bank_accounts.length === 0 && <p className="text-gray-400 text-sm mb-3">Belum ada rekening. Klik tombol di bawah untuk menambahkan.</p>}
                    {formData.bank_accounts.map((acc, idx) => (
                      <div key={idx} className="relative border border-gray-100 rounded-xl p-4 bg-gray-50 mb-3">
                        <button type="button" onClick={() => removeBankAccount(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input type="text" placeholder="Nama Bank (BCA, Mandiri, dll)" value={acc.bank_name} onChange={(e) => handleBankChange(idx, 'bank_name', e.target.value)} className="border border-gray-200 rounded-lg p-2" />
                          <input type="text" placeholder="Nomor Rekening" value={acc.account_number} onChange={(e) => handleBankChange(idx, 'account_number', e.target.value)} className="border border-gray-200 rounded-lg p-2" />
                          <input type="text" placeholder="Atas Nama" value={acc.account_name} onChange={(e) => handleBankChange(idx, 'account_name', e.target.value)} className="border border-gray-200 rounded-lg p-2" />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addBankAccount} className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                      <i className="fas fa-plus-circle"></i> Tambah Rekening
                    </button>
                  </div>
                </>
              )}

              <button type="submit" disabled={loading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}