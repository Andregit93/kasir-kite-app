import React from 'react';
import { Banknote, Receipt, ShoppingCart, Calculator, TrendingUp, TrendingDown } from 'lucide-react';

export const NavItem = React.memo(({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 font-bold text-xs relative group overflow-hidden ${active
      ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
  >
    <span className={`transition-all duration-500 ${active ? 'scale-110 translate-x-1' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`}>{icon}</span>
    <span className="relative z-10 tracking-tight whitespace-nowrap">{label}</span>
    {active && (
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
    )}
  </button>
));

export const StatCard = React.memo(({ icon, label, value, trend, trendValue, color, filter, isLoading }) => {
  const isHealthMode = label.toLowerCase().includes('stok');

  // Evaluation Logic
  let status = 'neutral'; // 'positive', 'negative', 'neutral'
  if (isHealthMode) {
    status = trendValue > 80 ? 'positive' : 'negative';
  } else {
    if (trendValue > 0) status = 'positive';
    else if (trendValue < 0) status = 'negative';
    else status = 'neutral';
  }

  const statusConfig = {
    positive: { color: 'text-emerald-500', bg: 'bg-emerald-400', label: isHealthMode ? 'Katalog Aman' : 'Performa Baik', icon: isHealthMode ? '✓ ' : '↑' },
    negative: { color: 'text-rose-500', bg: 'bg-rose-400', label: isHealthMode ? 'Stok Menipis' : 'Butuh Evaluasi', icon: isHealthMode ? '⚠ ' : '↓' },
    neutral: { color: 'text-slate-400', bg: 'bg-slate-300', label: 'Stabil', icon: '•' },
  };

  const s = statusConfig[status];

  const getFilterText = (f) => {
    if (isHealthMode) return 'ketersediaan.';
    if (f === 'daily') return 'kemarin.';
    if (f === 'monthly') return 'bulan lalu.';
    if (f === 'yearly') return 'tahun lalu.';
    return 'periode lalu.';
  };

  const theme = {
    blue: {
      text: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
      border: 'border-blue-100/50',
      glow: 'shadow-blue-500/10',
      spark: 'stroke-blue-500',
      pill: 'bg-blue-600 text-white'
    },
    emerald: {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      border: 'border-emerald-100/50',
      glow: 'shadow-emerald-500/10',
      spark: 'stroke-emerald-500',
      pill: 'bg-emerald-600 text-white'
    },
    indigo: {
      text: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
      border: 'border-indigo-100/50',
      glow: 'shadow-indigo-500/10',
      spark: 'stroke-indigo-500',
      pill: 'bg-indigo-600 text-white'
    },
    amber: {
      text: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
      border: 'border-amber-100/50',
      glow: 'shadow-amber-500/10',
      spark: 'stroke-amber-500',
      pill: 'bg-amber-600 text-white'
    },
  };

  const t = theme[color] || theme.blue;

  const getFontSize = (val) => {
    const vStr = val?.toString() || "";
    const len = vStr.length;
    if (len > 18) return 'text-xs lg:text-sm';
    if (len > 14) return 'text-sm lg:text-base';
    if (len > 10) return 'text-base lg:text-lg';
    return 'text-lg lg:text-2xl';
  };

  return (
    <div className={`relative bg-white/90 backdrop-blur-xl rounded-[1.5rem] lg:rounded-[2rem] border ${t.border} p-3 lg:p-5 shadow-lg ${t.glow} transition-all duration-500 hover:-translate-y-1.5 group overflow-hidden h-full flex flex-col justify-between`}>
      <div className="flex items-center justify-center lg:justify-start gap-2.5 lg:gap-3.5 relative z-10">
        <div className={`w-8 h-8 lg:w-11 lg:h-11 rounded-lg lg:rounded-xl flex items-center justify-center text-lg lg:text-xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 border-2 border-white shadow-sm shadow-slate-200/50 shrink-0 ${t.bg} ${t.text}`}>
          {React.cloneElement(icon, { size: 14 })}
        </div>
        <div className="min-w-0 lg:flex-1">
          <div className={`${t.pill} ${label.length > 16 ? 'text-[7px]' : label.length > 12 ? 'text-[8px]' : 'text-[9px]'} lg:text-[9px] font-black uppercase tracking-normal lg:tracking-[0.1em] px-1.5 lg:px-2 py-0.5 rounded-md shadow-sm mb-1 w-fit whitespace-nowrap`}>
            {label}
          </div>
          {isLoading ? (
            <div className="h-3 w-16 bg-slate-200/60 rounded animate-pulse-elite mb-1"></div>
          ) : trendValue !== undefined && (
            <div className={`flex items-center gap-1 font-bold text-[7px] lg:text-[9px] ${s.color}`}>
              <span className="bg-white px-1 py-0.5 rounded shadow-sm ring-1 ring-slate-100 whitespace-nowrap">{s.icon}{Math.abs(trendValue).toFixed(1)}%</span>
              <span className={`${(`dari ${getFilterText(filter)}`).length > 13 ? 'text-[6px] lg:text-[7px] tracking-tight' : 'text-[7px] lg:text-[8px] tracking-normal'} text-slate-400 font-medium whitespace-nowrap opacity-80 uppercase leading-none`}>
                dari {getFilterText(filter)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-2 mb-1 text-center lg:text-left">
        {isLoading ? (
          <div className="h-7 w-24 bg-slate-200/60 rounded-lg animate-pulse-elite mb-2 mx-auto lg:mx-0"></div>
        ) : (
          <h3 className={`${getFontSize(value)} font-black text-slate-800 tracking-tighter leading-none drop-shadow-sm truncate mb-0.5 transition-all duration-300`} title={value}>
            {value}
          </h3>
        )}

        <div className="mt-2 flex items-center justify-center lg:justify-start gap-2.5 pt-2">
          {isLoading ? (
            <div className="h-1 w-12 bg-slate-200/40 rounded-full animate-pulse-elite"></div>
          ) : (
            <>
              <div className={`h-1 rounded-full transition-all duration-700 ${s.bg} shadow-sm ${status === 'neutral' ? 'w-5' : 'w-10 group-hover:w-16'}`}></div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                {s.label}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export const FilterBtn = React.memo(({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.05em] transition-all duration-300 relative ${active
      ? 'bg-white text-blue-600 shadow-lg shadow-blue-600/10 scale-105 z-10'
      : 'text-slate-400 hover:text-slate-600'
      }`}
  >
    {label}
  </button>
));
