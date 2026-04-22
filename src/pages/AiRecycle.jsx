// src/pages/AiRecycle.jsx
import { useState, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const difficultyColor = {
  'Mudah': 'bg-green-100 text-green-700',
  'Sedang': 'bg-yellow-100 text-yellow-700',
  'Sulit': 'bg-red-100 text-red-700',
};

export default function AiRecycle() {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeCard, setActiveCard] = useState(0);
  const [expandedSteps, setExpandedSteps] = useState({});
  const fileInputRef = useRef(null);
  const resultRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 10MB');
      return;
    }
    setError(null);
    setResult(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/ai/analyze-trash`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menganalisis gambar');
      }

      setResult(data.data);
      setActiveCard(0);
      setExpandedSteps({});

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setLoading(false);
  };

  const toggleSteps = (id) => {
    setExpandedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="relative bg-blue-50 rounded-[2.5rem] p-10 md:p-16 overflow-hidden mb-16 mt-8">
          {/* Blobs */}
          <div className="absolute w-64 h-64 bg-blue-300 rounded-full top-0 right-0 filter blur-[60px] opacity-40 z-0"></div>
          <div className="absolute w-64 h-64 bg-yellow-200 rounded-full bottom-0 left-0 filter blur-[60px] opacity-40 z-0"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Left Text */}
            <div className="md:w-1/2">
              <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Powered by Gemini AI</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                Ubah Sampah Menjadi{' '}
                <span className="text-blue-600">Karya Seni.</span>
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-lg">
                Foto objek di sekitar Anda — botol, kardus, plastik — dan AI kami akan memberikan{' '}
                <strong>3 ide kreatif</strong> lengkap dengan cara membuat & referensi gambarnya.
              </p>

              {/* Steps mini */}
              <div className="flex flex-col gap-3">
                {[
                  { n: '1', label: 'Upload foto sampah Anda' },
                  { n: '2', label: 'AI Gemini menganalisis bahan' },
                  { n: '3', label: 'Dapatkan 3 rekomendasi produk kreatif' },
                ].map(s => (
                  <div key={s.n} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {s.n}
                    </div>
                    <span className="text-sm text-slate-600">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Upload Card */}
            <div className="md:w-1/2 w-full max-w-md">
              <div className="bg-white rounded-[2rem] p-4 shadow-2xl border border-white">
                {/* Preview / Drop Area */}
                <div
                  className={`relative rounded-[1.5rem] overflow-hidden aspect-square cursor-pointer transition-all
                    ${dragOver ? 'ring-4 ring-blue-400 ring-offset-2' : ''}
                    ${previewUrl ? 'bg-black' : 'bg-slate-900'}
                  `}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => !previewUrl && fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                      />
                      {/* Overlay reset */}
                      <button
                        onClick={(e) => { e.stopPropagation(); reset(); }}
                        className="absolute top-4 right-4 z-30 bg-white/90 text-gray-700 rounded-full p-2 shadow hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="absolute bottom-4 left-4 right-4 z-30">
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-xs text-slate-700 font-medium truncate">
                          📎 {selectedFile?.name}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Scan animation */}
                      <div className="scan-line-ai absolute w-full z-20"
                        style={{
                          height: '2px',
                          background: 'linear-gradient(to right, transparent, #2563eb, transparent)',
                          animation: 'scanAi 2s linear infinite',
                          position: 'absolute',
                        }}
                      ></div>

                      <img
                        src="https://images.unsplash.com/photo-1591193512858-12ee99c38285?q=80&w=800"
                        className="w-full h-full object-cover opacity-40"
                        alt="Scan trash"
                      />

                      <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
                        <div className={`w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-4 transition-transform ${dragOver ? 'scale-125' : 'hover:scale-110'}`}>
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <p className="text-white font-medium text-sm">
                          {dragOver ? 'Lepaskan gambar di sini' : 'Tap untuk upload atau drop gambar'}
                        </p>
                        <p className="text-white/50 text-xs mt-1">JPG, PNG, WEBP · Maks 10MB</p>
                      </div>

                      {/* Corner brackets */}
                      {[
                        'top-6 left-6 border-t-2 border-l-2',
                        'top-6 right-6 border-t-2 border-r-2',
                        'bottom-6 left-6 border-b-2 border-l-2',
                        'bottom-6 right-6 border-b-2 border-r-2',
                      ].map((cls, i) => (
                        <div key={i} className={`absolute w-8 h-8 border-blue-500 ${cls}`}></div>
                      ))}
                    </>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />

                {/* Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-slate-50 hover:bg-blue-50 py-3 rounded-xl text-xs font-bold transition-colors text-slate-700"
                  >
                    UPLOAD FILE
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={!selectedFile || loading}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all
                      ${selectedFile && !loading
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                        : 'bg-blue-200 text-blue-400 cursor-not-allowed'
                      }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        MENGANALISIS...
                      </span>
                    ) : 'IDENTIFY TRASH'}
                  </button>
                </div>

                {error && (
                  <div className="mt-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-4 py-2.5">
                    ⚠️ {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <section className="mb-16 text-center py-16">
            <div className="inline-flex flex-col items-center gap-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-3 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-xl">🔍</span>
                </div>
              </div>
              <div>
                <p className="text-slate-800 font-bold text-lg mb-1">Gemini AI sedang menganalisis...</p>
                <p className="text-slate-500 text-sm">Mengenali jenis sampah & mencari ide kreatif terbaik</p>
              </div>
              {/* Animated dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-blue-600"
                    style={{ animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }}
                  ></div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Result Section */}
        {result && !loading && (
          <section ref={resultRef} className="mb-24">
            {/* Detected trash banner */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold mb-3">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Analisis Selesai
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Terdeteksi: <span className="text-blue-600">{result.trash_type}</span>
                </h2>
                {result.trash_description && (
                  <p className="text-slate-500 text-sm mt-1">{result.trash_description}</p>
                )}
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-4 py-2.5 rounded-full transition-all border border-slate-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Scan Ulang
              </button>
            </div>

            {/* Tab selector (mobile) */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {result.recommendations?.map((rec, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCard(i)}
                  className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all
                    ${activeCard === i
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Ide #{i + 1}: {rec.product_name}
                </button>
              ))}
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {result.recommendations?.map((rec, i) => (
                <div
                  key={i}
                  className={`bg-white border rounded-[2rem] overflow-hidden transition-all duration-300 cursor-pointer
                    ${activeCard === i
                      ? 'border-blue-200 shadow-2xl shadow-blue-100 ring-2 ring-blue-600 ring-offset-2'
                      : 'border-slate-100 hover:shadow-xl hover:border-slate-200'
                    }`}
                  onClick={() => setActiveCard(i)}
                >
                  {/* Reference Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-tr from-blue-50 to-slate-100">
                    {rec.reference_image?.url ? (
                      <img
                        src={rec.reference_image.url}
                        alt={rec.product_name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">♻️</div>
                    )}
                    {/* Badge number */}
                    <div className="absolute top-4 left-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-black shadow-lg">
                      {i + 1}
                    </div>
                    {/* Category badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                      {rec.category}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{rec.product_name}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2">{rec.description}</p>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${difficultyColor[rec.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                        {rec.difficulty}
                      </span>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                        ⏱ {rec.estimated_time}
                      </span>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                        💰 {rec.estimated_cost}
                      </span>
                    </div>

                    {/* Active card: expanded content */}
                    {activeCard === i && (
                      <div className="space-y-4 animate-fadeIn">
                        {/* Materials */}
                        {rec.materials_needed?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Bahan yang Dibutuhkan</p>
                            <div className="flex flex-wrap gap-2">
                              {rec.materials_needed.map((m, mi) => (
                                <span key={mi} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                                  {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Steps */}
                        {rec.steps?.length > 0 && (
                          <div>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleSteps(i); }}
                              className="flex items-center justify-between w-full text-xs font-bold text-slate-700 uppercase tracking-wide mb-2"
                            >
                              <span>Cara Membuat ({rec.steps.length} Langkah)</span>
                              <svg
                                className={`w-4 h-4 transition-transform ${expandedSteps[i] ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {expandedSteps[i] && (
                              <ol className="space-y-2">
                                {rec.steps.map((step, si) => (
                                  <li key={si} className="flex gap-3 text-xs text-slate-600">
                                    <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-[10px]">
                                      {si + 1}
                                    </span>
                                    <span className="leading-relaxed pt-0.5">{step.replace(/^Langkah \d+:\s*/, '')}</span>
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>
                        )}

                        {/* Tips */}
                        {rec.tips && (
                          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                            <p className="text-xs font-bold text-yellow-700 mb-1">💡 Tips</p>
                            <p className="text-xs text-yellow-700 leading-relaxed">{rec.tips}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveCard(i); toggleSteps(i); }}
                      className={`mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all
                        ${activeCard === i
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                    >
                      {activeCard === i ? (expandedSteps[i] ? 'Sembunyikan Panduan' : 'Lihat Panduan Lengkap') : 'Pilih Ide Ini'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Uploaded image reference */}
            {result.uploaded_image && (
              <div className="mt-8 p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                <img
                  src={`${API_URL}${result.uploaded_image}`}
                  alt="Uploaded"
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div>
                  <p className="text-xs font-bold text-slate-700">Gambar yang dianalisis</p>
                  <p className="text-xs text-slate-500">{result.trash_type} · {new Date(result.analyzed_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* How it works */}
        {!result && !loading && (
          <section id="how-it-works" className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Hanya dengan 3 Langkah Mudah</h2>
              <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { n: '1', title: 'Snap Photo', desc: 'Ambil foto sampah plastik atau kertas yang Anda miliki dengan kamera HP.' },
                { n: '2', title: 'AI Analyze', desc: 'Gemini AI mengenali jenis bahan dan mencari kreasi DIY terbaik dari database global.' },
                { n: '3', title: 'Start Crafting', desc: 'Dapatkan panduan langkah-demi-langkah dan belanja bahan tambahan di platform.' },
              ].map(s => (
                <div key={s.n} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6">{s.n}</div>
                  <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Scan animation keyframe */}
      <style>{`
        @keyframes scanAi {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <Footer />
    </div>
  );
}