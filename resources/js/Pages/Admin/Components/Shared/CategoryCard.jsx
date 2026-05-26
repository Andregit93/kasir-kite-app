import React from 'react';
import { Tag, Package, Edit3, Trash2 } from 'lucide-react';

/**
 * CategoryCard Component
 * 
 * Individual category item card with memoization to prevent unnecessary re-renders
 * in large lists. Part of SRP refactoring to keep CategoryTab clean.
 */
const CategoryCard = React.memo(({ category, index, onEdit, onDelete }) => {
  const hex = category.color || '#3b82f6';
  const pCount = Number(category.products_count || 0);

  return (
    <div
      className="relative bg-white/95 backdrop-blur-2xl rounded-[1.5rem] lg:rounded-[2rem] border border-slate-200/40 p-4 sm:p-5 shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden flex flex-col h-full"
      style={{
        animationDelay: `${index * 50}ms`,
        '--aura-color': `${hex}25`,
        '--aura-intensity': `${hex}45`,
        boxShadow: `0 15px 35px -12px var(--aura-color)`
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 25px 50px -15px var(--aura-intensity)`}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = `0 15px 35px -12px var(--aura-color)`}
    >
      <div
        className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none"
        style={{ background: `radial-gradient(circle at bottom right, ${hex}, transparent 70%)` }}
      />

      <div
        style={{ backgroundColor: hex }}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] group-hover:scale-150 transition-transform duration-500"
      />

      <div className="relative z-10 flex-1 flex flex-col font-manrope">
        <div className="flex items-center gap-3 sm:gap-3.5 mb-2 sm:mb-3">
          <div
            style={{ backgroundColor: hex, boxShadow: `0 8px 20px -6px ${hex}` }}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border-2 border-white/50 text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg"
          >
            <Tag size={18} strokeWidth={2.5} className="sm:w-[20px] sm:h-[20px]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="min-h-[2.5rem] flex flex-col justify-center">
              <h4 className="text-sm sm:text-base lg:text-lg font-black text-slate-800 line-clamp-2 tracking-tight leading-loose group-hover:text-black transition-colors" title={category.name}>
                {category.name}
              </h4>
            </div>
            <div className="flex items-center gap-1 mt-1 sm:mt-1.5">
              <span
                style={{ backgroundColor: hex + '15', color: hex }}
                className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 border border-white"
              >
                <Package size={10} />
                {pCount} Produk
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 mt-auto pt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(category); }}
            className="flex-1 py-2 sm:py-3 bg-white hover:bg-slate-900 border border-slate-100 hover:text-white rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95"
          >
            <Edit3 size={11} className="sm:w-[12px] sm:h-[12px]" /> EDIT
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(category); }}
            className="w-10 h-9 sm:w-12 sm:h-11 bg-white hover:bg-red-500 border border-slate-100 text-slate-400 hover:text-white rounded-xl transition-all flex items-center justify-center shadow-sm active:scale-95"
          >
            <Trash2 size={14} className="sm:w-[16px] sm:h-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;
