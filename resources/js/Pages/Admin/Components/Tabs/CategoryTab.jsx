import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Tag, Edit3, Trash2, Search, ChevronLeft, ChevronRight, Package, ChevronDown } from 'lucide-react';
import CategoryCard from '../Shared/CategoryCard';

const CategorySkeleton = () => (
  <div className="bg-white/90 backdrop-blur-xl rounded-[1.5rem] lg:rounded-[2rem] border border-slate-200/50 p-4 lg:p-5 shadow-lg shadow-slate-200/30 h-full animate-pulse-elite overflow-hidden relative">
    <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 rounded-l-[1.5rem] lg:rounded-l-[2rem]" />
    <div className="flex items-center justify-center lg:justify-start gap-2.5 mb-3">
      <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-slate-200" />
      <div className="min-w-0 lg:flex-1 space-y-2">
        <div className="h-4 w-24 bg-slate-200 rounded-md" />
        <div className="h-3 w-16 bg-slate-100 rounded-md" />
      </div>
    </div>
    <div className="flex items-center gap-1.5 mt-auto pt-3 border-t border-slate-100/80">
      <div className="flex-1 h-9 lg:h-10 bg-slate-50 rounded-xl" />
      <div className="w-10 h-9 lg:w-11 lg:h-10 bg-slate-50 rounded-xl" />
    </div>
  </div>
);

const CategoryTab = React.memo(({
  categories,
  searchQuery,
  setSearchQuery,
  onAdd,
  onEdit,
  onDelete,
  isLoading
}) => {
  // --- UI STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // --- PERFORMANCE: Search Debounce Logic ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- DATA TRANSFORMATION ---

  // 1. Filter (Uses debounced state for performance)
  const filteredCategories = useMemo(() => {
    const query = (debouncedQuery || '').toLowerCase();
    const safeCategories = categories || [];
    if (!query) return safeCategories;
    return safeCategories.filter(c => (c.name || '').toLowerCase().includes(query));
  }, [categories, debouncedQuery]);

  // 2. Sort (Backend already sorts, but this ensures client consistency)
  const sortedCategories = useMemo(() => {
    return [...filteredCategories].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '')
    );
  }, [filteredCategories]);

  // 3. Derived Pagination
  const totalPages = useMemo(() => {
    const count = sortedCategories.length;
    if (itemsPerPage === 'all' || count === 0) return 1;
    return Math.ceil(count / itemsPerPage);
  }, [sortedCategories.length, itemsPerPage]);

  const paginatedCategories = useMemo(() => {
    if (itemsPerPage === 'all') return sortedCategories;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedCategories, currentPage, itemsPerPage]);

  // --- SIDE EFFECTS ---

  // Reset page on search or limit change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, itemsPerPage]);

  // --- HANDLERS ---
  const handlePageChange = useCallback((direction) => {
    setCurrentPage(prev => direction === 'next'
      ? Math.min(totalPages, prev + 1)
      : Math.max(1, prev - 1)
    );
  }, [totalPages]);

  // Stable callbacks for Categories to maintain React.memo effectiveness
  const handleEdit = useCallback((c) => onEdit(c), [onEdit]);
  const handleDelete = useCallback((c) => onDelete(c), [onDelete]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-[1400px] mx-auto">
      {/* ROW 1: Search Bar + Add Button */}
      <div className="flex items-center gap-3 mb-4 relative z-20">
        <div className="flex-1 relative font-manrope">
          <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isLoading ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 shadow-sm transition-all"
          />
        </div>
        <button
          onClick={onAdd}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Tambah Kategori</span>
        </button>
      </div>

      {/* ROW 2: Results Info + Pagination */}
      <div className="flex items-center justify-between mb-5 font-manrope">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/50 shadow-sm">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm tabular-nums">{filteredCategories.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Kategori {debouncedQuery && `• Pencarian: "${debouncedQuery}"`}</span>
          </div>
        </div>

        {filteredCategories.length > 12 && (
          <div className="flex items-center bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-slate-200/80 shadow-sm shrink-0">
            <div className="flex items-center pl-5 border-r border-slate-200 relative">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="bg-transparent border-none focus:ring-0 text-[10px] sm:text-xs font-black text-blue-600 p-0 appearance-none outline-none cursor-pointer"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value="all">Semua</option>
              </select>
            </div>

            <div className="flex items-center gap-1 md:gap-1.5 px-1.5">
              <button
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 1 || isLoading}
                className={`w-7 h-7 md:w-8 md:h-8 rounded-[10px] flex items-center justify-center transition-all ${currentPage === 1 || isLoading ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600 active:scale-95'}`}
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] md:text-xs font-black text-slate-700 tabular-nums">
                {currentPage} <span className="text-slate-300 px-0.5 font-medium">/</span> {totalPages}
              </span>
              <button
                onClick={() => handlePageChange('next')}
                disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                className={`w-7 h-7 md:w-8 md:h-8 rounded-[10px] flex items-center justify-center transition-all ${currentPage === totalPages || totalPages === 0 || isLoading ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600 active:scale-95'}`}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* GRID KATEGORI */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 relative">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <CategorySkeleton key={i} />)
        ) : (
          <>
            {paginatedCategories.map((c, index) => (
              <CategoryCard
                key={c.id}
                category={c}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}

            {filteredCategories.length === 0 && (
              <div className="col-span-full py-16 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 shadow-sm animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4 shadow-inner">
                  <Tag className="opacity-30 text-blue-600" size={32} />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-slate-600 mb-1">
                  {debouncedQuery ? 'Kategori Tidak Ditemukan' : 'Belum Ada Kategori'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-tight">
                  {debouncedQuery ? `Tidak ada hasil untuk "${debouncedQuery}"` : 'Tingkatkan efisiensi dengan mengelompokkan produk Anda'}
                </p>
                {!debouncedQuery && (
                  <button
                    onClick={onAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                  >
                    <Plus size={14} /> Buat Kategori Pertama
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default CategoryTab;
