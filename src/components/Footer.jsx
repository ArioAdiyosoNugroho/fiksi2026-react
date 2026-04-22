import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-100 bg-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Newsletter Banner - biru seperti template */}
        <div className="bg-blue-600 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden mb-16 shadow-lg shadow-blue-600/20">
          <div className="md:w-1/2 z-10 mb-6 md:mb-0 text-center md:text-left">
            <h3 className="text-3xl font-bold text-white mb-2">Bergabung dengan newsletter kami!</h3>
            <p className="text-blue-100 text-sm">Dapatkan 20% diskon pesanan pertama dan info material terbaru.</p>
          </div>
          <div className="md:w-1/2 z-10 w-full flex justify-end">
            <div className="w-full max-w-md relative flex items-center bg-white rounded-full p-1.5 shadow-sm">
              <svg className="absolute left-5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                placeholder="Masukkan alamat email kamu"
                className="w-full bg-transparent py-2.5 pl-12 pr-4 text-sm focus:outline-none text-gray-800"
              />
              <button className="bg-[#1e1e1e] hover:bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-md">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Grid Link */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2 pr-8">
            <div className="text-2xl font-bold tracking-tight mb-6 text-gray-900">resiik.id</div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Marketplace produk & material daur ulang terpercaya. Belanja mudah, hemat, dan ramah lingkungan untuk semua kalangan.
            </p>
            <div className="flex space-x-3">
              {[
                { name: 'facebook-f', hover: 'hover:bg-blue-600' },
                { name: 'twitter', hover: 'hover:bg-[#1DA1F2]' },
                { name: 'instagram', hover: 'hover:bg-[#E1306C]' },
                { name: 'youtube', hover: 'hover:bg-[#FF0000]' },
              ].map((s) => (
                <a
                  key={s.name}
                  href="#"
                  className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 ${s.hover} hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
                >
                  <i className={`fab fa-${s.name} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Kategori */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Kategori</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-500">
              {['Logam & Besi', 'Kayu', 'Plastik', 'Elektronik Bekas', 'Fashion', 'Furnitur'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-blue-600 transition-colors duration-300 flex items-center group">
                    <span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden text-blue-600 opacity-0 group-hover:opacity-100">-</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Bantuan</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-500">
              {['Lacak Pesanan', 'Return & Refund', 'FAQ', 'Info Pengiriman', 'Hubungi Kami'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-blue-600 transition-colors duration-300 flex items-center group">
                    <span className="w-0 group-hover:w-3 transition-all duration-300 overflow-hidden text-blue-600 opacity-0 group-hover:opacity-100">-</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{item}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Hubungi Kami</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-500">
              <li className="flex items-start group">
                <div className="bg-gray-50 p-2 rounded-full mr-3 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <i className="fas fa-map-marker-alt w-4 text-center text-xs"></i>
                </div>
                <span className="mt-1">Surakarta, Jawa Tengah, Indonesia</span>
              </li>
              <li className="flex items-center group">
                <div className="bg-gray-50 p-2 rounded-full mr-3 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <i className="fas fa-phone-alt w-4 text-center text-xs"></i>
                </div>
                <a href="tel:+6281234567890" className="hover:text-blue-600 transition-colors">+62 812-3456-7890</a>
              </li>
              <li className="flex items-center group">
                <div className="bg-gray-50 p-2 rounded-full mr-3 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <i className="fas fa-envelope w-4 text-center text-xs"></i>
                </div>
                <a href="mailto:hello@resiik.id" className="hover:text-blue-600 transition-colors">hello@resiik.id</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">
            &copy; 2026 resiik.id. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-blue-600 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Syarat & Ketentuan</a>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0 text-2xl text-gray-300">
            <i className="fab fa-cc-visa hover:text-[#1434CB] transition-colors cursor-pointer" title="Visa"></i>
            <i className="fab fa-cc-mastercard hover:text-[#EB001B] transition-colors cursor-pointer" title="Mastercard"></i>
            <i className="fab fa-cc-paypal hover:text-[#003087] transition-colors cursor-pointer" title="PayPal"></i>
          </div>
        </div>

      </div>
    </footer>
  );
}