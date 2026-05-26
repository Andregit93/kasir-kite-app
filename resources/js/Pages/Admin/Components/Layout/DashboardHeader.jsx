import React from 'react';
import { Menu } from 'lucide-react';
import RealTimeClock from '../Shared/RealTimeClock';

const FilterBtn = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
      active
        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
        : 'text-slate-500 hover:bg-white hover:text-blue-600'
    }`}
  >
    {label}
  </button>
);

const HeaderContent = ({ activeTab }) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Dashboard';
      case 'categories': return 'Kategori';
      case 'products': return 'Produk';
      case 'cashiers': return 'Kasir';
      case 'reports': return 'Laporan';
      case 'settings': return 'Pengaturan';
      default: return 'Panel';
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">
        {getTitle()}
      </h2>
    </div>
  );
};

const DashboardHeader = ({ 
  activeTab, 
  onMenuClick, 
  chartFilter, 
  onFilterChange 
}) => {
  return (
    <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex flex-col items-stretch px-4 lg:px-6 shrink-0 z-50 sticky top-0 overflow-hidden transition-all duration-300">
      {/* MAIN TOP ROW */}
      <div className="flex items-center justify-between h-14 lg:h-20">
        <div className="flex items-center gap-3 lg:gap-4 h-full">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 -ml-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <Menu size={22} />
          </button>
          <HeaderContent activeTab={activeTab} />
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          {/* MOBILE LOGO: Custom Branding */}
          <div className="lg:hidden pr-1">
            <h1 className="text-xl font-manrope font-black text-blue-600 tracking-tight leading-none">
              KasirKite
            </h1>
          </div>

          {/* DESKTOP FILTERS */}
          {activeTab === 'overview' && (
            <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60 shadow-inner">
              <FilterBtn active={chartFilter === 'daily'} onClick={() => onFilterChange('daily')} label="Hari Ini" />
              <FilterBtn active={chartFilter === 'monthly'} onClick={() => onFilterChange('monthly')} label="Bulan Ini" />
              <FilterBtn active={chartFilter === 'yearly'} onClick={() => onFilterChange('yearly')} label="Tahun Ini" />
            </div>
          )}
          
          <div className="hidden md:block scale-90 lg:scale-100">
            <RealTimeClock />
          </div>
        </div>
      </div>


    </header>
  );
};

export default DashboardHeader;
