import React, { useState, useRef, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Banknote, Receipt, ShoppingCart, Calculator } from 'lucide-react';
import { StatCard, FilterBtn } from '../Shared/DashboardUI';
import { formatCurrency } from '../../../../utils/formatters';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReceiptDoc from '@/Components/Receipt';
import { printReceipt } from '@/utils/receiptPrinter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp, faArrowDown, faBoxOpen, faChevronLeft, faChevronRight,
  faAngleDown, faSearch, faFileExcel, faFilePdf, faCalendarAlt,
  faCheckCircle, faPrint, faEye
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/Contexts/ToastContext';

const ReportsTab = React.memo(({
  transactions: rawTransactions,
  transactionsSummary,
  initialStore,
  initialFilters,
}) => {
  const { showToast } = useToast();

  // Use paginated data from backend
  const transactions = rawTransactions?.data || [];
  const meta = rawTransactions?.meta || rawTransactions; // Inertia sometimes wraps paginator or returns directly

  const currentPage = meta?.current_page || 1;
  const lastPage = meta?.last_page || 1;

  // Total summary from backend calculation (ignores pagination)
  const totalTrxCount = transactionsSummary?.total_count || 0;
  const totalRevenueFormatted = transactionsSummary?.revenue_formatted || 'Rp 0';
  const averageTrxValue = totalTrxCount > 0 ? Math.floor((transactionsSummary?.total_revenue || 0) / totalTrxCount) : 0;
  const averageTrxValueFormatted = 'Rp ' + averageTrxValue.toLocaleString('id-ID');

  // Guard first render for search effect (prevents loading state on tab open)
  const isFirstRender = useRef(true);

  // ─── SELF-CONTAINED FILTER STATE ────────────────────────
  const [reportDateFilter, setReportDateFilter] = useState(initialFilters?.report || 'daily');
  const [customStartDate, setCustomStartDate] = useState(initialFilters?.start || '');
  const [customEndDate, setCustomEndDate] = useState(initialFilters?.end || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [searchQuery, setSearchQuery] = useState(initialFilters?.search || '');
  const [itemsPerPage, setItemsPerPage] = useState(meta?.per_page || 12);
  const [sortConfig, setSortConfig] = useState({
    key: transactionsSummary?.sortBy || 'created_at',
    direction: transactionsSummary?.sortDir || 'desc'
  });

  const [showCustomDate, setShowCustomDate] = useState(initialFilters?.report === 'custom');
  const [printData, setPrintData] = useState(null);
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

  const printRef = useRef();
  const downloadDropdownRef = useRef(null);
  const modalReceiptRef = useRef();

  // Store data from initialStore prop
  const storeData = initialStore;

  // ─── BACKEND FETCH HANDLER ──────────────────────────────
  const fetchFromServer = useCallback((paramsOverride = {}) => {
    setIsLoading(true);
    if (paramsOverride.hasOwnProperty('search')) {
      setIsSearchLoading(true);
    }

    const activeFilter = paramsOverride.report_filter || reportDateFilter;
    const activeStartDate = paramsOverride.start_date || customStartDate;
    const activeEndDate = paramsOverride.end_date || customEndDate;

    const baseParams = {
      report_filter: activeFilter,
      search: searchQuery,
      per_page: itemsPerPage,
      sort_by: sortConfig.key,
      sort_dir: sortConfig.direction,
      page: currentPage,
    };

    if (activeFilter === 'custom' && activeStartDate && activeEndDate) {
      baseParams.start_date = activeStartDate;
      baseParams.end_date = activeEndDate;
    }

    // Merge overrides
    const finalParams = { ...baseParams, ...paramsOverride };

    router.reload({
      data: finalParams,
      only: ['transactions', 'transactionsSummary', 'initialFilters'],
      preserveScroll: true,
      onFinish: () => {
        setIsLoading(false);
        setIsSearchLoading(false);
      },
    });
  }, [reportDateFilter, searchQuery, itemsPerPage, sortConfig, currentPage, customStartDate, customEndDate]);

  // Debounced search (Guarded from firing on mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsSearchLoading(true);
    const timer = setTimeout(() => {
      fetchFromServer({ search: searchQuery, page: 1 });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchFromServer]);

  // Filter change handlers
  const handleFilterChange = (filter) => {
    setReportDateFilter(filter);
    fetchFromServer({ report_filter: filter, page: 1 });
  };

  const handleCustomFilter = () => {
    if (!customStartDate || !customEndDate) return;
    setReportDateFilter('custom');
    fetchFromServer({ report_filter: 'custom', page: 1 });
  };

  const handleSort = (key) => {
    const newDir = sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    setSortConfig({ key, direction: newDir });
    fetchFromServer({ sort_by: key, sort_dir: newDir, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > lastPage) return;
    fetchFromServer({ page: newPage });
  };

  const handlePerPageChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    fetchFromServer({ per_page: newLimit, page: 1 });
  };


  // Handle printing when data is prepared
  useEffect(() => {
    if (printData) {
      const timer = setTimeout(() => {
        printReceipt(printRef.current, `Struk ${printData.transactionId}`);
        setPrintData(null);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [printData]);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(event.target)) {
        setShowDownloadDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewDetail = (trx) => {
    setSelectedTrx(trx);
    setShowDetailModal(true);
  };

  // ─── FILTER LABEL ─────────────────────────────────────────
  const getFilterLabel = useCallback(() => {
    if (reportDateFilter === 'daily') return 'Harian';
    if (reportDateFilter === 'monthly') return 'Bulanan';
    if (reportDateFilter === 'yearly') return 'Tahunan';
    if (reportDateFilter === 'custom' && customStartDate && customEndDate) {
      return `${customStartDate} s/d ${customEndDate}`;
    }
    return 'Custom';
  }, [reportDateFilter, customStartDate, customEndDate]);

  // ─── HELPERS ────────────────────────────────────────────
  const handlePrintClick = (t) => {
    setPrintData({
      storeName: storeData?.name,
      storeAddress: storeData?.address,
      storePhone: storeData?.phone,
      transactionId: t.display_id,
      date: t.date,
      cashierName: t.cashier,
      items: t.items_list || [],
      taxRate: t.tax_percentage || 0,
      taxAmount: t.tax_amount || 0,
      subtotal: t.subtotal || t.total,
      total: t.total,
      paymentMethod: t.paymentMethod,
      cash: t.total,
      change: 0
    });
  };

  const handlePrintFromModal = () => {
    if (selectedTrx) {
      handlePrintClick(selectedTrx);
    }
  };

  // ─── EXPORT (Server-Side full data fetch) ───
  const getExportData = async () => {
    setIsExporting(true);
    try {
      const params = {
        report_filter: reportDateFilter,
        search: searchQuery,
        sort_by: sortConfig.key,
        sort_dir: sortConfig.direction,
      };

      if (reportDateFilter === 'custom') {
        params.start_date = customStartDate;
        params.end_date = customEndDate;
      }

      const response = await axios.get('/admin/dashboard/reports/export', { params });
      return response.data.data; // JSON resource wraps in data array
    } catch (error) {
      console.error('Failed to fetch export data:', error);
      showToast('Gagal mengambil data untuk ekspor.', 'error');
      return [];
    } finally {
      setIsExporting(false);
      setShowDownloadDropdown(false);
    }
  };

  const exportToExcel = async () => {
    const dataToExport = await getExportData();
    if (!dataToExport || dataToExport.length === 0) return showToast('Tidak ada data untuk diekspor!', 'error');

    const excelData = dataToExport.map(t => ({
      'Nomor Invoice': t.id,
      'Tanggal Transaksi': t.date,
      'Kasir': t.cashier,
      'Metode Pembayaran': t.paymentMethod.toUpperCase(),
      'Item Belanja': t.items_summary || '-',
      'Total Nominal (Rp)': t.total
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const colWidths = Object.keys(excelData[0]).map(key => ({
      wch: Math.max(key.length, ...excelData.map(row => String(row[key]).length)) + 2
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Riwayat Transaksi");
    XLSX.writeFile(wb, `Laporan_${storeData?.name || 'Kasir'}_${getFilterLabel()}_${new Date().getTime()}.xlsx`);
  };

  const exportToPDF = async () => {
    const dataToExport = await getExportData();
    if (!dataToExport || dataToExport.length === 0) return showToast('Tidak ada data untuk diekspor!', 'error');

    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(16);
    doc.text(`Laporan Transaksi${storeData?.name ? ` — ${storeData.name}` : ''}`, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Filter: ${getFilterLabel()}  •  Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 28);
    if (storeData?.address) doc.text(`Alamat: ${storeData.address}`, 14, 34);

    // Use correct total from the full fetched data to ensure accuracy
    const totalExportRevenue = dataToExport.reduce((sum, t) => sum + (t.total || 0), 0);
    doc.text(`Total Transaksi: ${dataToExport.length}  •  Pendapatan: Rp ${totalExportRevenue.toLocaleString('id-ID')}`, 14, storeData?.address ? 40 : 34);

    const tableBody = dataToExport.map(t => [
      t.date,
      t.id,
      t.cashier,
      t.paymentMethod.toUpperCase(),
      formatCurrency(t.total)
    ]);

    autoTable(doc, {
      startY: storeData?.address ? 48 : 42,
      head: [['Tanggal', 'No. Invoice', 'Kasir', 'Metode Pemb.', 'Total']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold', fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`Laporan_${storeData?.name || 'Kasir'}_${getFilterLabel()}_${new Date().getTime()}.pdf`);
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

  const getMethodBadge = (method) => {
    const m = (method || '').toLowerCase();
    if (m === 'cash') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    return 'bg-brand/5 text-brand border-brand/10';
  };

  // ─── RENDER ────────────────────────────────────────────

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-[1400px] mx-auto pb-20">

      {/* ───── 4 KPI Cards (Synced with Dashboard) ───── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 px-1">
        <StatCard
          icon={<Banknote size={24} />}
          label="Total Pendapatan"
          value={isLoading ? '...' : totalRevenueFormatted}
          trendValue={transactionsSummary?.revenueGrowth}
          filter={reportDateFilter}
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          icon={<Receipt size={24} />}
          label="Total Transaksi"
          value={isLoading ? '...' : `${totalTrxCount} Struk`}
          trendValue={transactionsSummary?.transactionGrowth}
          filter={reportDateFilter}
          color="emerald"
          isLoading={isLoading}
        />
        <StatCard
          icon={<ShoppingCart size={24} />}
          label="Rata-rata Transaksi"
          value={isLoading ? '...' : averageTrxValueFormatted}
          trendValue={transactionsSummary?.aovGrowth}
          filter={reportDateFilter}
          color="indigo"
          isLoading={isLoading}
        />
        <StatCard
          icon={<Calculator size={24} />}
          label="Total Pajak"
          value={isLoading ? '...' : (transactionsSummary?.tax_formatted || 'Rp 0')}
          trendValue={transactionsSummary?.revenueGrowth}
          filter={reportDateFilter}
          color="amber"
          isLoading={isLoading}
        />
      </div>

      {/* ───── DESKTOP HEADER (Controls Row) ───── */}
      <div className="hidden lg:flex flex-col gap-5 mb-6 px-1">

        {/* ROW 1: Search Bar & Download Dropdown */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative group/search font-manrope">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-brand transition-colors"
            />
            <input
              type="text"
              placeholder="Cari No. Transaksi, kasir, atau metode pembayaran..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white/80 border border-slate-200/60 rounded-2xl text-[13px] font-manrope font-bold text-on-surface placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand/30 shadow-sm transition-all"
            />
          </div>
          <div className="relative" ref={downloadDropdownRef}>
            <button
              onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
              disabled={isExporting || isLoading}
              className="bg-brand text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-brand/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-3 border border-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FontAwesomeIcon icon={faBoxOpen} />
              )}
              {isExporting ? 'MENYIAPKAN...' : 'Download Laporan'}
              {!isExporting && <FontAwesomeIcon icon={faAngleDown} className={`transition-transform duration-300 ${showDownloadDropdown ? 'rotate-180' : ''}`} />}
            </button>

            {showDownloadDropdown && !isExporting && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={exportToExcel}
                  className="w-full px-5 py-3.5 text-left text-[11px] font-black text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-3 border-b border-slate-50"
                >
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faFileExcel} />
                  </div>
                  EKSPOR EXCEL (.XLSX)
                </button>
                <button
                  onClick={exportToPDF}
                  className="w-full px-5 py-3.5 text-left text-[11px] font-black text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faFilePdf} />
                  </div>
                  EKSPOR PDF (.PDF)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: Filter Tabs (Left) + Custom Range (Right) */}
        <div className="flex items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm font-manrope">
          {/* Left: Button Group Filters */}
          <div className="flex items-center bg-slate-100/85 p-1 rounded-xl border border-slate-200/40 shadow-inner shrink-0">
            <button
              onClick={() => {
                setShowCustomDate(false);
                handleFilterChange('daily');
              }}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.05em] transition-all duration-300 ${reportDateFilter === 'daily' && !showCustomDate
                ? 'bg-white text-brand shadow-sm border border-slate-200/20 scale-105'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => {
                setShowCustomDate(false);
                handleFilterChange('monthly');
              }}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.05em] transition-all duration-300 ${reportDateFilter === 'monthly' && !showCustomDate
                ? 'bg-white text-brand shadow-sm border border-slate-200/20 scale-105'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => {
                setShowCustomDate(false);
                handleFilterChange('yearly');
              }}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.05em] transition-all duration-300 ${reportDateFilter === 'yearly' && !showCustomDate
                ? 'bg-white text-brand shadow-sm border border-slate-200/20 scale-105'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Tahun Ini
            </button>
            <button
              onClick={() => {
                setShowCustomDate(true);
              }}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.05em] transition-all duration-300 ${showCustomDate || reportDateFilter === 'custom'
                ? 'bg-white text-brand shadow-sm border border-slate-200/20 scale-105'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Rentang Kustom
            </button>
          </div>

          {/* Right: Custom Date Range (shown inline when active) */}
          <div className="flex-1 flex justify-end">
            {showCustomDate && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50/80 border border-slate-200/60 rounded-xl shadow-sm animate-in fade-in slide-in-from-right-2 duration-300">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-brand shrink-0 text-xs" />
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-brand cursor-pointer text-slate-800 w-32 focus:ring-2 focus:ring-brand/5"
                />
                <span className="text-slate-400 font-bold text-[9px] uppercase shrink-0 px-0.5">s/d</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-brand cursor-pointer text-slate-800 w-32 focus:ring-2 focus:ring-brand/5"
                />
                <button
                  onClick={handleCustomFilter}
                  disabled={!customStartDate || !customEndDate || isLoading}
                  className="bg-brand hover:bg-brand/90 text-white px-3.5 py-1.5 rounded-lg font-black text-[9px] flex items-center gap-1.5 transition-all shadow-md shadow-brand/20 active:scale-95 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FontAwesomeIcon icon={faSearch} size="xs" />
                  )}
                  Terapkan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ───── MOBILE HEADER (Controls Section) ───── */}
      <div className="lg:hidden flex flex-col gap-3 mb-5 px-1 font-manrope">
        {/* Row 1: Search + Export Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative group/search">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-brand transition-colors"
              size="sm"
            />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/95 border border-slate-200/60 rounded-2xl text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand/30 shadow-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={exportToExcel}
              disabled={isExporting || isLoading}
              className="w-11 h-11 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200/50 flex items-center justify-center active:scale-90 transition-all font-black text-xs disabled:opacity-50 shrink-0"
              title="Ekspor Excel"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FontAwesomeIcon icon={faFileExcel} />
              )}
            </button>
            <button
              onClick={exportToPDF}
              disabled={isExporting || isLoading}
              className="w-11 h-11 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-200/50 flex items-center justify-center active:scale-90 transition-all font-black text-xs disabled:opacity-50 shrink-0"
              title="Ekspor PDF"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FontAwesomeIcon icon={faFilePdf} />
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Filter Tabs */}
        <div className="flex bg-white/80 p-1 rounded-xl border border-slate-200/80 shadow-sm overflow-hidden w-full">
          <button
            onClick={() => {
              setShowCustomDate(false);
              handleFilterChange('daily');
            }}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${reportDateFilter === 'daily' && !showCustomDate
              ? 'bg-brand text-white shadow-md shadow-brand/10'
              : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => {
              setShowCustomDate(false);
              handleFilterChange('monthly');
            }}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${reportDateFilter === 'monthly' && !showCustomDate
              ? 'bg-brand text-white shadow-md shadow-brand/10'
              : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => {
              setShowCustomDate(false);
              handleFilterChange('yearly');
            }}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${reportDateFilter === 'yearly' && !showCustomDate
              ? 'bg-brand text-white shadow-md shadow-brand/10'
              : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            Tahun Ini
          </button>
          <button
            onClick={() => {
              setShowCustomDate(!showCustomDate);
            }}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${showCustomDate || reportDateFilter === 'custom'
              ? 'bg-brand text-white shadow-md shadow-brand/10'
              : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            Kustom
          </button>
        </div>

        {/* Mobile Custom Date Range (Collapsible) */}
        {showCustomDate && (
          <div className="flex flex-col gap-2.5 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 w-full">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-brand shrink-0 text-xs" />
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-brand cursor-pointer text-slate-800"
              />
              <span className="text-slate-400 font-bold text-[9px] uppercase shrink-0 px-1">s/d</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-brand cursor-pointer text-slate-800"
              />
            </div>
            <button
              onClick={handleCustomFilter}
              disabled={!customStartDate || !customEndDate || isLoading}
              className="bg-brand hover:bg-brand/90 text-white px-6 py-2.5 rounded-lg font-black text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand/20 active:scale-95 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faSearch} size="sm" />
              )}
              Terapkan Filter
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════ CONTENT AREA ═══════════════════ */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[1.5rem] lg:rounded-[2rem] border border-slate-200/60 shadow-lg shadow-slate-200/30 overflow-hidden relative">

        {isLoading && transactions.length > 0 && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
          </div>
        )}

        {transactions.length === 0 && !isLoading ? (
          <div className="py-24 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faBoxOpen} size="2x" className="text-slate-300" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-600 mb-1">
                {searchQuery ? 'Transaksi Tidak Ditemukan' : 'Belum Ada Transaksi'}
              </p>
              <p className="text-[10px] font-bold text-slate-500 mb-4 max-w-xs">
                {searchQuery
                  ? `Pencarian "${searchQuery}" tidak membuahkan hasil.`
                  : 'Tidak ada data transaksi untuk periode ini. Coba ubah filter tanggal.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ───── DESKTOP & TABLET TABLE ───── */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-50/30 border-b border-slate-100/60 font-manrope">
                  <tr className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-3 lg:px-6 py-3 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('id')}>No. Transaksi <SortIndicator columnKey="id" /></th>
                    <th className="px-3 lg:px-6 py-3 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('created_at')}>Waktu <SortIndicator columnKey="created_at" /></th>
                    <th className="hidden lg:table-cell px-3 lg:px-6 py-3 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('user_id')}>Kasir <SortIndicator columnKey="user_id" /></th>
                    <th className="hidden xl:table-cell px-3 lg:px-6 py-3 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('payment_method')}>Pembayaran <SortIndicator columnKey="payment_method" /></th>
                    <th className="px-3 lg:px-6 py-3 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('total_amount')}>Nominal <SortIndicator columnKey="total_amount" /></th>
                    <th className="px-3 lg:px-6 py-3 text-right pr-6 lg:pr-10">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/60 bg-white font-manrope">
                  {transactions.map((t, idx) => (
                    <tr key={t.id || idx} className="hover:bg-slate-50/50 transition-all group/row">
                      <td className="px-3 lg:px-6 py-3 font-black text-[11px] lg:text-[12px] text-brand whitespace-nowrap">{t.display_id}</td>
                      <td className="px-3 lg:px-6 py-3 text-[10px] lg:text-[11px] font-medium text-slate-400 whitespace-nowrap">{t.date}</td>
                      <td className="hidden lg:table-cell px-3 lg:px-6 py-3 text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-wider">{t.cashier}</td>
                      <td className="hidden xl:table-cell px-3 lg:px-6 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-widest border transition-all ${getMethodBadge(t.paymentMethod)}`}>
                          {t.paymentMethod}
                        </span>
                      </td>
                      <td className="px-3 lg:px-6 py-3 font-black text-on-surface text-[11px] lg:text-[13px] tracking-tight whitespace-nowrap">{t.total_formatted}</td>
                      <td className="px-3 lg:px-6 py-3 text-right pr-6 lg:pr-10">
                        <button
                          onClick={() => handleViewDetail(t)}
                          className="px-4 lg:px-6 py-1.5 bg-slate-50 text-slate-500 group-hover/row:bg-brand group-hover/row:text-white rounded-xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all border border-slate-100 active:scale-95 whitespace-nowrap shadow-sm"
                        >
                          Lihat Struk
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* DESKTOP TABLE FOOTER / PAGINATION */}
            {totalTrxCount > 12 && (
              <div className="hidden md:flex items-center justify-between px-8 py-4 bg-slate-50/50 border-t border-slate-100 font-manrope">
                <div className="flex items-center gap-2">
                  <div className="bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/50 shadow-sm flex items-center gap-2">
                    <span className="bg-brand text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm tabular-nums">{totalTrxCount}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Total Transaksi</span>
                  </div>
                </div>

                <div className="flex items-center bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-slate-200/80 shadow-sm shrink-0">
                  <div className="flex items-center border-r border-slate-200 relative">
                    <select
                      value={itemsPerPage}
                      onChange={handlePerPageChange}
                      className="bg-transparent border-none focus:ring-0 text-[10px] sm:text-xs font-black text-brand py-1.5 pl-3 pr-7 appearance-none outline-none cursor-pointer relative z-10"
                    >
                      <option value={12}>12 baris</option>
                      <option value={24}>24 baris</option>
                      <option value={48}>48 baris</option>
                      <option value={96}>96 baris</option>
                    </select>
                    <FontAwesomeIcon icon={faAngleDown} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand/40 pointer-events-none z-20" size="xs" />
                  </div>

                  <div className="flex items-center gap-1.5 px-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1 || isLoading}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${currentPage <= 1 || isLoading ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-50 hover:text-brand active:scale-95'}`}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} size="xs" />
                    </button>
                    <span className="text-[10px] md:text-xs font-black text-slate-700 tabular-nums">
                      {currentPage} <span className="text-slate-300 px-0.5 font-medium">/</span> {lastPage || 1}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= lastPage || isLoading}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${currentPage >= lastPage || isLoading ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-50 hover:text-brand active:scale-95'}`}
                    >
                      <FontAwesomeIcon icon={faChevronRight} size="xs" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ───── MOBILE CARDS (Mirror POS History) ───── */}
            <div className="md:hidden p-2 grid grid-cols-1 gap-3">
              {transactions.map((t, idx) => (
                <div key={t.id || idx} className="bg-white p-5 rounded-[1.75rem] border border-slate-100 shadow-sm flex flex-col active:scale-[0.98] transition-all group" onClick={() => handleViewDetail(t)}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="font-manrope font-black text-brand tracking-tight text-[12px] mb-1 block truncate underline decoration-brand/20 underline-offset-4 decoration-2">{t.display_id}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight whitespace-nowrap">{t.date}</span>
                        <span className="text-[9px] text-slate-300">•</span>
                        <span className="text-[9px] text-slate-500 font-black uppercase truncate tracking-widest">{t.cashier}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${getMethodBadge(t.paymentMethod)}`}>
                      {t.paymentMethod}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-auto">
                    <span className="text-base font-manrope font-black text-on-surface tracking-tighter tabular-nums">{t.total_formatted}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleViewDetail(t); }}
                      className="px-5 py-2.5 bg-brand/5 text-brand text-[10px] font-manrope font-black rounded-xl transition-all uppercase tracking-widest border border-brand/10 flex items-center gap-2 group-active:bg-brand group-active:text-white"
                    >
                      <FontAwesomeIcon icon={faEye} size="sm" /> DETAIL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ───── MOBILE PAGINATION (Bottom of list) ───── */}
      {totalTrxCount > 12 && (
        <div className="md:hidden mt-5 px-1 font-manrope">
          <div className="relative flex items-center justify-between bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200/60 shadow-lg w-full">
            <div className="flex items-center border-r border-slate-200 relative">
              <select
                value={itemsPerPage}
                onChange={handlePerPageChange}
                className="bg-transparent border-none focus:ring-0 text-[10px] font-black text-brand py-1.5 pl-3 pr-7 appearance-none outline-none cursor-pointer relative z-10"
              >
                <option value={12}>12 baris</option>
                <option value={24}>24 baris</option>
                <option value={48}>48 baris</option>
              </select>
              <FontAwesomeIcon icon={faAngleDown} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand/40 pointer-events-none z-20" size="xs" />
            </div>

            <div className="flex items-center gap-1.5 px-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${currentPage <= 1 || isLoading
                    ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                    : 'text-brand bg-slate-50 hover:bg-slate-100 border border-slate-200/60 active:scale-90'
                  }`}
              >
                <FontAwesomeIcon icon={faChevronLeft} size="xs" />
              </button>
              <span className="text-[10px] font-black text-slate-700 tabular-nums">
                {currentPage} <span className="text-slate-300 px-0.5 font-medium">/</span> {lastPage || 1}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= lastPage || isLoading}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${currentPage >= lastPage || isLoading
                    ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                    : 'text-brand bg-slate-50 hover:bg-slate-100 border border-slate-200/60 active:scale-90'
                  }`}
              >
                <FontAwesomeIcon icon={faChevronRight} size="xs" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedTrx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-slate-50 rounded-[2rem] shadow-2xl w-full max-w-sm max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 border border-white/20">
            {/* Header with Success Effect */}
            <div className="pt-8 pb-4 flex flex-col items-center justify-center relative">
              <div className="relative mb-3">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping duration-[3000ms]" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-brand to-brand/80 text-white rounded-full flex items-center justify-center shadow-lg shadow-brand/30 z-10">
                  <FontAwesomeIcon icon={faCheckCircle} size="2x" />
                </div>
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Detail Transaksi</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">{selectedTrx.display_id}</p>
            </div>

            {/* Scrollable Receipt Area */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-8 flex flex-col items-center custom-scrollbar">
              <div className="w-full bg-white shadow-sm rounded-2xl border border-slate-200">
                <div className="p-1">
                  <ReceiptDoc
                    ref={modalReceiptRef}
                    data={{
                      storeName: storeData?.name,
                      storeAddress: storeData?.address,
                      storePhone: storeData?.phone,
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
            </div>

            {/* Actions */}
            <div className="p-6 bg-white flex flex-col gap-3 border-t border-slate-100">
              <button
                onClick={handlePrintFromModal}
                className="w-full py-4 bg-brand hover:bg-brand/90 text-white font-black rounded-2xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-xs"
              >
                <FontAwesomeIcon icon={faPrint} size="lg" /> CETAK STRUK
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full py-3.5 bg-slate-50 border border-slate-200 text-slate-500 font-black rounded-xl transition-all hover:bg-slate-100 text-[10px] uppercase tracking-[0.3em]"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Receipt for Printing Source */}
      <div style={{ display: 'none' }}>
        <ReceiptDoc ref={printRef} data={printData} />
      </div>
    </div>
  );
});

export default ReportsTab;
