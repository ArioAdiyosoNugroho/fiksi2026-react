// src/components/UploadProofModal.jsx
import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

export default function UploadProofModal({ order, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    if (order.seller) setSeller(order.seller);
    else if (order.seller_id) api.get(`/users/${order.seller_id}`).then(res => setSeller(res.data)).catch(console.error);
  }, [order]);

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) {
      if (!f.type.startsWith('image/')) return setError('File harus gambar');
      if (f.size > 5 * 1024 * 1024) return setError('Maks 5MB');
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return setError('Pilih file');
    const fd = new FormData();
    fd.append('proof', file);
    setUploading(true);
    try {
      await api.post(`/orders/${order.id}/proof`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto shadow-xl">
        <div className="sticky top-0 bg-white px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Upload Bukti Transfer</h2>
          <p className="text-sm text-gray-500">Lengkapi pembayaran pesanan</p>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <div className="flex justify-between text-sm"><span className="text-gray-500">No. Pesanan</span><span className="font-mono">{order.order_number}</span></div>
            <div className="flex justify-between text-sm mt-2 pt-2 border-t"><span className="text-gray-500">Total</span><span className="font-bold text-blue-600">Rp {Number(order.total).toLocaleString()}</span></div>
          </div>

          {seller && (
            <div className="mb-5">
              <p className="text-sm font-medium mb-2">Transfer ke rekening penjual:</p>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="font-semibold">{seller.name}</p>
                {seller.bank_accounts?.length > 0 ? (
                  seller.bank_accounts.map((b, i) => (
                    <div key={i} className="mt-2 text-sm border-t border-blue-100 pt-2 first:border-0 first:pt-0">
                      <p className="font-mono">{b.bank_name} - {b.account_number}</p>
                      <p className="text-xs text-gray-500">a.n. {b.account_name}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 mt-1">Penjual belum menambahkan rekening. Hubungi via WhatsApp.</p>
                )}
                {seller.whatsapp && (
                  <a href={`https://wa.me/${seller.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-green-600 mt-2">
                    <i className="fab fa-whatsapp"></i> Hubungi Penjual
                  </a>
                )}
              </div>
            </div>
          )}

          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-blue-400">
            {!preview ? (
              <>
                <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <p className="text-gray-600 text-sm">Klik atau tarik gambar</p>
                <p className="text-gray-400 text-xs">JPG, PNG maks. 5MB</p>
              </>
            ) : (
              <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded" />
            )}
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} className="hidden" />
          </div>
          {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
          <div className="flex gap-3 mt-6">
            <button onClick={handleUpload} disabled={uploading || !file} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium">Upload</button>
            <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl">Batal</button>
          </div>
        </div>
      </div>
    </div>
  );
}