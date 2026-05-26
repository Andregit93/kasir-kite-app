import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { formatCurrency } from '../../../../utils/formatters';

const SalesTrendChart = React.memo(({ data, loading }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isEmpty = !Array.isArray(data) || data.length === 0;

  // Custom tooltips inside useMemo or defined within the component for access to formatCurrency
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-100 shadow-xl min-w-[180px] animate-in fade-in zoom-in-95 duration-200">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1.5">
            Periode: {label}
          </p>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span className="text-[10px] font-bold text-slate-600">Total Uang Masuk</span>
            </div>
            <span className="text-[10px] font-black text-slate-800 tabular-nums">
              {formatCurrency(payload[0].value)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!isMounted) {
    return (
      <div className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] border border-blue-100/50 p-6 shadow-lg shadow-blue-500/10 flex flex-col h-full animate-pulse-elite">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 rounded-2xl bg-slate-200/60" />
           <div className="space-y-2">
             <div className="w-24 h-3 bg-slate-200/60 rounded" />
             <div className="w-16 h-2 bg-slate-100 rounded" />
           </div>
        </div>
        <div className="flex-1 w-full bg-slate-50/50 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] border border-blue-100/50 p-6 shadow-lg shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1.5 group flex flex-col h-full font-manrope">
      {/* HEADER: Always Static */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3 border-2 border-white shadow-md shadow-blue-200/50 bg-blue-600 text-white">
            <TrendingUp size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight leading-none mb-1.5">Tren Penjualan</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-80 flex items-center gap-1.5">
              Statistik Real-time
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 w-full relative z-10 min-h-[250px]">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-200/40 rounded-2xl animate-pulse-elite">
            <Activity size={32} className="mb-2 animate-spin-slow opacity-30" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Menghitung Data...</p>
          </div>
        ) : isEmpty ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/30 rounded-2xl group/empty transition-all">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-4 shadow-sm group-hover/empty:scale-110 group-hover/empty:rotate-6 transition-all">
               <TrendingUp size={32} className="text-slate-200" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
              Belum Ada Grafik Tren<br />
              <span className="text-[8px] opacity-60">Tidak ada transaksi di periode ini</span>
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '800' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={50}
                tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '800' }}
                tickFormatter={(v) => `Rp${v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : (v / 1000).toFixed(0) + 'k'}`}
              />

              <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4' }} />

              <Area
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});

export default SalesTrendChart;
