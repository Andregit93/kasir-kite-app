<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function getDaily(Request $request)
    {
        $tenantId = Auth::user()->tenant_id;
        $filter = $request->get('filter', 'daily');
        $now = Carbon::now('Asia/Jakarta');
        
        if ($filter === 'yearly') {
            $startDate = $now->copy()->startOfYear();
            $labelFormat = 'M'; // "Jan", "Feb", etc.
            $phpDateFormat = 'M';
        } elseif ($filter === 'monthly') {
            $startDate = $now->copy()->startOfMonth();
            $labelFormat = 'd M'; // "01 Jan", etc.
            $phpDateFormat = 'd M';
        } else {
            $startDate = $now->copy()->startOfDay();
            $labelFormat = 'H:00'; // "09:00", "10:00", etc.
            $phpDateFormat = 'H:00';
        }
        
        $transactions = Transaction::whereBetween('created_at', [$startDate->copy()->utc(), $now->copy()->utc()])
            ->where('status', 'success')
            ->orderBy('created_at', 'asc')
            ->get();
            
        $totalRevenue = $transactions->sum('total_amount');
        $totalTransactions = $transactions->count();
        $totalProducts = Product::count(); // Global scope applies automatically
        $totalCashiers = User::where('role', 'cashier')->count();
        
        // Agregasi Data Chart
        $chartData = $transactions->groupBy(function($trx) use ($phpDateFormat) {
            return Carbon::parse($trx->created_at)->timezone('Asia/Jakarta')->format($phpDateFormat);
        })->map(function($group, $label) {
            return [
                'label' => $label,
                'total' => $group->sum('total_amount')
            ];
        })->values()->all();
        
        // Statistik Metode Pembayaran
        $paymentMethodStats = $transactions->groupBy('payment_method')->map(function ($group, $key) {
            $methodName = match(strtolower($key)) {
                'cash' => 'Tunai',
                'qris' => 'QRIS',
                'transfer' => 'Transfer',
                default => ucfirst($key)
            };
            return ['name' => $methodName, 'value' => $group->count()];
        })->values()->all();
        
        return response()->json(['data' => [
            'totalRevenue' => (float)$totalRevenue,
            'totalTransactions' => $totalTransactions,
            'totalProducts' => $totalProducts,
            'totalCashiers' => $totalCashiers,
            'chartData' => $chartData,
            'paymentMethodStats' => $paymentMethodStats
        ]]);
    }

    public function getWidgets()
    {
        $tenantId = Auth::user()->tenant_id;
        
        // 1. Stok Menipis (Exclude unlimited -1)
        $lowStockProducts = Product::where('stock', '!=', -1)
            ->where('stock', '<=', 10)
            ->orderBy('stock', 'asc')
            ->limit(5)
            ->get();
            
        // 2. Produk Terlaris (Success Only)
        $topSellingProducts = \App\Models\TransactionItem::select('product_id', \Illuminate\Support\Facades\DB::raw('SUM(quantity) as totalSold'))
            ->whereHas('transaction', function($query) {
                $query->where('status', 'success');
            })
            ->with('product:id,name,image_url')
            ->groupBy('product_id')
            ->orderByDesc('totalSold')
            ->limit(5)
            ->get()
            ->map(function($item, $index) {
                return [
                    'rank' => $index + 1,
                    'id' => $item->product_id,
                    'name' => $item->product->name ?? 'Produk Dihapus',
                    'image_url' => $item->product->image_url ?? null,
                    'totalSold' => (int)$item->totalSold
                ];
            });

        // 3. Rata-rata Transaksi (Hari ini - Success Only)
        $avgTransactionValue = Transaction::whereDate('created_at', Carbon::today())
            ->where('status', 'success')
            ->avg('total_amount') ?? 0;

        // 4. Riwayat Transaksi Terbaru
        $recentTransactions = Transaction::with(['user:id,name,email', 'items.product:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($t) {
                $itemsString = $t->items->map(function ($item) {
                    $productName = $item->product->name ?? 'Produk Dihapus';
                    return "{$productName} ({$item->quantity}x)";
                })->join(', ');

                return [
                    'id' => 'TRX-' . strtoupper(substr($t->id, 0, 6)),
                    'date' => Carbon::parse($t->created_at)->timezone('Asia/Jakarta')->format('d M Y H.i'),
                    'cashier' => $t->user->name ?? explode('@', $t->user->email ?? 'Kasir')[0],
                    'total' => (float)$t->total_amount,
                    'items' => $itemsString ?: 'Tidak ada detail'
                ];
            });
            
        return response()->json(['data' => [
            'lowStockProducts' => $lowStockProducts,
            'topSellingProducts' => $topSellingProducts,
            'avgTransactionValue' => (float)$avgTransactionValue,
            'recentTransactions' => $recentTransactions
        ]]);
    }
}
