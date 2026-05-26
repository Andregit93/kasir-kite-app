import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { 
  Tag, Ghost, HeartPulse, Activity, Package, AlertCircle, 
  TrendingUp, TrendingDown, ArrowRight, Box
} from 'lucide-react';

export const CategoryPerformanceWidget = React.memo(({ data, formatCurrency }) => {
  const chartData = data?.map(item => ({
    name: item.name,
    value: parseFloat(item.revenue),
    quantity: item.quantity,
    color: item.color || '#3b82f6'
  })) || [];

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08)] p-8 lg:p-10 transition-all hover:shadow-[0_25px_30px_-5px_rgba(15,23,42,0.12)] flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
          <Tag size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Performa Kategori</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Kontribusi Pendapatan</p>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: '800' }}
              width={80}
            />
            <RechartsTooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
              formatter={(value) => formatCurrency(value)}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {chartData.slice(0, 4).map((item, i) => (
          <div key={i} className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: item.color }}></div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase truncate">{item.name}</p>
              <p className="text-xs font-black text-slate-900">{item.quantity} Unit</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export const DeadStockWidget = React.memo(({ products, onNavigate }) => (
  <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08)] p-8 lg:p-10 transition-all hover:shadow-[0_25px_30px_-5px_rgba(15,23,42,0.12)] flex flex-col h-full overflow-hidden">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
        <Ghost size={20} />
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Produk Mati</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">30 Hari Tanpa Penjualan</p>
      </div>
    </div>

    <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">

      {products?.length > 0 ? (
        products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 group p-3 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all">
            <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 grayscale">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover opacity-60" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Package size={20} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-800 truncate">{p.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Stok Tersisa: {p.stock}</p>
            </div>
            <div className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-black rounded-lg border border-red-100">
              STAGNANT
            </div>
          </div>
        ))
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10 opacity-50">
          <Activity size={48} className="mb-4" />
          <p className="text-xs font-black uppercase tracking-[0.2em]">Semua Produk Aktif Terjual</p>
        </div>
      )}
    </div>

    <button onClick={onNavigate} className="mt-8 w-full py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest transition-all border border-slate-100 flex items-center justify-center gap-2">
      Promosikan Produk <TrendingDown size={14} />
    </button>
  </div>
));

export const InventoryHealthWidget = React.memo(({ stats }) => {
  const isHealthy = stats?.healthPercentage > 80;
  
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08)] p-8 lg:p-10 transition-all hover:shadow-[0_25px_30px_-5px_rgba(15,23,42,0.12)] flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className={`w-10 h-10 ${isHealthy ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'} rounded-2xl border flex items-center justify-center shadow-sm`}>
          <HeartPulse size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Kesehatan Inventori</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ketersediaan Barang</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums">
            {Math.round(stats?.healthPercentage || 0)}%
          </span>
          <span className={`text-xs font-black uppercase ${isHealthy ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isHealthy ? 'Excellent' : 'Needs Restock'}
          </span>
        </div>
        
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-8 border border-slate-50 shadow-inner">
          <div 
            className={`h-full transition-all duration-1000 ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'} shadow-[0_0_10px_rgba(16,185,129,0.3)]`}
            style={{ width: `${stats?.healthPercentage || 0}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-slate-900">{stats?.total || 0}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
          </div>
          <div className="text-center border-x border-slate-100">
            <p className="text-2xl font-black text-emerald-600">{stats?.inStock || 0}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Redi</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-red-500">{stats?.outOfStock || 0}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Kosong</p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
        <AlertCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic uppercase opacity-80">
          Statistik mencakup {stats?.unlimited || 0} produk dengan stok tidak terbatas.
        </p>
      </div>
    </div>
  );
});
