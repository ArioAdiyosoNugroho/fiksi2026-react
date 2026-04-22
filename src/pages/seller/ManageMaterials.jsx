// src/pages/seller/ManageMaterials.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from '../../components/ImageUploader';

function MaterialCard({ material, onDelete, onToggleStatus, onEdit }) {
  const conditionLabels = {
    good: { text: 'Baik', color: 'bg-green-100 text-green-700' },
    fair: { text: 'Sedang', color: 'bg-yellow-100 text-yellow-700' },
    poor: { text: 'Kurang', color: 'bg-red-100 text-red-700' },
  };
  const condition = conditionLabels[material.condition] || conditionLabels.good;

  // Get image URL from various possible formats
  const getImageUrl = () => {
    if (!material.images || material.images.length === 0) return null;
    
    const firstImage = material.images[0];
    if (typeof firstImage === 'string') return firstImage;
    if (firstImage.image_url) return firstImage.image_url;
    if (firstImage.url) return firstImage.url;
    return null;
  };

  const imageUrl = getImageUrl();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={material.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><i class="fas fa-recycle text-5xl text-gray-400"></i></div>';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <i className="fas fa-recycle text-5xl text-gray-400"></i>
          </div>
        )}
        <button
          onClick={() => onToggleStatus(material)}
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-all
            ${material.is_active 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-700 text-white'
            }`}
        >
          {material.is_active ? '✓ Aktif' : '✗ Nonaktif'}
        </button>
        <span className={`absolute bottom-3 left-3 px-2 py-1 rounded-lg text-xs font-medium ${condition.color}`}>
          {condition.text}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{material.name}</h3>
        <p className="text-green-600 font-bold text-xl mb-2">
          Rp {Number(material.price).toLocaleString('id-ID')}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            <i className="fas fa-weight-hanging mr-1"></i> {material.quantity} {material.unit}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(material)}
              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <i className="fas fa-edit mr-1"></i> Edit
            </button>
            <button
              onClick={() => onDelete(material.id)}
              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <i className="fas fa-trash mr-1"></i> Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManageMaterials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    unit: 'kg',
    condition: 'good',
    category_id: '',
    province: '',
    city: '',
    images: [],
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchMaterials();
    fetchCategories();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await api.get('/materials?seller_id=' + user.id);
      setMaterials(res.data.data || []);
    } catch (err) {
      console.error('Gagal memuat material:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?type=material');
      setCategories(res.data);
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    }
  };

// Di ManageMaterials.jsx, update handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  
  const formDataObj = new FormData();
  
  // Append text fields
  formDataObj.append('name', formData.name);
  formDataObj.append('description', formData.description);
  formDataObj.append('price', formData.price);
  formDataObj.append('quantity', formData.quantity);
  formDataObj.append('unit', formData.unit);
  formDataObj.append('condition', formData.condition);
  if (formData.category_id) formDataObj.append('category_id', formData.category_id);
  if (formData.province) formDataObj.append('province', formData.province);
  if (formData.city) formDataObj.append('city', formData.city);
  
  // ✅ Perbaiki: Append image files dengan nama yang benar
  // Pastikan hanya File object yang diappend
  const imageFiles = formData.images.filter(img => img instanceof File);
  imageFiles.forEach((image, index) => {
    formDataObj.append(`images[${index}]`, image);
  });
  
  // Debug: Log jumlah gambar yang akan diupload
  console.log('Uploading images:', imageFiles.length);
  
  try {
    if (editingMaterial) {
      formDataObj.append('_method', 'PUT');
      const response = await api.post(`/materials/${editingMaterial.id}`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Update response:', response.data);
    } else {
      const response = await api.post('/materials', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Create response:', response.data);
    }
    
    setShowModal(false);
    resetForm();
    fetchMaterials();
    alert(editingMaterial ? 'Material berhasil diupdate!' : 'Material berhasil ditambahkan!');
  } catch (err) {
    console.error('Gagal menyimpan material:', err);
    console.error('Error details:', err.response?.data);
    const message = err.response?.data?.message || 'Gagal menyimpan material';
    alert(message);
  } finally {
    setSubmitting(false);
  }
};

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus material ini?')) {
      try {
        await api.delete(`/materials/${id}`);
        fetchMaterials();
      } catch (err) {
        console.error('Gagal menghapus material:', err);
        alert('Gagal menghapus material');
      }
    }
  };

  const handleToggleStatus = async (material) => {
    try {
      await api.put(`/materials/${material.id}`, {
        ...material,
        is_active: !material.is_active,
      });
      fetchMaterials();
    } catch (err) {
      console.error('Gagal mengubah status:', err);
      alert('Gagal mengubah status material');
    }
  };

  const resetForm = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      quantity: '',
      unit: 'kg',
      condition: 'good',
      category_id: '',
      province: '',
      city: '',
      images: [],
    });
  };

  const openEditModal = (material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      description: material.description || '',
      price: material.price,
      quantity: material.quantity,
      unit: material.unit || 'kg',
      condition: material.condition || 'good',
      category_id: material.category_id || '',
      province: material.province || '',
      city: material.city || '',
      images: material.images || [],
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Kelola Material</h1>
          <p className="text-gray-500">Kelola semua material bekas yang Anda jual</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <i className="fas fa-plus"></i>
          Tambah Material
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onEdit={openEditModal}
          />
        ))}
        {materials.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <i className="fas fa-recycle text-5xl mb-3 text-gray-300"></i>
            <p>Belum ada material. Klik "Tambah Material" untuk mulai menjual.</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingMaterial ? 'Edit Material' : 'Tambah Material Baru'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Material <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Contoh: Besi Bekas, Kertas Kardus, dll"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Deskripsikan material Anda secara detail..."
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Jumlah material"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="kg, ton, m3, dll"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kondisi</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="good">👍 Baik</option>
                    <option value="fair">👌 Sedang</option>
                    <option value="poor">👎 Kurang</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provinsi</label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Contoh: Jawa Barat"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kota</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Contoh: Bandung"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Material</label>
                <ImageUploader
                  images={formData.images}
                  onImagesChange={(newImages) => setFormData({ ...formData, images: newImages })}
                  maxImages={5}
                />
              </div>
              
              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white py-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      {editingMaterial ? 'Update Material' : 'Simpan Material'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}