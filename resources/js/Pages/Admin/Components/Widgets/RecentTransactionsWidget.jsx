import React from 'react';
import { ChevronRight, Clock, Wallet, CreditCard, Banknote, ExternalLink, QrCode, Landmark, User } from 'lucide-react';
import { formatCurrency } from '../../../../utils/formatters';

const RecentTransactionsWidget = React.memo(({ transactions, onSeeAll }) => {
  const getPaymentBadge = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash':
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm"><Banknote size={10} /> Tunai</span>;
      case 'qris':
        return <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm"><QrCode size={10} /> QRIS</span>;
      case 'transfer':
        return <span className="bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm"><Landmark size={10} /> Transfer</span>;
      default:
        return <span className="bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-sm">{method}</span>;
    }
  };

  return (
    <div className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] border border-indigo-100/50 shadow-lg shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1.5 group flex flex-col h-full overflow-hidden font-manrope">
      {/* HEADER: Normalized Sizing */}
      <div className="flex items-center justify-between p-5 relative z-10 w-full">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3 border-2 border-white shadow-sm shadow-indigo-200/50 bg-indigo-600 text-white font-manrope">
            <Clock size={20} />
          </div>
          <div>
            <div className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-md shadow-sm mb-1 w-fit whitespace-nowrap">
              Riwayat Transaksi
            </div>
            <div className="flex items-center gap-1 font-bold text-[8px] text-slate-500 uppercase tracking-widest leading-tight opacity-70">
              Laporan 5 transaksi terakhir.
            </div>
          </div>
        </div>
        <button
          onClick={onSeeAll}
          className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-95 shadow-sm"
          title="Detail Laporan"
        >
          <ExternalLink size={14} />
        </button>
      </div>

      <div className="flex-1 px-5 relative z-10 min-h-[260px]">
        {/* MOBILE: Card Layout */}
        <div className="lg:hidden divide-y divide-slate-100">
          {transactions?.slice(0, 5).length > 0 ? (
            transactions.slice(0, 5).map((trx) => (
              <div key={trx.id} className="py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border border-white shadow-sm overflow-hidden bg-slate-100 shrink-0">
                  {trx.cashier_photo ? (
                    <img src={trx.cashier_photo} alt={trx.cashier} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User size={14} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-800 truncate">{trx.cashier}</span>
                    <span className="text-xs font-black text-slate-900 tabular-nums shrink-0">{formatCurrency(trx.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-bold text-slate-400 tabular-nums">{trx.time}</span>
                    {getPaymentBadge(trx.paymentMethod)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-slate-500 font-black uppercase tracking-[0.2em] text-[9px] italic opacity-40">
              Aktivitas Kosong
            </div>
          )}
        </div>

        {/* DESKTOP: Table Layout */}
        <div className="hidden lg:block overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[450px] text-left border-separate border-spacing-y-1.5 font-manrope">
            <thead>
              <tr>
                <th className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Waktu</th>
                <th className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Kasir</th>
                <th className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Nominal</th>
                <th className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Metode</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.slice(0, 5).length > 0 ? (
                transactions.slice(0, 5).map((trx) => (
                  <tr key={trx.id} className="group/row">
                    <td className="bg-slate-50 group-hover/row:bg-white rounded-l-xl px-3 py-1.5 transition-colors border-y border-l border-transparent group-hover/row:border-indigo-100 group-hover/row:shadow-md group-hover/row:shadow-indigo-500/5">
                      <span className="text-xs font-black text-slate-600 tabular-nums">{trx.time}</span>
                    </td>
                    <td className="bg-slate-50 group-hover/row:bg-white px-3 py-1.5 transition-colors border-y border-transparent group-hover/row:border-indigo-100 group-hover/row:shadow-md group-hover/row:shadow-indigo-500/5">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 rounded-full border border-white shadow-sm overflow-hidden bg-slate-200 shrink-0">
                          {trx.cashier_photo ? (
                            <img src={trx.cashier_photo} alt={trx.cashier} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <User size={10} />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-black text-slate-800 tracking-tight uppercase truncate max-w-[100px] block">{trx.cashier}</span>
                      </div>
                    </td>
                    <td className="bg-slate-50 group-hover/row:bg-white px-3 py-1.5 transition-colors border-y border-transparent group-hover/row:border-indigo-100 group-hover/row:shadow-md group-hover/row:shadow-indigo-500/5 text-center">
                      <span className="text-[11px] font-black text-slate-900 tabular-nums bg-white px-2 py-0.5 rounded border border-slate-100 group-hover/row:border-indigo-100 transition-colors">
                        {formatCurrency(trx.amount)}
                      </span>
                    </td>
                    <td className="bg-slate-50 group-hover/row:bg-white rounded-r-xl px-3 py-1.5 transition-colors border-y border-r border-transparent group-hover/row:border-indigo-100 group-hover/row:shadow-md group-hover/row:shadow-indigo-500/5 text-right">
                      <div className="flex justify-end">
                        {getPaymentBadge(trx.paymentMethod)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-slate-500 font-black uppercase tracking-[0.2em] text-[9px] italic opacity-40">
                    Aktivitas Kosong
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default RecentTransactionsWidget;
