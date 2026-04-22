// src/components/CancellationModal.jsx
import { useState } from 'react';

export default function CancellationModal({ isOpen, onClose, onConfirm, title = "Batalkan Pesanan", message = "Apakah Anda yakin ingin membatalkan pesanan ini?" }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim() || reason.trim().length < 5) {
      setError('Harap masukkan alasan pembatalan (minimal 5 karakter)');
      return;
    }
    onConfirm(reason.trim());
    setReason('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-4">{message}</p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Pembatalan</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="3"
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Contoh: salah pilih produk, tidak jadi beli, stok habis, dll."
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={handleConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-semibold transition">Ya, Batalkan</button>
          <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl font-semibold transition">Kembali</button>
        </div>
      </div>
    </div>
  );
}