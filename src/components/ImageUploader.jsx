// src/components/ImageUploader.jsx
import { useState, useRef, useEffect } from 'react'; // ✅ Tambahkan import React hooks

export default function ImageUploader({ images = [], onImagesChange, maxImages = 5 }) {
  const fileInputRef = useRef(null);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Effect untuk membuat preview URLs dari file-file baru
  useEffect(() => {
    const urls = images.map(img => {
      if (img instanceof File) {
        return URL.createObjectURL(img);
      }
      return null;
    }).filter(Boolean);
    
    setPreviewUrls(urls);
    
    // Cleanup URLs saat component unmount
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = maxImages - images.length;
    
    if (files.length > remainingSlots) {
      alert(`Maksimal ${maxImages} gambar. Tersisa ${remainingSlots} slot.`);
      return;
    }

    // Kirim files langsung (bukan base64)
    onImagesChange([...images, ...files]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    onImagesChange(newImages);
  };

  // Fungsi untuk mendapatkan URL gambar (baik dari File object atau string URL)
  const getImageSrc = (img, index) => {
    if (img instanceof File) {
      return previewUrls[index] || URL.createObjectURL(img);
    }
    if (typeof img === 'string') return img;
    if (img?.image_url) return img.image_url;
    if (img?.url) return img.url;
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, idx) => {
          const src = getImageSrc(img, idx);
          return (
            <div key={idx} className="relative group">
              {src ? (
                <img
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-xl border border-gray-200"
                  onError={(e) => {
                    e.target.src = '';
                    e.target.className = 'w-full h-32 object-cover rounded-xl border border-gray-200 bg-gray-100';
                  }}
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
                  <i className="fas fa-image text-gray-400 text-2xl"></i>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
        
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs text-gray-500">Upload Gambar</span>
          </button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-xs text-gray-500">
        Maksimal {maxImages} gambar. Format: JPG, PNG, GIF. Maks 5MB per gambar.
      </p>
    </div>
  );
}