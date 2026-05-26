import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHistory, faSearch, faShoppingCart, faClipboardList,
    faSignOutAlt, faUser, faExclamationCircle, faFileInvoiceDollar,
    faChartLine, faCalendarCheck, faCheckCircle, faPrint, faTrash,
    faArrowUp, faArrowDown, faBoxOpen, faPlus, faChevronLeft, faChevronRight, faAngleDown, faEye,
    faMoneyBill, faExclamationTriangle, faEyeSlash, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import PosLayout from '@/Layouts/PosLayout';
import Receipt from '@/Components/Receipt';
import { printReceipt } from '@/utils/receiptPrinter';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { useToast } from '@/Contexts/ToastContext';
import { ConfirmDialog as SharedConfirmDialog } from '@/Components/Toast';

export default function History({ transactions: serverTransactionsResponse, filter, store }) {
    // ── DATA ALIGNMENT ──
    const transactions = serverTransactionsResponse.data || [];

    const { auth, supabaseToken } = usePage().props;
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTrx, setSelectedTrx] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showVoidConfirm, setShowVoidConfirm] = useState(false);
    const [showVoided, setShowVoided] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const realtimeDebounceRef = useRef(null);

    const voidForm = useForm({});

    // Filtering
    const filteredItems = useMemo(() => {
        let items = !searchQuery ? [...transactions] : transactions.filter(t =>
            t.display_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.cashier.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.items_summary && t.items_summary.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        // Option A: Hide voided items by default
        if (!showVoided) {
            items = items.filter(t => !t.is_voided);
        }

        return items;
    }, [transactions, searchQuery, showVoided]);

    // Sorting
    const sortedItems = useMemo(() => {
        const items = [...filteredItems];
        if (!sortConfig.key) return items;

        items.sort((a, b) => {
            let valA = a[sortConfig.key] ?? '';
            let valB = b[sortConfig.key] ?? '';
            let comparison = 0;

            if (typeof valA === 'string' && typeof valB === 'string') {
                comparison = valA.localeCompare(valB, 'id', { numeric: true, sensitivity: 'base' });
            } else {
                if (valA < valB) comparison = -1;
                else if (valA > valB) comparison = 1;
            }

            if (comparison === 0 && sortConfig.key !== 'id') {
                comparison = a.id.localeCompare(b.id, 'id', { numeric: true });
            }
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
        return items;
    }, [filteredItems, sortConfig]);

    // Pagination
    const totalPages = useMemo(() => {
        const count = sortedItems.length;
        if (itemsPerPage === 'all' || count === 0) return 1;
        return Math.ceil(count / itemsPerPage);
    }, [sortedItems, itemsPerPage]);

    const paginatedTransactions = useMemo(() => {
        if (itemsPerPage === 'all') return sortedItems;
        const start = (currentPage - 1) * itemsPerPage;
        return sortedItems.slice(start, start + itemsPerPage);
    }, [sortedItems, currentPage, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchQuery, itemsPerPage, sortConfig.key, sortConfig.direction]);

    // Stats
    const totalRevenueDisplay = useMemo(() => {
        const total = transactions
            .filter(t => !t.is_voided)
            .reduce((sum, t) => sum + t.total, 0);
        return 'Rp ' + total.toLocaleString('id-ID');
    }, [transactions]);

    const totalTrxCount = useMemo(() => 
        transactions.filter(t => !t.is_voided).length
    , [transactions]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const SortIndicator = ({ columnKey }) => {
        const isActive = sortConfig.key === columnKey;
        return (
            <FontAwesomeIcon
                icon={isActive && sortConfig.direction === 'asc' ? faArrowUp : faArrowDown}
                className={`ml-2 transition-all ${isActive ? 'text-brand scale-110' : 'text-brand/30'}`}
                size="xs"
            />
        );
    };

    const handleViewDetail = (trx) => {
        setSelectedTrx(trx);
        setShowDetailModal(true);
    };

    const receiptRef = useRef();

    const handlePrint = () => {
        printReceipt(receiptRef.current, `Struk ${selectedTrx?.display_id || 'KASIRKITE'}`);
    };

    const handleVoid = (trx) => {
        setSelectedTrx(trx);
        setShowVoidConfirm(true);
    };

    const triggerHistoryRefresh = useCallback(() => {
        if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current);
        realtimeDebounceRef.current = setTimeout(() => {
            router.reload({ only: ['transactions'], preserveScroll: true });
        }, 100);
    }, []);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current);
        };
    }, []);

    useSupabaseRealtime(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        supabaseToken,
        auth.user?.tenant_id,
        {
            table: 'transactions',
            event: '*',
            onPayload: triggerHistoryRefresh
        }
    );

    const confirmVoid = () => {
        if (!selectedTrx) return;
        voidForm.post(`/pos/transactions/${selectedTrx.id}/void`, {
            preserveScroll: true,
            onStart: () => {}, // Handled by voidForm.processing
            onSuccess: () => {
                setShowVoidConfirm(false);
                setShowDetailModal(false);
            },
            onError: (err) => {
                setShowVoidConfirm(false);
                showToast(Object.values(err)[0] || 'Gagal membatalkan transaksi', 'error');
            }
        });
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        if (!date) return;
        setSelectedDate(date);
        router.get('/pos/transactions', {
            filter: 'custom',
            start_date: date,
            end_date: date
        }, { preserveState: true });
    };

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return null;
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    return (
        <PosLayout
            title="Riwayat"
            searchProps={{
                searchQuery,
                setSearchQuery,
                placeholder: "Cari nomor struk atau nama kasir..."
            }}
        >
            <main className="flex-1 flex flex-col bg-surface-base overflow-hidden">
                <div className="px-4 py-2 md:px-10 md:pt-4 md:pb-4 flex flex-col gap-4 md:gap-6 shrink-0">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                        <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/40 shadow-sm flex items-center justify-between group hover:border-brand/20 transition-all">
                            <div className="flex flex-col items-center md:items-start w-full md:w-auto">
                                <span className="text-[8px] md:text-[10px] font-manrope font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Total Pendapatan</span>
                                <h3 className="text-xl md:text-2xl font-manrope font-black text-on-surface tracking-tighter whitespace-nowrap">
                                    {totalRevenueDisplay}
                                </h3>
                            </div>
                            <div className="hidden md:flex w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                                <FontAwesomeIcon icon={faMoneyBill} size="base" />
                            </div>
                        </div>

                        <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/40 shadow-sm flex items-center justify-between group hover:border-brand/20 transition-all">
                            <div className="flex flex-col items-center md:items-start w-full md:w-auto">
                                <span className="text-[8px] md:text-[10px] font-manrope font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Total Transaksi</span>
                                <h3 className="text-xl md:text-2xl font-manrope font-black text-on-surface tracking-tighter">
                                    {totalTrxCount} <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase ml-1">Struk</span>
                                </h3>
                            </div>
                            <div className="hidden md:flex w-12 h-12 bg-brand/5 text-brand rounded-xl items-center justify-center group-hover:bg-brand group-hover:text-white transition-all shadow-sm">
                                <FontAwesomeIcon icon={faClipboardList} size="base" />
                            </div>
                        </div>

                        <div className="hidden lg:flex bg-white p-6 rounded-3xl border border-white/40 shadow-sm items-center justify-between group hover:border-brand/20 transition-all">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-manrope font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Status Server</span>
                                <h3 className="text-2xl font-manrope font-black text-emerald-500 tracking-tighter">Terhubung</h3>
                            </div>
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                                <FontAwesomeIcon icon={faCheckCircle} size="base" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="hidden md:flex gap-2 bg-white/60 backdrop-blur-md p-1 rounded-2xl border border-white/40 shadow-sm">
                            {[
                                { id: 'daily', label: 'Hari Ini' },
                                { id: 'monthly', label: 'Bulan' },
                                { id: 'yearly', label: 'Tahun' }
                            ].map(f => (
                                <Link
                                    key={f.id}
                                    href={`/pos/transactions?filter=${f.id}`}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-manrope font-black uppercase tracking-widest transition-all ${filter === f.id ? 'bg-white text-brand shadow-md border border-slate-100' : 'text-slate-500 hover:text-on-surface'}`}
                                >
                                    {f.label}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 shadow-sm w-full md:w-fit">
                            <div className="md:hidden flex items-center px-3 border-r border-slate-200 relative min-w-[90px]">
                                <select
                                    value={filter}
                                    onChange={(e) => router.get(`/pos/transactions?filter=${e.target.value}`)}
                                    className="bg-transparent border-none focus:ring-0 text-[10px] font-black font-manrope text-brand p-0 pr-5 w-full appearance-none cursor-pointer"
                                >
                                    <option value="daily">Hari Ini</option>
                                    <option value="monthly">Bulan</option>
                                    <option value="yearly">Tahun</option>
                                </select>
                                <FontAwesomeIcon
                                    icon={faAngleDown}
                                    className="absolute right-3 text-[10px] text-brand/60 pointer-events-none"
                                />
                            </div>

                            <div className="flex items-center ml-2 md:ml-0 px-3 md:px-5 border-r border-slate-200 relative min-w-[70px]">
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => { setItemsPerPage(e.target.value === 'all' ? 'all' : parseInt(e.target.value)); setCurrentPage(1); }}
                                    className="bg-transparent border-none focus:ring-0 text-[10px] font-black font-manrope text-brand p-0 pr-5 w-full appearance-none cursor-pointer"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value="all">Semua</option>
                                </select>
                                <FontAwesomeIcon
                                    icon={faAngleDown}
                                    className="absolute right-3 text-[10px] text-brand/60 pointer-events-none"
                                />
                            </div>

                            <div className="flex items-center gap-1 md:gap-2 px-2">
                                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentPage === 1 ? 'text-slate-300' : 'text-slate-500 hover:bg-white active:scale-90'}`}><FontAwesomeIcon icon={faChevronLeft} size="xs" /></button>
                                <span className="text-[10px] font-manrope font-black text-on-surface tabular-nums">{currentPage} <span className="text-slate-300 px-1">/</span> {totalPages || 1}</span>
                                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0} className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentPage === totalPages || totalPages === 0 ? 'text-slate-300' : 'text-slate-500 hover:bg-white active:scale-90'}`}><FontAwesomeIcon icon={faChevronRight} size="xs" /></button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 md:px-10 pb-10 custom-scrollbar">
                    {/* Floating Controls: Always Visible */}
                    <div className="flex items-center gap-3 mb-6">
                        <button 
                            onClick={() => setShowVoided(!showVoided)}
                            className={`px-4 py-2.5 rounded-2xl text-[10px] font-manrope font-black uppercase tracking-widest transition-all flex items-center gap-2 border shadow-sm ${
                                showVoided 
                                ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' 
                                : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                            }`}
                        >
                            <FontAwesomeIcon icon={showVoided ? faEyeSlash : faEye} className={showVoided ? 'text-amber-500' : 'text-slate-300'} />
                            {showVoided ? 'Sembunyikan Batal' : 'Tampilkan Batal'}
                        </button>
                        
                        <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-3 py-0.5 shadow-sm">
                            <FontAwesomeIcon icon={faCalendarCheck} className="text-[10px] text-brand/50 shrink-0" />
                            <span className="text-[10px] font-manrope font-black text-slate-500 uppercase tracking-widest hidden md:inline whitespace-nowrap">Cari Tanggal:</span>
                            <div className="relative">
                                <input
                                    id="history-date-picker"
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    className="bg-transparent border-none text-slate-700 text-xs focus:ring-0 font-manrope font-bold py-2 px-0 w-[130px] h-9 cursor-pointer"
                                />
                            </div>
                            {selectedDate && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setSelectedDate(''); router.get('/pos/transactions', { filter: 'daily' }, { preserveState: true }); }}
                                    className="text-[8px] text-slate-400 hover:text-red-500 font-black uppercase tracking-widest transition-colors shrink-0"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>

                    {paginatedTransactions.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 bg-white/40 border-2 border-dashed border-white/60 rounded-[3rem]">
                            <FontAwesomeIcon icon={faBoxOpen} size="2x" className="text-slate-300 mb-4" />
                            <h4 className="font-manrope font-bold text-slate-500 uppercase tracking-widest text-[10px]">Data transaksi tidak ditemukan</h4>
                        </div>
                    ) : (
                        <>
                            <div className="hidden lg:block bg-white rounded-3xl border border-white/40 shadow-sm overflow-hidden">
                                <table className="w-full text-center border-collapse">
                                    <thead className="bg-white border-b border-slate-50">
                                        <tr className="text-[10px] font-manrope font-black text-slate-500 uppercase tracking-[0.15em]">
                                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('display_id')}>No. Transaksi <SortIndicator columnKey="display_id" /></th>
                                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('created_at')}>Waktu <SortIndicator columnKey="created_at" /></th>
                                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('cashier')}>Kasir <SortIndicator columnKey="cashier" /></th>
                                            <th className="px-6 py-4">Pembayaran</th>
                                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('total')}>Nominal <SortIndicator columnKey="total" /></th>
                                            <th className="px-6 py-4">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 bg-white">
                                        {paginatedTransactions.map((trx) => (
                                            <tr key={trx.id} className="hover:bg-slate-50/50 transition-all group/row font-manrope">
                                                <td className="px-6 py-3 font-black text-[13px] text-brand">{trx.display_id}</td>
                                                <td className="px-6 py-3 text-[11px] font-bold text-slate-400">{trx.date}</td>
                                                <td className="px-6 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">{trx.cashier}</td>
                                                <td className="px-6 py-3"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${trx.paymentMethod === 'cash' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-brand/5 text-brand border-brand/10'}`}>{trx.paymentMethod}</span></td>
                                                <td className="px-6 py-3 font-black text-on-surface text-[15px] tracking-tighter">
                                                    <div className="flex flex-col items-center">
                                                        <span className={trx.is_voided ? 'line-through text-slate-400 opacity-50' : ''}>{trx.total_formatted}</span>
                                                        {trx.is_voided && <span className="text-[8px] text-red-500 font-manrope font-black tracking-widest uppercase mt-0.5">DIBATALKAN</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => handleViewDetail(trx)} className="px-4 py-2 bg-slate-50 text-slate-500 group-hover/row:bg-brand group-hover/row:text-white rounded-xl text-[9px] font-manrope font-black uppercase tracking-widest transition-all border border-slate-100">
                                                            Struk
                                                        </button>
                                                        {!trx.is_voided && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleVoid(trx); }} 
                                                                className="px-4 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[9px] font-manrope font-black uppercase tracking-widest transition-all border border-red-100"
                                                            >
                                                                Batal
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-2">
                                {paginatedTransactions.map((trx) => (
                                    <div key={trx.id} className="bg-white p-4 rounded-[1.75rem] border border-white/40 shadow-sm flex flex-col active:scale-[0.98] transition-all">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <span className="font-manrope font-black text-brand tracking-tight text-[13px] mb-0.5 block truncate underline decoration-brand/20 underline-offset-4">{trx.display_id}</span>
                                                <div className="flex items-center gap-2 md:gap-2 underline-none">
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{trx.date}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase truncate"> • {trx.cashier}</span>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${trx.paymentMethod === 'cash' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand/5 text-brand'}`}>{trx.paymentMethod}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-slate-50/50 pt-2">
                                            <span className="text-base font-manrope font-black text-on-surface tracking-tighter tabular-nums">{trx.total_formatted}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleViewDetail(trx)} className="px-3 py-2 bg-slate-50 text-brand text-[9px] font-manrope font-black rounded-xl transition-all uppercase tracking-widest border border-slate-100"><FontAwesomeIcon icon={faEye} /></button>
                                                {!trx.is_voided && (
                                                    <button onClick={() => handleVoid(trx)} className="px-3 py-2 bg-red-50 text-red-500 text-[9px] font-manrope font-black rounded-xl transition-all uppercase tracking-widest border border-red-100"><FontAwesomeIcon icon={faTrash} /></button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {showDetailModal && selectedTrx && (
                    <div className="fixed inset-0 bg-on-surface/60 backdrop-blur-md flex items-center justify-center z-[400] p-4 animate-in fade-in duration-300 font-manrope">
                        <div className="bg-slate-100 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3),0_0_40px_rgba(16,185,129,0.1)] w-full max-w-sm max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 border border-white/20 text-left">
                            <div className="pt-6 pb-2 flex flex-col items-center justify-center relative">
                                {/* Success Icon with Ripple (Sync with Cashier) */}
                                <div className="relative mb-2 mt-2">
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping duration-[2000ms]" />
                                    <div className="relative w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 z-10">
                                        <FontAwesomeIcon icon={faCheckCircle} size="lg" />
                                    </div>
                                </div>
                                <h2 className="text-lg font-manrope font-black text-on-surface tracking-tight">Detail Transaksi</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col items-center custom-scrollbar">
                                <div className="w-full bg-white shadow-sm rounded-xl border border-[#e5e7eb]">
                                    <Receipt
                                        ref={receiptRef}
                                        data={{
                                            storeName: store?.name,
                                            storeAddress: store?.address,
                                            storePhone: store?.phone,
                                            transactionId: selectedTrx.display_id,
                                            date: selectedTrx.date,
                                            cashierName: selectedTrx.cashier,
                                            items: selectedTrx.items_list || [],
                                            subtotal: selectedTrx.subtotal || selectedTrx.total,
                                            taxRate: selectedTrx.tax_percentage || 0,
                                            taxAmount: selectedTrx.tax_amount || 0,
                                            total: selectedTrx.total,
                                            paymentMethod: selectedTrx.paymentMethod,
                                            cash: selectedTrx.total,
                                            change: 0
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="p-6 bg-white flex flex-col gap-3 border-t border-slate-100 w-full">
                                <button onClick={handlePrint} className="w-full py-4 bg-emerald-500 text-white font-manrope font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest hover:bg-emerald-600"><FontAwesomeIcon icon={faPrint} /> CETAK STRUK</button>
                                
                                {!selectedTrx.is_voided && (
                                    <button 
                                        onClick={() => handleVoid(selectedTrx)} 
                                        className="w-full py-3.5 bg-red-50 text-red-500 font-manrope font-black rounded-xl transition-all hover:bg-red-500 hover:text-white text-[10px] uppercase tracking-[0.3em] border border-red-100"
                                    >
                                        BATALKAN TRANSAKSI
                                    </button>
                                )}

                                <button onClick={() => setShowDetailModal(false)} className="w-full py-3.5 bg-white border border-slate-200 text-slate-500 font-manrope font-black rounded-xl transition-all hover:bg-slate-50 text-[10px] uppercase tracking-[0.3em]">TUTUP</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL KONFIRMASI BATAL (SYNCED) */}
                <SharedConfirmDialog
                    isOpen={showVoidConfirm}
                    title="Konfirmasi Pembatalan"
                    text={`Apakah Anda yakin ingin membatalkan transaksi ${selectedTrx?.display_id}? Stok produk akan otomatis dikembalikan ke inventori.`}
                    confirmLabel="Ya, Batalkan"
                    processingLabel=""
                    isProcessing={voidForm.processing}
                    onConfirm={confirmVoid}
                    onClose={() => !voidForm.processing && setShowVoidConfirm(false)}
                />
            </main>
        </PosLayout>
    );
}
