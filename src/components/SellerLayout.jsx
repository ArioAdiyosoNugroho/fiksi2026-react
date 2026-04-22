// src/components/SellerLayout.jsx
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SellerSidebar from './SellerSidebar';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function SellerLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'seller' && user.role !== 'collector') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || (user.role !== 'seller' && user.role !== 'collector')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="lg:ml-72">
        <header className="lg:hidden bg-white border-b sticky top-0 z-30">
          <div className="px-4 py-3 flex items-center justify-between">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
              <i className="fas fa-bars text-xl text-gray-600"></i>
            </button>
            <span className="font-medium">Dashboard</span>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}