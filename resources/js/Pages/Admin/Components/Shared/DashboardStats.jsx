import React from 'react';
import { Banknote, Receipt, ShoppingCart, Calculator } from 'lucide-react';
import { StatCard, FilterBtn } from './DashboardUI';
import { formatCurrency } from '../../../../utils/formatters';

const DashboardStats = React.memo(({ performanceMetrics, chartFilter, onFilterChange, isLoading }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Metrics Grid */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 px-0">
        <StatCard
          icon={<Banknote size={24} />}
          label="Total Penjualan"
          value={formatCurrency(performanceMetrics.revenue)}
          trendValue={performanceMetrics.revenueGrowth}
          filter={chartFilter}
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          icon={<Receipt size={24} />}
          label="Total Transaksi"
          value={`${performanceMetrics.transactions || 0} Struk`}
          trendValue={performanceMetrics.transactionGrowth}
          filter={chartFilter}
          color="emerald"
          isLoading={isLoading}
        />
        <StatCard
          icon={<ShoppingCart size={24} />}
          label="Rata-rata Belanja"
          value={formatCurrency(performanceMetrics.avgOrderValue)}
          trendValue={performanceMetrics.aovGrowth}
          filter={chartFilter}
          color="indigo"
          isLoading={isLoading}
        />
        <StatCard
          icon={<Calculator size={24} />}
          label="Nilai Estimasi Stok"
          value={formatCurrency(performanceMetrics.potensiNilaiJual)}
          trendValue={performanceMetrics.inventoryHealth?.healthPercentage}
          filter={chartFilter}
          color="amber"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
});


export default DashboardStats;

