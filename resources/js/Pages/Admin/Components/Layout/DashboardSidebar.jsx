import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Tag, Box, Users, FileText, Settings, X
} from 'lucide-react';
import SidebarHeader from '../Shared/SidebarHeader';
import SidebarFooter from '../Shared/SidebarFooter';

const NavItem = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300 font-manrope ${active
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1'
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
  >
    <div className={`${active ? 'scale-110' : ''} transition-transform`}>{icon}</div>
    <span className={`text-sm font-black tracking-tight ${active ? 'opacity-100' : 'opacity-80'}`}>
      {label}
    </span>
  </button>
);

const DashboardSidebar = ({
  activeTab,
  onNavigate,
  onLogout,
  storeName,
  userName,
  logo,
  isMobile = false,
  onCloseMobile
}) => {
  const content = (
    <>
      <div className={`p-4 border-b border-slate-50 flex justify-between items-center ${!isMobile ? 'lg:py-5 lg:px-4 lg:border-none' : ''}`}>
        <SidebarHeader storeName={storeName} userName={userName} logo={logo} />
        {isMobile && (
          <button onClick={onCloseMobile} className="p-2 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pt-2">
        <NavItem active={activeTab === 'overview'} onClick={() => onNavigate('overview')} icon={<LayoutDashboard size={isMobile ? 20 : 18} />} label="Dashboard" />
        <NavItem active={activeTab === 'categories'} onClick={() => onNavigate('categories')} icon={<Tag size={isMobile ? 20 : 18} />} label="Kategori" />
        <NavItem active={activeTab === 'products'} onClick={() => onNavigate('products')} icon={<Box size={isMobile ? 20 : 18} />} label="Produk" />
        <NavItem active={activeTab === 'cashiers'} onClick={() => onNavigate('cashiers')} icon={<Users size={isMobile ? 20 : 18} />} label="Tim Kasir" />
        <NavItem active={activeTab === 'reports'} onClick={() => onNavigate('reports')} icon={<FileText size={isMobile ? 20 : 18} />} label="Laporan" />
        <NavItem active={activeTab === 'settings'} onClick={() => onNavigate('settings')} icon={<Settings size={isMobile ? 20 : 18} />} label="Pengaturan" />
      </nav>

      <div className="p-4 border-t border-slate-50">
        <SidebarFooter onLogout={onLogout} />
      </div>
    </>
  );

  if (isMobile) {
    return (
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 w-72 bg-white z-[101] flex flex-col shadow-2xl"
      >
        {content}
      </motion.aside>
    );
  }

  return (
    <aside className="hidden lg:flex w-56 bg-white border-r border-slate-100 flex-col shrink-0 z-20 shadow-sm transition-all duration-300">
      {content}
    </aside>
  );
};

export default DashboardSidebar;
