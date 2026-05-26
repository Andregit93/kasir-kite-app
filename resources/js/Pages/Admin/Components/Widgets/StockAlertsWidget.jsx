import React from 'react';
import { AlertCircle, Package, ArrowRight, ExternalLink } from 'lucide-react';


const StockAlertsWidget = ({ products, onNavigate, storeLogo }) => {
  return (
    <div className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] border border-rose-100/50 p-5 shadow-lg shadow-rose-500/10 transition-all duration-500 hover:-translate-y-1.5 group flex flex-col h-full overflow-hidden font-manrope">
      {/* HEADER: Normalized Sizing */}
      <div className="flex items-center justify-between relative z-10 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3 border-2 border-white shadow-sm shadow-slate-200/50 bg-rose-600 text-white">
            <AlertCircle size={20} />
          </div>
          <div>
            <div className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-md shadow-sm mb-1 w-fit whitespace-nowrap">
              Stok Hampir Habis
            </div>
            <div className="flex items-center gap-1 font-bold text-[8px] text-rose-600 uppercase tracking-widest leading-tight opacity-70">
              Unit kritis segera dipesan.
            </div>
          </div>
        </div>
        <button
          onClick={onNavigate}
          className="w-8 h-8 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all active:scale-95 shadow-sm"
          title="Restock Produk"
        >
          <ExternalLink size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar relative z-10">
        {products.slice(0, 5).length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 grayscale opacity-30">
            <Package size={40} className="mb-4 text-slate-300" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Semua Stok Aman</p>
          </div>
        ) : (
          products.slice(0, 5).map((product) => (
            <div
              key={product.id}
              className="group/item flex items-center gap-3.5 p-1.5 rounded-2xl border border-transparent hover:border-rose-100 hover:bg-white hover:shadow-md transition-all cursor-default"
            >
              <div className="w-10 h-10 bg-slate-50 rounded-xl overflow-hidden shadow-inner flex-shrink-0 border border-slate-100 flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                ) : storeLogo ? (
                  <img src={storeLogo} alt="Store Logo" className="w-full h-full object-contain p-1.5 opacity-60" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Package size={18} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-slate-800 text-xs truncate tracking-tight group-hover/item:text-rose-600 transition-colors uppercase leading-none mb-1">
                  {product.name}
                </h4>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-rose-600 uppercase tabular-nums bg-rose-50 px-2 py-0.5 rounded border border-rose-100 shadow-sm">
                    Sisa: {product.stock} Unit
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};



export default React.memo(StockAlertsWidget);
