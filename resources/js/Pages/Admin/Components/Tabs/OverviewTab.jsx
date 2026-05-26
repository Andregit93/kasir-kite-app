import React from 'react';
import DashboardStats from '../Shared/DashboardStats';
import SalesTrendChart from '../Charts/SalesTrendChart';
import PaymentMethodChart from '../Charts/PaymentMethodChart';
import RecentTransactionsWidget from '../Widgets/RecentTransactionsWidget';
import StockAlertsWidget from '../Widgets/StockAlertsWidget';
import DeadStockWidget from '../Widgets/DeadStockWidget';
import TopProductsWidget from '../Widgets/TopProductsWidget';

const OverviewTab = ({ 
  metrics, 
  chartFilter, 
  onFilterChange, 
  isLoading, 
  topProducts, 
  recentTrx, 
  staticWidgets,
  onSeeAllTransactions,
  onSeeAllProducts
}) => {
  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-[1500px] mx-auto w-full">
      {/* MOBILE ONLY FILTERS: Moved from Header for better UX */}
      <div className="md:hidden mb-4">
        <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <button
            onClick={() => onFilterChange('daily')}
            className={`py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
              chartFilter === 'daily'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 z-10'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Harian
          </button>
          <button
            onClick={() => onFilterChange('monthly')}
            className={`py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
              chartFilter === 'monthly'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 z-10'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Bulanan
          </button>
          <button
            onClick={() => onFilterChange('yearly')}
            className={`py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
              chartFilter === 'yearly'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 z-10'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Tahunan
          </button>
        </div>
      </div>

      <div className="space-y-4 lg:space-y-6">
        <DashboardStats
        performanceMetrics={metrics}
        chartFilter={chartFilter}
        onFilterChange={onFilterChange}
        isLoading={isLoading}
      />

      {/* Row 2: Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 mb-4">
        <div className="lg:col-span-8">
          <SalesTrendChart data={metrics?.chartData || []} loading={isLoading} />
        </div>
        <div className="lg:col-span-4">
          <PaymentMethodChart data={metrics?.paymentMethodStats || []} loading={isLoading} />
        </div>
      </div>

      {/* Row 3: Operational Widgets (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        <TopProductsWidget products={topProducts} />
        <StockAlertsWidget products={staticWidgets?.lowStockProducts || []} onNavigate={onSeeAllProducts} />
        <DeadStockWidget products={staticWidgets?.deadStock || []} onNavigate={onSeeAllProducts} />
      </div>

      {/* Row 4: Transaction Feed (Full Width) */}
      <div className="w-full">
        <RecentTransactionsWidget 
          transactions={recentTrx} 
          onSeeAll={onSeeAllTransactions} 
        />
      </div>
    </div>
  </div>
  );
};

export default React.memo(OverviewTab);
