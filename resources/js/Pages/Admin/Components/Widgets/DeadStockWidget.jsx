import React from 'react';
import { Ghost, Package, TrendingDown, Activity, ExternalLink } from 'lucide-react';

const DeadStockWidget = React.memo(({ products, onNavigate, storeLogo }) => (
  <div className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] border border-slate-100/50 p-5 shadow-lg shadow-slate-500/10 transition-all duration-500 hover:-translate-y-1.5 group flex flex-col h-full overflow-hidden font-manrope">
    {/* HEADER: Normalized Sizing */}
    <div className="flex items-center justify-between relative z-10 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3 border-2 border-white shadow-sm shadow-slate-200/50 bg-slate-500 text-white">
          <Ghost size={20} />
        </div>
        <div>
          <div className="bg-slate-600 text-white text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-md shadow-sm mb-1 w-fit whitespace-nowrap">
            Stok Barang Lama
          </div>
          <div className="flex items-center gap-1 font-bold text-[8px] text-slate-500 uppercase tracking-widest leading-tight opacity-70">
            Tidak terjual dalam 7 hari terakhir.
          </div>
        </div>
      </div>
      <button
        onClick={onNavigate}
        className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 shadow-sm"
        title="Kelola Inventori"
      >
        <ExternalLink size={14} />
      </button>
    </div>

    <div className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar relative z-10">
      {products?.slice(0, 5).length > 0 ? (
        <>
          {products.slice(0, 5).map((p) => (
            <div key={p.id} className="flex items-center gap-3.5 group/item p-1.5 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-default text-slate-400">
              <div className="w-10 h-10 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 flex items-center justify-center">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover opacity-60 grayscale group-hover/item:grayscale-0 group-hover/item:opacity-100 transition-all duration-500" />
                ) : storeLogo ? (
                  <img src={storeLogo} alt="Store Logo" className="w-full h-full object-contain p-1.5 opacity-40 grayscale group-hover/item:grayscale-0 group-hover/item:opacity-80 transition-all cursor-default" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Package size={18} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-500 truncate uppercase tracking-tighter group-hover/item:text-slate-800 transition-colors italic leading-none mb-1">{p.name}</p>
                <p className="text-[9px] font-bold text-slate-300 uppercase w-fit border border-slate-100 px-2 py-0.5 rounded shadow-sm scale-95 origin-left">Stok: {p.stock} Unit</p>
              </div>
              <div className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-black rounded-full border border-slate-100 uppercase tracking-widest whitespace-nowrap">
                STAGNANT
              </div>
            </div>
          ))}

          {/* ADVICE BOX: Now inside the content area to prevent height stretching */}
          <div className="mt-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="mt-0.5 p-1 bg-white rounded-md shadow-sm border border-slate-200">
              <TrendingDown size={12} className="text-slate-400 shrink-0" />
            </div>
            <p className="text-[8px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight italic">
              Berikan promo khusus untuk mempercepat sirkulasi produk ini.
            </p>
          </div>
        </>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 py-10 opacity-50">
          <Activity size={50} className="mb-4 text-slate-300" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Inventori Sehat</p>
        </div>
      )}
    </div>
  </div>
));

export default DeadStockWidget;
