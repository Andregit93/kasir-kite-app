import React from 'react';
import { Trophy, Package, ChevronRight, Box, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../../../../utils/formatters';

const TopProductsWidget = React.memo(({ products, onNavigate, storeLogo }) => (
  <div className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] border border-amber-100/50 p-5 shadow-lg shadow-amber-500/10 transition-all duration-500 hover:-translate-y-1.5 group flex flex-col h-full overflow-hidden font-manrope">
    {/* HEADER: Normalized Sizing */}
    <div className="flex items-center justify-between relative z-10 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3 border-2 border-white shadow-sm shadow-slate-200/50 bg-amber-500 text-white">
          <Trophy size={20} />
        </div>
        <div>
          <div className="bg-amber-600 text-white text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-md shadow-sm mb-1 w-fit whitespace-nowrap">
            Produk Paling Laris
          </div>
          <div className="flex items-center gap-1 font-bold text-[8px] text-amber-600 uppercase tracking-widest leading-tight opacity-70">
            Volume penjualan tertinggi.
          </div>
        </div>
      </div>

      {/* SYNC PLACEHOLDER: Matches header button in other widgets */}
      <div className="w-8 h-8 opacity-0 pointer-events-none shrink-0" />
    </div>

    <div className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar relative z-10">
      {products?.slice(0, 5).length > 0 ? (
        products.slice(0, 5).map((p, i) => (
          <div key={p.id} className="flex items-center gap-3.5 group/item cursor-pointer hover:bg-white p-1.5 rounded-2xl transition-all border border-transparent hover:border-amber-100 hover:shadow-md">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center group-hover/item:scale-105 transition-transform shadow-inner">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : storeLogo ? (
                  <img src={storeLogo} alt="Store Logo" className="w-full h-full object-contain p-1.5 opacity-60" />
                ) : (
                  <Package size={18} className="text-slate-300" />
                )}
              </div>
              <div className={`absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black shadow-md border-2 border-white ${i === 0 ? 'bg-amber-400 text-white' :
                i === 1 ? 'bg-slate-300 text-white' :
                  i === 2 ? 'bg-orange-300 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                {i + 1}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-800 truncate group-hover/item:text-amber-600 transition-colors uppercase tracking-tight leading-none mb-1">{p.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black bg-amber-50 text-amber-700 uppercase tabular-nums px-1.5 py-0.5 rounded border border-amber-100">
                  {p.total_sold} terjual
                </span>
                <span className="text-[9px] font-black text-slate-900 tabular-nums">
                  {formatCurrency(p.revenue)}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-slate-200 py-10 opacity-30">
          <Box className="mb-4" size={50} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Data Kosong</p>
        </div>
      )}
    </div>
  </div>
));

export default TopProductsWidget;
