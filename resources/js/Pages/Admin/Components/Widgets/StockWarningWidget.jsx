import React from 'react';
import { AlertCircle, Package, ArrowRight } from 'lucide-react';

const StockWarningWidget = ({ products, onNavigate }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-[0_25px_30px_-5px_rgba(15,23,42,0.12)]">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-red-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Peringatan Stok</h3>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Stok Menipis (≤ 5)</p>
          </div>
        </div>
        <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg">
          {products.length} Produk
        </span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[400px] p-4 space-y-3 custom-scrollbar">

        {products.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 grayscale opacity-50">
            <Package size={40} className="mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-400">Semua stok aman</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="group flex items-center gap-4 p-3 rounded-2xl border border-slate-50 hover:border-red-100 hover:bg-red-50/30 transition-all"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Package size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-red-700 transition-colors">
                  {product.name}
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${product.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                    Sisa: {product.stock}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {products.length > 0 && (
        <div className="p-4 border-t border-slate-50">
          <button
            onClick={onNavigate}
            className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
          >
            Update Stok <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(StockWarningWidget);
