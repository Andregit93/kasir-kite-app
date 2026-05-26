import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Wallet, Activity, Receipt } from 'lucide-react';

const PaymentMethodChart = ({ data, loading }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const COLORS = {
    'Tunai': '#10b981',    // Emerald-500
    'QRIS': '#3b82f6',     // Blue-600
    'Transfer': '#6366f1'  // Indigo-500
  };

  // Calculations
  const total = useMemo(() =>
    Array.isArray(data) ? data.reduce((sum, item) => sum + (item.value || 0), 0) : 0
    , [data]);

  const isEmpty = !Array.isArray(data) || data.length === 0;

  // Initial mount skeleton (Full card pulse)
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
    <div className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] border border-blue-100/50 p-6 shadow-lg shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1.5 group flex flex-col h-full overflow-hidden font-manrope">
      {/* HEADER: Platinum Styling (Always Static for Stability) */}
      <div className="flex items-center gap-3.5 relative z-10 mb-6 shrink-0">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 border-2 border-white shadow-md shadow-blue-200/50 bg-blue-600 text-white">
          <Wallet size={22} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-800 uppercase tracking-tight leading-none mb-1.5">Metode Pembayaran</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-80 flex items-center gap-1.5">
            Analisis kas masuk
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 relative z-10">
        {loading ? (
          /* CONTENT SKELETON: Only internal area pulses */
          <div className="flex-1 flex flex-col animate-pulse-elite">
            <div className="h-[200px] w-full bg-slate-200/40 rounded-full mb-8 mx-auto max-w-[180px] flex items-center justify-center">
              <div className="w-20 h-20 bg-white/40 rounded-full" />
            </div>
            <div className="space-y-3">
              <div className="w-full h-10 bg-slate-100 rounded-xl border border-slate-100" />
              <div className="w-full h-10 bg-slate-100 rounded-xl border border-slate-100" />
            </div>
          </div>
        ) : isEmpty ? (
          /* EMPTY STATE: Visual placeholder within the card */
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 group/empty">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover/empty:scale-110 group-hover/empty:rotate-6 transition-all shadow-inner">
              <Receipt size={32} className="text-slate-200" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 text-center leading-relaxed">
              Belum Ada Transaksi<br />
              <span className="text-[8px] opacity-70 italic font-bold">Data periode ini nihil</span>
            </p>
          </div>
        ) : (
          /* REAL CONTENT: Pie Chart & Legend */
          <>
            <div className="h-[210px] lg:h-[200px] w-full relative shrink-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={92}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94a3b8'} className="transition-all duration-500 hover:opacity-80 outline-none filter drop-shadow-md" />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', fontWeight: 'black', fontSize: '10px' }}
                    itemStyle={{ color: '#1e293b' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{total}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Struk</span>
              </div>
            </div>

            <div className="mt-auto space-y-2 pt-4">
              {data.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-white rounded-xl border border-slate-100/50 hover:border-blue-100 transition-all hover:shadow-lg hover:shadow-blue-500/5 group/legend cursor-default">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shadow-inner shrink-0 group-hover/legend:scale-110 transition-transform" style={{ backgroundColor: COLORS[entry.name] || '#94a3b8', boxShadow: `0 0 10px ${COLORS[entry.name]}40` }}></div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-wide truncate group-hover/legend:text-slate-900 transition-colors">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-black text-slate-800 tabular-nums bg-white px-2 py-0.5 rounded-md border border-slate-100 shadow-sm">{entry.value}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Struk</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(PaymentMethodChart);
