import React from 'react';
import { ChevronRight, Clock, Wallet, CreditCard, Banknote } from 'lucide-react';

const RecentTransactions = React.memo(({ transactions, formatCurrency, onSeeAll }) => {
  const getPaymentIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash': return <Banknote size={14} className="text-emerald-600" />;
      case 'qris': return <CreditCard size={14} className="text-blue-600" />;
      case 'transfer': return <Wallet size={14} className="text-indigo-600" />;
      default: return <Wallet size={14} className="text-slate-400" />;
    }
  };

  const getPaymentLabel = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash': return 'Tunai';
      case 'qris': return 'QRIS';
      case 'transfer': return 'Transfer';
      default: return method;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08)] overflow-hidden transition-all duration-300 hover:shadow-[0_25px_30px_-5px_rgba(15,23,42,0.12)]">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Transaksi Terkini</h3>
          <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest opacity-80">
            Real-time Activity Log
          </p>
        </div>
        <button 
          onClick={onSeeAll} 
          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-50 hover:border-blue-100 transition-all active:scale-95 shadow-sm"
        >
          Lihat Semua <ChevronRight size={14} />
        </button>
      </div>
      
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kasir</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Metode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions?.length > 0 ? (
              transactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                        <Clock size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 tabular-nums">{trx.time}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[8px] font-black text-blue-600 uppercase border border-blue-100 shadow-sm">
                        {trx.cashier?.substring(0, 1)}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{trx.cashier}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-sm font-black text-slate-900 tabular-nums">
                      {formatCurrency(trx.amount)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        {getPaymentIcon(trx.paymentMethod)}
                      </div>
                      <span>{getPaymentLabel(trx.paymentMethod)}</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-8 py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">
                  Belum ada transaksi hari ini
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default RecentTransactions;
