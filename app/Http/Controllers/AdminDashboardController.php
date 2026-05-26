<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Tenant;
use App\Services\SalesAnalyticsService;
use App\Services\InventoryService;
use App\Services\SupabaseTokenService;
use Illuminate\Http\Request;
use App\Http\Resources\TransactionResource;
use Inertia\Inertia;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    protected $sales;
    protected $inventory;
    protected $tokenService;

    /**
     * Dependency Injection of specialized services.
     */
    public function __construct(
        SalesAnalyticsService $sales, 
        InventoryService $inventory,
        SupabaseTokenService $tokenService
    ) {
        $this->sales = $sales;
        $this->inventory = $inventory;
        $this->tokenService = $tokenService;
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $tenantId = $user->tenant_id;
        
        // Generate Secure JWT for Supabase Realtime
        $supabaseToken = $this->tokenService->generateToken($tenantId);

        // Advanced: Dynamic User-Centric Timezone Detection
        $userTimezone = $request->get('user_timezone', config('app.timezone', 'Asia/Jakarta'));

        // Basic Filters
        $chartFilter = $request->get('chart_filter', 'daily');
        $reportFilter = $request->get('report_filter', 'daily');
        $startDateParam = $request->get('start_date');
        $endDateParam = $request->get('end_date');

        // Standardize Global Range for all KPIs and Graphs using User's Timezone
        $range = $this->getGlobalRange($chartFilter, $userTimezone);
        $start = $range['start'];
        $end = $range['end'];

        // Report range (used by the transactions view)
        $reportRange = $this->getReportRange($reportFilter, $startDateParam, $endDateParam, $userTimezone);

        return Inertia::render('Admin/AdminDashboard', [
            // HEAVY BASE DATA
            'products' => Product::select('id', 'name', 'price', 'stock', 'barcode', 'category_id', 'image_url')->get(),
            'categories' => Category::withCount('products')->orderBy('name')->get(),
            'cashiers' => User::cashiers()->select('id', 'name', 'email', 'photo_url')->get(),
            'initialStore' => fn() => Tenant::where('id', $tenantId)->select('id', 'name', 'phone', 'address', 'logo_url', 'tax_enabled', 'tax_percentage')->first(),
            'supabaseToken' => $supabaseToken,

            // DYNAMIC PERFORMANCE DATA (from SalesAnalyticsService)
            'performanceMetrics' => function() use ($chartFilter, $userTimezone, $start, $end) {
                return array_merge(
                    $this->sales->getSummaryStats($start, $end, $userTimezone),
                    [
                        'chartData' => $this->sales->getSalesTrend($chartFilter, $userTimezone),
                        'paymentMethodStats' => $this->sales->getPaymentMethodStats($start, $end, $userTimezone),
                        'categoryStats' => $this->sales->getCategoryPerformance($start, $end, $userTimezone),
                        'peakHours' => $this->sales->getPeakHours($start, $end, $userTimezone),
                        'cashierPerformance' => $this->sales->getCashierPerformance($start, $end, $userTimezone),
                        // These bridge to InventoryService...
                        'inventoryHealth' => $this->inventory->getInventoryHealthStats(),
                        'potensiNilaiJual' => $this->inventory->getInventoryValuation(), 
                    ]
                );
            },

            // DYNAMIC WIDGETS
            'topSellingProducts' => fn() => $this->sales->getTopSellingProducts(5),
            'recentTransactions' => fn() => $this->sales->getRecentTransactions($userTimezone),

            // STATIC WIDGETS (from InventoryService)
            'staticWidgets' => fn() => [
                'lowStockProducts' => $this->inventory->getLowStockAlerts(10),
                'deadStock' => $this->inventory->getDeadStock(5),
            ],

            'transactions' => function() use ($reportRange, $request, $tenantId) {
                $search = $request->get('search');
                $sortBy = $request->get('sort_by', 'created_at');
                $sortDir = $request->get('sort_dir', 'desc');
                
                $query = Transaction::with(['user:id,name', 'items.product:id,name'])
                    ->forTenant($tenantId)
                    ->where('status', 'success')
                    ->filterByDate($reportRange['start'], $reportRange['end']);

                if ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('id', 'LIKE', "%{$search}%")
                          ->orWhereHas('user', function($qu) use ($search) {
                              $qu->where('name', 'LIKE', "%{$search}%");
                          })
                          ->orWhere('payment_method', 'LIKE', "%{$search}%");
                    });
                }
                
                $finalSortDir = in_array(strtolower($sortDir), ['asc', 'desc']) ? $sortDir : 'desc';

                $transactions = $query->orderBy($sortBy, $finalSortDir)
                    ->paginate($request->get('per_page', 12))
                    ->withQueryString();
                
                return TransactionResource::collection($transactions);
            },

            'transactionsSummary' => function() use ($reportRange, $request, $tenantId, $userTimezone) {
                $search = $request->get('search');
                $query = Transaction::forTenant($tenantId)
                    ->where('status', 'success')
                    ->filterByDate($reportRange['start'], $reportRange['end']);

                if ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('id', 'LIKE', "%{$search}%")
                          ->orWhereHas('user', function($qu) use ($search) {
                              $qu->where('name', 'LIKE', "%{$search}%");
                          })
                          ->orWhere('payment_method', 'LIKE', "%{$search}%");
                    });
                }

                $stats = $query->selectRaw('SUM(total_amount) as total_revenue, COUNT(*) as total_count, SUM(tax_amount) as total_tax')->first();
                
                $rawSortDir = $request->get('sort_dir', 'desc');
                $finalSortDir = in_array(strtolower($rawSortDir), ['asc', 'desc']) ? $rawSortDir : 'desc';

                // Calculate comparison period metrics for trend cards
                $growthStats = $this->sales->getSummaryStats($reportRange['start'], $reportRange['end'], $userTimezone);

                return [
                    'total_revenue' => (float) ($stats->total_revenue ?? 0),
                    'total_count' => (int) ($stats->total_count ?? 0),
                    'revenue_formatted' => 'Rp ' . number_format($stats->total_revenue ?? 0, 0, ',', '.'),
                    'total_tax' => (float) ($stats->total_tax ?? 0),
                    'tax_formatted' => 'Rp ' . number_format($stats->total_tax ?? 0, 0, ',', '.'),
                    'sortBy' => $request->get('sort_by', 'created_at'),
                    'sortDir' => $finalSortDir,
                    'revenueGrowth' => (float) ($growthStats['revenueGrowth'] ?? 0),
                    'transactionGrowth' => (float) ($growthStats['transactionGrowth'] ?? 0),
                    'aovGrowth' => (float) ($growthStats['aovGrowth'] ?? 0),
                ];
            },

            'initialFilters' => [
                'chart' => $chartFilter,
                'report' => $reportFilter,
                'start' => $startDateParam,
                'end' => $endDateParam
            ]
        ]);
    }

    public function exportReports(Request $request)
    {
        $user = auth()->user();
        $tenantId = $user->tenant_id;
        $userTimezone = $request->get('user_timezone', config('app.timezone', 'Asia/Jakarta'));
        $reportFilter = $request->get('report_filter', 'daily');
        $startDateParam = $request->get('start_date');
        $endDateParam = $request->get('end_date');
        
        $reportRange = $this->getReportRange($reportFilter, $startDateParam, $endDateParam, $userTimezone);

        $search = $request->get('search');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');

        $query = Transaction::with(['user:id,name', 'items.product:id,name'])
            ->forTenant($tenantId)
            ->where('status', 'success')
            ->filterByDate($reportRange['start'], $reportRange['end']);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('id', 'LIKE', "%{$search}%")
                  ->orWhereHas('user', function($qu) use ($search) {
                      $qu->where('name', 'LIKE', "%{$search}%");
                  })
                  ->orWhere('payment_method', 'LIKE', "%{$search}%");
            });
        }
        
        $finalSortDir = in_array(strtolower($sortDir), ['asc', 'desc']) ? $sortDir : 'desc';

        // NO PAGINATION, fetch ALL for export
        $transactions = $query->orderBy($sortBy, $finalSortDir)->get();

        return response()->json([
            'data' => TransactionResource::collection($transactions)
        ]);
    }

    private function getGlobalRange($filter, $timezone)
    {
        $now = Carbon::now($timezone);
        
        return match ($filter) {
            'monthly' => ['start' => $now->copy()->startOfMonth(), 'end' => $now->copy()],
            'yearly' => ['start' => $now->copy()->startOfYear(), 'end' => $now->copy()],
            default => ['start' => $now->copy()->startOfDay(), 'end' => $now->copy()]
        };
    }

    private function getReportRange($filter, $start = null, $end = null, $timezone = 'UTC')
    {
        $now = Carbon::now($timezone);
        
        return match ($filter) {
            'monthly' => ['start' => $now->copy()->startOfMonth(), 'end' => $now->copy()->endOfMonth()],
            'yearly' => ['start' => $now->copy()->startOfYear(), 'end' => $now->copy()->endOfYear()],
            'custom' => [
                'start' => $start ? Carbon::parse($start, $timezone)->startOfDay() : $now->copy()->startOfDay(),
                'end' => $end ? Carbon::parse($end, $timezone)->endOfDay() : $now->copy()->endOfDay(),
            ],
            default => ['start' => $now->copy()->startOfDay(), 'end' => $now->copy()->endOfDay()]
        };
    }
}
