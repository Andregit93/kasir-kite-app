<?php

namespace App\Services;

use App\Models\Product;
use App\Models\TransactionItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InventoryService
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
     * Get products available for the Public QR Self-Order catalog.
     */
    public function getAvailableForQR()
    {
        return $this->applyTenantScope(Product::query())
            ->where('stock', '>', 0)
            ->where('is_active', true) // Assuming an is_active flag exists or will be added
            ->select('id', 'name', 'price', 'stock', 'image_url', 'category_id')
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Get total valuation of current inventory.
     */
    public function getInventoryValuation()
    {
        return (float)$this->applyTenantScope(Product::query())
            ->where('stock', '>', 0)
            ->selectRaw('SUM(stock * price) as total_value')
            ->value('total_value');
    }

    /**
     * getLowStockAlerts()
     * Uses configuration for threshold.
     */
    public function getLowStockAlerts(int $limit = 10)
    {
        $threshold = config('kasir.low_stock_threshold', 5);

        return $this->applyTenantScope(Product::query())
            ->where('stock', '<=', $threshold)
            ->where('stock', '>=', 0)
            ->orderBy('stock', 'asc')
            ->limit($limit)
            ->get();
    }

    /**
     * getDeadStock()
     * Uses configuration for the cutoff period.
     */
    public function getDeadStock(int $limit = 5)
    {
        $days = config('kasir.dead_stock_days', 30);
        $cutoff = Carbon::now()->subDays($days);

        return $this->applyTenantScope(Product::query())
            ->where('stock', '>', 0)
            ->whereNotExists(function ($query) use ($cutoff) {
                $query->select(DB::raw(1))
                    ->from('transaction_items')
                    ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
                    ->whereRaw('transaction_items.product_id = products.id')
                    ->where('transactions.created_at', '>=', $cutoff);
                
                $this->applyTenantScope($query, 'transactions');
            })
            ->select('id', 'name', 'stock', 'image_url')
            ->orderBy('created_at', 'asc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get inventory health summary.
     */
    public function getInventoryHealthStats()
    {
        $query = $this->applyTenantScope(Product::query());
        
        // Performance Optimized: Single query with conditional aggregation
        $stats = $query->selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as in_stock,
            SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as out_of_stock,
            SUM(CASE WHEN stock = -1 THEN 1 ELSE 0 END) as unlimited
        ")->first();

        $total = (int)$stats->total;
        $inStock = (int)$stats->in_stock;
        $unlimited = (int)$stats->unlimited;

        return [
            'total' => $total,
            'inStock' => $inStock,
            'outOfStock' => (int)$stats->out_of_stock,
            'unlimited' => $unlimited,
            'healthPercentage' => $total > 0 ? (($inStock + $unlimited) / $total) * 100 : 0
        ];
    }
}
