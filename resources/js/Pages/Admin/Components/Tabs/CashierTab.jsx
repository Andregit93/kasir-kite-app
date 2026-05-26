import React, { useState, useMemo } from 'react';
import { Plus, Users, Edit3, Trash2, Search, Mail, ShieldCheck, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const CashierTab = React.memo(({ cashiers, isLoading, searchQuery, setSearchQuery, onAdd, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Filter cashiers based on search query
  const filteredCashiers = useMemo(() => {
    const query = (searchQuery || '').toLowerCase();
    if (!query) return cashiers;
    return cashiers.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    );
  }, [cashiers, searchQuery]);

  // Pagination logic
  const totalPages = useMemo(() => {
    const count = filteredCashiers.length;
    if (itemsPerPage === 'all' || count === 0) return 1;
    return Math.ceil(count / itemsPerPage);
  }, [filteredCashiers, itemsPerPage]);

  const paginatedCashiers = useMemo(() => {
    if (itemsPerPage === 'all') return filteredCashiers;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCashiers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCashiers, currentPage, itemsPerPage]);

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-[1500px] mx-auto pb-20">

      {/* ROW 1: Search Bar + Add Button */}
      <div className="flex items-center gap-3 mb-4 relative z-20">
        <div className="flex-1 relative font-manrope">
          <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isLoading ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Cari nama atau email kasir..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 shadow-sm transition-all"
          />
        </div>
        <button
          onClick={onAdd}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Kasir Baru</span>
        </button>
      </div>

      {/* ROW 2: Total Count + Pagination Controls */}
      <div className="flex items-center justify-between mb-4 font-manrope">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/50 shadow-sm">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm tabular-nums">{filteredCashiers.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Personel {searchQuery && `• Pencarian: "${searchQuery}"`}</span>
          </div>
        </div>

        {filteredCashiers.length > 12 && (
          <div className="flex items-center bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-slate-200/80 shadow-sm shrink-0">
            <div className="flex items-center px-3 border-r border-slate-200 relative">
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(e.target.value === 'all' ? 'all' : parseInt(e.target.value)); setCurrentPage(1); }}
                className="bg-transparent border-none focus:ring-0 text-[10px] sm:text-xs font-black text-blue-600 p-0 appearance-none z-10 outline-none cursor-pointer"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value="all">Semua</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1 md:gap-1.5 px-1.5">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className={`w-7 h-7 md:w-8 md:h-8 rounded-[10px] flex items-center justify-center transition-all ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600 active:scale-95'}`}>
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] md:text-xs font-black text-slate-700 tabular-nums">
                {currentPage} <span className="text-slate-300 px-0.5 font-medium">/</span> {totalPages || 1}
              </span>
              <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0} className={`w-7 h-7 md:w-8 md:h-8 rounded-[10px] flex items-center justify-center transition-all ${currentPage === totalPages || totalPages === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600 active:scale-95'}`}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
        {paginatedCashiers.map(c => (
          <div key={c.id} className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-slate-200/60 p-5 shadow-lg shadow-slate-200/30 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300/60 group flex flex-col">

            <div className="flex items-start gap-4 mb-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200 shadow-inner group-hover:scale-105 transition-transform duration-500">
                  {c.photo_url ? <img src={c.photo_url} alt="Kasir" className="w-full h-full object-cover" /> : <Users size={28} className="text-slate-300" />}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm" title="Online Status">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="flex flex-col flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h4 className="text-sm font-black text-slate-900 truncate">{c.name}</h4>
                  <ShieldCheck size={14} className="text-blue-500 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Mail size={12} className="shrink-0" />
                  <p className="text-[10px] font-bold truncate tracking-wide">{c.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2 w-full">
              <button
                onClick={() => onEdit(c)}
                className="flex-1 py-2.5 bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl font-bold text-xs transition-all shadow-sm border border-slate-200/80 flex items-center justify-center gap-2"
              >
                <Edit3 size={14} /> Profile
              </button>
              <button
                onClick={() => onDelete(c.id, c.name)}
                className="w-12 py-2.5 bg-slate-50 hover:bg-red-500 hover:text-white text-slate-500 rounded-xl transition-all shadow-sm border border-slate-200/80 flex items-center justify-center"
                title="Cabut Akses"
              >
                <Trash2 size={14} />
              </button>
            </div>

          </div>
        ))}

        {filteredCashiers.length === 0 && (
          <div className="col-span-full py-20 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-600">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
              <Users size={32} />
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-slate-800 mb-1">
              {searchQuery ? 'Personel Tidak Ditemukan' : 'Belum Ada Personel'}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest italic opacity-50">
              {searchQuery ? `Pencarian "${searchQuery}" nihil.` : 'Daftarkan kasir pertama Anda'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
});

export default CashierTab;
