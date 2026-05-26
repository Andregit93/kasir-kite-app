<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SalesAnalyticsService
{
    private function applyTenantScope($query, $table = null)
    {
        $user = auth()->user();
        if ($user && !$user->isSuperAdmin()) {
            $column = $table ? "{$table}.tenant_id" : 'tenant_id';
            return $query->where($column, $user->tenant_id);
        }
        return $query;
    }

    /**
     * Get primary summary statistics (Pendapatan, Volume, AOV).
     */
    public function getSummaryStats(Carbon $start, Carbon $end, string $timezone = 'UTC')
    {
        $stats = $this->applyTenantScope(Transaction::query())
            ->where('status', 'success')
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('SUM(total_amount) as total_revenue, COUNT(*) as total_transactions, AVG(total_amount) as aov')
            ->first();

        // Comparison Period calculation for growth metrics (MoM, YoY, DoD)
        $isMonthly = $start->isStartOfMonth();
        $isYearly = $start->isStartOfYear();
        
        if ($isYearly) {
            $prevStart = $start->copy()->subYear();
            $prevEnd = $end->copy()->subYear();
        } elseif ($isMonthly) {
            $prevStart = $start->copy()->subMonth();
            $prevEnd = $end->copy()->subMonth();
        } else {
            // Daily Case (Today): Compare 'Today so far' with 'WHOLE Yesterday'
            // This prevents misleading 100% growth if no sales occurred early morning yesterday.
            $prevStart = $start->copy()->subDay()->startOfDay();
            $prevEnd = $start->copy()->subDay()->endOfDay();
        }

        $prevStats = $this->applyTenantScope(Transaction::query())
            ->where('status', 'success')
            ->whereBetween('created_at', [$prevStart, $prevEnd])
            ->selectRaw('SUM(total_amount) as total_revenue, COUNT(*) as total_transactions, AVG(total_amount) as aov')
            ->first();

        $revenue = (float)($stats->total_revenue ?? 0);
        $transactions = (int)($stats->total_transactions ?? 0);
        $aov = (float)($stats->aov ?? 0);

        $prevRevenue = (float)($prevStats->total_revenue ?? 0);
        $prevTransactions = (int)($prevStats->total_transactions ?? 0);
        $prevAov = (float)($prevStats->aov ?? 0);

        return [
            'revenue' => $revenue,
            'transactions' => $transactions,
            'avgOrderValue' => $aov,
            'revenueGrowth' => (float) ($prevRevenue > 0 ? (($revenue - $prevRevenue) / $prevRevenue) * 100 : ($revenue > 0 ? 100 : 0)),
            'transactionGrowth' => (float) ($prevTransactions > 0 ? (($transactions - $prevTransactions) / $prevTransactions) * 100 : ($transactions > 0 ? 100 : 0)),
            'aovGrowth' => (float) ($prevAov > 0 ? (($aov - $prevAov) / $prevAov) * 100 : ($aov > 0 ? 100 : 0)),
        ];
    }

    /**
     * Get sales trend data for Recharts.
     */
    public function getSalesTrend(string $filter, string $timezone = 'UTC')
    {
        $now = Carbon::now($timezone);
        $data = [];

        $projectionBase = "created_at AT TIME ZONE 'Asia/Jakarta' AT TIME ZONE ?";

        if ($filter === 'daily') {
            $raw = $this->applyTenantScope(Transaction::query())
                ->where('status', 'success')
                ->whereRaw("({$projectionBase})::date = (CURRENT_TIMESTAMP AT TIME ZONE ?)::date", [$timezone, $timezone])
                ->selectRaw("EXTRACT(HOUR FROM ({$projectionBase})) as hour, SUM(total_amount) as total", [$timezone])
                ->groupBy('hour')
                ->get();

            for ($h = 0; $h < 24; $h++) {
                $data[] = ['label' => sprintf('%02d:00', $h), 'total' => (float)$raw->where('hour', $h)->first()?->total ?? 0];
            }
        } elseif ($filter === 'monthly') {
            $raw = $this->applyTenantScope(Transaction::query())
                ->where('status', 'success')
                ->whereRaw("EXTRACT(MONTH FROM ({$projectionBase})) = ?", [$timezone, $now->month])
                ->whereRaw("EXTRACT(YEAR FROM ({$projectionBase})) = ?", [$timezone, $now->year])
                ->selectRaw("EXTRACT(DAY FROM ({$projectionBase})) as day, SUM(total_amount) as total", [$timezone])
                ->groupBy('day')
                ->get();

            for ($d = 1; $d <= $now->daysInMonth; $d++) {
                $data[] = ['label' => sprintf('%02d', $d), 'total' => (float)$raw->where('day', $d)->first()?->total ?? 0];
            }
        } else {
            $raw = $this->applyTenantScope(Transaction::query())
                ->where('status', 'success')
                ->whereRaw("EXTRACT(YEAR FROM ({$projectionBase})) = ?", [$timezone, $now->year])
                ->selectRaw("EXTRACT(MONTH FROM ({$projectionBase})) as month, SUM(total_amount) as total", [$timezone])
                ->groupBy('month')
                ->get();

            for ($m = 1; $m <= 12; $m++) {
                $data[] = ['label' => Carbon::create()->month($m)->format('M'), 'total' => (float)$raw->where('month', $m)->first()?->total ?? 0];
            }
        }
        return $data;
    }

    /**
     * Get peak transaction hours.
     */
    public function getPeakHours(Carbon $start, Carbon $end, string $timezone = 'UTC')
    {
        $projectionBase = "created_at AT TIME ZONE 'Asia/Jakarta' AT TIME ZONE ?";

        $raw = $this->applyTenantScope(Transaction::query())
            ->where('status', 'success')
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw("EXTRACT(HOUR FROM ({$projectionBase})) as hour, COUNT(*) as count", [$timezone])
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get();

        return $raw->map(fn($item) => ['hour' => sprintf('%02d:00', $item->hour), 'volume' => (int)$item->count]);
    }

    /**
     * Get performance by cashier.
     */
    public function getCashierPerformance(Carbon $start, Carbon $end, string $timezone = 'UTC')
    {
        return $this->applyTenantScope(Transaction::join('users', 'users.id', '=', 'transactions.user_id'), 'transactions')
            ->where('transactions.status', 'success')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->select('users.name', DB::raw('SUM(transactions.total_amount) as total_sales'), DB::raw('COUNT(transactions.id) as total_transactions'))
            ->groupBy('users.name')
            ->orderByRaw('SUM(transactions.total_amount) DESC')
            ->get();
    }

    /**
     * Get payment method distribution.
     */
    public function getPaymentMethodStats(Carbon $start, Carbon $end, string $timezone = 'UTC')
    {
        $raw = $this->applyTenantScope(Transaction::query())
            ->where('status', 'success')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('payment_method')
            ->selectRaw('payment_method, COUNT(*) as count')
            ->pluck('count', 'payment_method');

        $labels = ['cash' => 'Tunai', 'qris' => 'QRIS', 'transfer' => 'Transfer'];
        $stats = [];
        foreach ($labels as $key => $label) {
            $stats[] = ['name' => $label, 'value' => (int)($raw[$key] ?? 0)];
        }
        return $stats;
    }

    /**
     * Get revenue performance per category.
     */
    public function getCategoryPerformance(Carbon $start, Carbon $end, string $timezone = 'UTC')
    {
        $query = DB::table('transaction_items')
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->join('products', 'products.id', '=', 'transaction_items.product_id')
            ->join('categories', 'categories.id', '=', 'products.category_id');
        
        $this->applyTenantScope($query, 'transactions');
 
        return $query->where('transactions.status', 'success')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->select('categories.name', 'categories.color', DB::raw('SUM(transaction_items.subtotal) as revenue'), DB::raw('SUM(transaction_items.quantity) as quantity'))
            ->groupBy('categories.id', 'categories.name', 'categories.color')
            ->orderByRaw('SUM(transaction_items.subtotal) DESC')
            ->get();
    }

    /**
     * getRecentTransactions()
     * Uses configuration for limit.
     */
    public function getRecentTransactions(string $timezone = 'UTC')
    {
        $limit = config('kasir.recent_transactions_limit', 5);

        return $this->applyTenantScope(Transaction::with(['user:id,name,photo_url']))
            ->where('status', 'success') // Only show successful transactions on Dashboard
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($trx) => [
                'id' => 'TRX-' . strtoupper(substr($trx->id, 0, 10)),
                'time' => $trx->created_at->timezone($timezone)->format('H:i'),
                'cashier' => $trx->user->name ?? 'Kasir',
                'cashier_photo' => $trx->user->photo_url ?? null,
                'amount' => (float) $trx->total_amount,
                'paymentMethod' => $trx->payment_method
            ]);
    }

    /**
     * Get the top selling products globally.
     */
    public function getTopSellingProducts(int $limit = 5)
    {
        $query = DB::table('transaction_items')
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->join('products', 'products.id', '=', 'transaction_items.product_id');

        $this->applyTenantScope($query, 'transactions');

        return $query->where('transactions.status', 'success')
            ->select(
                'products.id',
                'products.name',
                'products.image_url',
                DB::raw('SUM(transaction_items.quantity) as total_sold'),
                DB::raw('SUM(transaction_items.subtotal) as revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.image_url')
            ->orderByRaw('SUM(transaction_items.quantity) DESC')
            ->limit($limit)
            ->get();
    }
}
