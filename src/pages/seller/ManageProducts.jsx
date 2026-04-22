// src/pages/seller/ManageProducts.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from '../../components/ImageUploader';

function ProductCard({ product, onDelete, onToggleStatus, onEdit }) {
  // Get image URL from various possible formats
  const getImageUrl = () => {
    if (!product.images || product.images.length === 0) return null;
    
    const firstImage = product.images[0];
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
            alt={product.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><i class="fas fa-box text-5xl text-gray-400"></i></div>';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <i className="fas fa-box text-5xl text-gray-400"></i>
          </div>
        )}
        <button
          onClick={() => onToggleStatus(product)}
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-all
            ${product.is_active 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-700 text-white'
            }`}
        >
          {product.is_active ? '✓ Aktif' : '✗ Nonaktif'}
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-blue-600 font-bold text-xl mb-3">
          Rp {Number(product.price).toLocaleString('id-ID')}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            <i className="fas fa-boxes mr-1"></i> Stok: {product.stock}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <i className="fas fa-edit mr-1"></i> Edit
            </button>
            <button
              onClick={() => onDelete(product.id)}
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

export default function ManageProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    unit: 'pcs',
    condition: 'new',
    category_id: '',
    images: [],
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?seller_id=' + user.id);
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Gagal memuat produk:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?type=product');
      setCategories(res.data);
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formDataObj = new FormData();
    
    // Append text fields
    formDataObj.append('name', formData.name);
    formDataObj.append('description', formData.description);
    formDataObj.append('price', formData.price);
    formDataObj.append('stock', formData.stock);
    formDataObj.append('unit', formData.unit);
    formDataObj.append('condition', formData.condition);
    if (formData.category_id) formDataObj.append('category_id', formData.category_id);
    
    // Append image files (hanya yang berupa File object)
    formData.images.forEach((image, index) => {
      if (image instanceof File) {
        formDataObj.append(`images[${index}]`, image);
      }
    });
    
    try {
      if (editingProduct) {
        formDataObj.append('_method', 'PUT');
        await api.post(`/products/${editingProduct.id}`, formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/products', formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      setShowModal(false);
      resetForm();
      fetchProducts();
      alert(editingProduct ? 'Produk berhasil diupdate!' : 'Produk berhasil ditambahkan!');
    } catch (err) {
      console.error('Gagal menyimpan produk:', err);
      const message = err.response?.data?.message || 'Gagal menyimpan produk';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error('Gagal menghapus produk:', err);
        alert('Gagal menghapus produk');
      }
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await api.put(`/products/${product.id}`, {
        ...product,
        is_active: !product.is_active,
      });
      fetchProducts();
    } catch (err) {
      console.error('Gagal mengubah status:', err);
      alert('Gagal mengubah status produk');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      unit: 'pcs',
      condition: 'new',
      category_id: '',
      images: [],
    });
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      unit: product.unit || 'pcs',
      condition: product.condition || 'new',
      category_id: product.category_id || '',
      images: product.images || [],
    });
    setShowModal(true);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Kelola Produk</h1>
          <p className="text-gray-500">Kelola semua produk yang Anda jual</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <i className="fas fa-plus"></i>
          Tambah Produk
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onEdit={openEditModal}
          />
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <i className="fas fa-box-open text-5xl mb-3 text-gray-300"></i>
            <p>Belum ada produk. Klik "Tambah Produk" untuk mulai menjual.</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
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
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Contoh: Kursi Kayu Jati"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Deskripsikan produk Anda secara detail..."
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
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jumlah stok"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="pcs, set, buah, dll"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kondisi</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="new">✨ Baru</option>
                    <option value="used">🔄 Bekas</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Produk</label>
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      {editingProduct ? 'Update Produk' : 'Simpan Produk'}
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