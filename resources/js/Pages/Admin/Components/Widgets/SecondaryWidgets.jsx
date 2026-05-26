import React from 'react';
import { Clock, Trophy, Users2, Package, Box, TrendingUp, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const PeakHoursChart = React.memo(({ data }) => (
  <div className="h-full w-full min-h-[300px]">
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="hour" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '700' }} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '700' }}
        />
        <RechartsTooltip 
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }} 
          labelStyle={{ color: '#64748b' }}
        />
        <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} animationDuration={1000} />
      </BarChart>
    </ResponsiveContainer>
  </div>
));

export const PeakHoursWidget = React.memo(({ data }) => {
  const maxVolume = data && data.length > 0 ? Math.max(...data.map(d => d.volume)) : 1;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08)] p-10 transition-all hover:shadow-[0_25px_30px_-5px_rgba(15,23,42,0.12)] flex flex-col h-full">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
          <Clock size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Jam Sibuk</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Top 5 Lonjakan Transaksi</p>
        </div>
      </div>

      <div className="flex-1 space-y-8">
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-700 tracking-tight">{item.hour} - {(parseInt(item.hour) + 1).toString().padStart(2, '0')}:00</span>
                <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-sm">{item.volume} Trx</span>
              </div>
              <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <div 
                  className="h-full bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.3)] transition-all duration-1000"
                  style={{ width: `${(item.volume / maxVolume) * 100}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10 opacity-50">
            <Clock size={48} className="mb-4" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Belum ada data</p>
          </div>
        )}
      </div>

      <div className="mt-10 p-5 bg-blue-50 rounded-[1.5rem] border border-blue-100/50 flex items-start gap-4">
        <TrendingUp size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[11px] font-bold text-blue-800 leading-relaxed italic opacity-80 uppercase tracking-tight">
          Optimalkan shift staf pada jam-jam puncak untuk meningkatkan efisiensi layanan.
        </p>
      </div>
    </div>
  );
});


export const TopProductsWidget = React.memo(({ products, onNavigate, formatCurrency }) => (
  <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08)] p-8 lg:p-10 transition-all hover:shadow-[0_25px_30px_-5px_rgba(15,23,42,0.12)] flex flex-col">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex items-center justify-center text-amber-500 shadow-sm">
        <Trophy size={20} />
      </div>
      <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Produk Terlaris</h3>
    </div>
    
    <div className="flex-1 space-y-5 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">

      {products?.length > 0 ? (
        products.slice(0, 5).map((p, i) => (
          <div key={p.id} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-3 rounded-2xl transition-all border border-transparent hover:border-slate-100">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200/60 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={24} className="text-slate-300" />
                )}
              </div>
              <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-md ${
                i === 0 ? 'bg-amber-400 text-white' : 
                i === 1 ? 'bg-slate-300 text-white' : 
                i === 2 ? 'bg-blue-300 text-white' : 'bg-slate-50 text-slate-500'
              }`}>
                {i + 1}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{p.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black text-blue-600 uppercase tabular-nums">{p.total_sold} Unit</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-[10px] font-bold text-slate-400 tabular-nums">{formatCurrency(p.total_revenue)}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-slate-600 py-10 opacity-30">
          <Box className="mb-4" size={64} />
          <p className="text-sm font-black uppercase tracking-widest">Belum ada data</p>
        </div>
      )}
    </div>
    
    <button onClick={onNavigate} className="mt-8 w-full py-4 bg-slate-50/50 hover:bg-slate-100 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-slate-200/50">
      Gudang Inventori <ChevronRight size={14} />
    </button>
  </div>
));

export const CashierLeaderboardWidget = React.memo(({ performance }) => (
  <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08)] p-8 lg:p-10 transition-all hover:shadow-[0_25px_30px_-5px_rgba(15,23,42,0.12)] flex flex-col">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex items-center justify-center text-emerald-600 shadow-sm">
        <Users2 size={20} />
      </div>
      <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Performa Kasir</h3>
    </div>
    
    <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">

      {performance?.length > 0 ? (
        performance.map((c, i) => (
          <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-200/30 group hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/50 flex items-center justify-center font-black text-sm text-slate-500 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">{i + 1}</div>
              <div>
                <p className="text-sm font-black text-slate-900">{c.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{c.total_transactions} Trx</span>
                  <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Aktif</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-slate-900 leading-none">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(c.total_sales)}
              </p>
              <p className="text-[9px] font-bold text-slate-600 uppercase mt-1">Total Sales</p>
            </div>
          </div>
        ))
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-slate-600 py-10 opacity-30">
          <Users2 className="mb-4" size={64} />
          <p className="text-sm font-black uppercase tracking-widest">Belum ada aktivitas</p>
        </div>
      )}
    </div>
    
    <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
       <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white"><TrendingUp size={16} /></div>
       <p className="text-[10px] font-bold text-blue-800 leading-tight">Sistem sedang memantau produktivitas tim secara real-time.</p>
    </div>
  </div>
));
