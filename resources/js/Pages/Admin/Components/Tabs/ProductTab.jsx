import React, { useState, useMemo } from 'react';
import { Plus, Search, Box, Edit3, Trash2, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../../../utils/formatters';

const ProductTab = React.memo(({ products, categories, isLoading, searchQuery, setSearchQuery, onAdd, onEdit, onDelete, storeLogo }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    const query = (searchQuery || '').toLowerCase();
    if (!query) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.barcode && p.barcode.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  // Pagination logic
  const totalPages = useMemo(() => {
    const count = filteredProducts.length;
    if (itemsPerPage === 'all' || count === 0) return 1;
    return Math.ceil(count / itemsPerPage);
  }, [filteredProducts, itemsPerPage]);

  const paginatedProducts = useMemo(() => {
    if (itemsPerPage === 'all') return filteredProducts;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getCategoryBadge = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    if (cat) {
      const hex = cat.color || '#3b82f6';
      return (
        <span style={{ backgroundColor: hex + '15', color: hex, borderColor: hex + '25' }} className="px-2.5 py-1 rounded-lg text-[9px] font-black border tracking-widest uppercase truncate max-w-[120px] inline-block">
          {cat.name}
        </span>
      );
    }
    return <span className="px-2.5 py-1 rounded-lg text-[9px] bg-slate-100 text-slate-400 font-bold border border-slate-200 uppercase tracking-widest">Uncategorized</span>;
  };

  const getStockBadge = (stock) => {
    if (stock === -1) {
      return <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-slate-200">Unlimited</span>;
    }
    const style = stock === 0 ? 'bg-red-50 text-red-500 border-red-200' :
      stock < 10 ? 'bg-amber-50 text-amber-600 border-amber-200' :
        'bg-emerald-50 text-emerald-600 border-emerald-200';
    return (
      <span className={`px-4 py-2 rounded-2xl text-[12px] font-black border shadow-sm ${style}`}>
        {stock} <span className="text-[10px] opacity-70">UNIT</span>
      </span>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-[1500px] mx-auto pb-20">

      {/* ROW 1: Search Bar + Add Button */}
      <div className="flex items-center gap-3 mb-4 relative z-20">
        <div className="flex-1 relative font-manrope">
          <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isLoading ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Cari nama produk atau ID barcode..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 shadow-sm transition-all"
          />
        </div>
        <button
          onClick={onAdd}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Produk Baru</span>
        </button>
      </div>

      {/* ROW 2: Results Info + Pagination */}
      <div className="flex items-center justify-between mb-5 font-manrope">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/50 shadow-sm">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm tabular-nums">{filteredProducts.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Produk {searchQuery && `• Pencarian: "${searchQuery}"`}</span>
          </div>
        </div>

        {filteredProducts.length > 12 && (
          <div className="flex items-center bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-slate-200/80 shadow-sm shrink-0">
            <div className="flex items-center pl-5 border-r border-slate-200 relative">
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(e.target.value === 'all' ? 'all' : parseInt(e.target.value)); setCurrentPage(1); }}
                className="bg-transparent border-none focus:ring-0 text-[10px] sm:text-xs font-black text-blue-600 p-0 appearance-none outline-none cursor-pointer"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value="all">Semua</option>
              </select>
            </div>

            <div className="flex items-center gap-1 md:gap-1.5 px-1.5">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className={`w-7 h-7 md:w-8 md:h-8 rounded-[10px] flex items-center justify-center transition-all ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600 active:scale-95'}`}>
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] md:text-xs font-black text-slate-700 tabular-nums">
                {currentPage} <span className="text-slate-300 px-0.5 font-medium">/</span> {totalPages}
              </span>
              <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0} className={`w-7 h-7 md:w-8 md:h-8 rounded-[10px] flex items-center justify-center transition-all ${currentPage === totalPages || totalPages === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600 active:scale-95'}`}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-[1.5rem] lg:rounded-[2rem] border border-slate-200/60 shadow-lg shadow-slate-200/30 overflow-hidden">

        {/* MOBILE VIEW (CARD LAYOUT) */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredProducts.length === 0 ? (
            <EmptyState searchQuery={searchQuery} onAdd={onAdd} />
          ) : (
            paginatedProducts.map(p => (
              <div key={p.id} className="p-4 flex flex-col gap-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {p.image_url || storeLogo ? (
                      <img src={p.image_url || storeLogo} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Box size={24} className="text-slate-300" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-black text-sm text-slate-800 line-clamp-2 leading-tight">{p.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md font-mono text-[9px] font-black">#{p.barcode}</span>
                        {getCategoryBadge(p.category_id)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-base font-black text-blue-600">{formatCurrency(p.price)}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Stock & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  {getStockBadge(p.stock)}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(p)}
                      className="w-10 h-10 flex items-center justify-center bg-slate-50 text-blue-600 rounded-xl font-bold transition-colors active:bg-blue-100"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(p.id, p.name)}
                      className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl transition-colors active:bg-rose-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP VIEW (TABLE LAYOUT) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 pl-8">Produk</th>
                <th className="px-6 py-5">Kategori</th>
                <th className="px-6 py-5 text-right">Harga Jual</th>
                <th className="px-6 py-5 text-center">Stok</th>
                <th className="px-6 py-5 text-right pr-8">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-0">
                    <EmptyState searchQuery={searchQuery} onAdd={onAdd} />
                  </td>
                </tr>
              ) : (
                paginatedProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center shrink-0">
                          {p.image_url || storeLogo ? (
                            <img src={p.image_url || storeLogo} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Box size={20} className="text-slate-300" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-slate-800 text-sm truncate max-w-[250px]">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">#{p.barcode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getCategoryBadge(p.category_id)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-blue-600">{formatCurrency(p.price)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStockBadge(p.stock)}
                    </td>
                    <td className="px-6 py-4 pr-8 text-right w-32">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(p)}
                          className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm"
                          title="Edit Produk"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(p.id, p.name)}
                          className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white rounded-lg transition-all shadow-sm"
                          title="Hapus Produk"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
});

// Extracted Empty State component for reusability between mobile and desktop views
const EmptyState = ({ searchQuery, onAdd }) => (
  <div className="py-16 flex flex-col items-center justify-center text-slate-400 px-4 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
      <Box className="opacity-30" size={32} />
    </div>
    <p className="text-sm font-black uppercase tracking-widest mb-1 text-slate-600">
      {searchQuery ? 'Produk Tidak Ditemukan' : 'Belum Ada Produk'}
    </p>
    <p className="text-[10px] font-bold text-slate-400 mb-6 max-w-xs">
      {searchQuery ? `Pencarian untuk "${searchQuery}" tidak membuahkan hasil.` : 'Mulai tambahkan produk ke dalam katalog Anda untuk memulai penjualan.'}
    </p>
    {!searchQuery && (
      <button
        onClick={onAdd}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
      >
        <Plus size={14} /> Tambah Produk
      </button>
    )}
  </div>
);

export default ProductTab;
