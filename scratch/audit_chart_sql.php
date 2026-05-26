<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$app->boot();

use App\Models\Transaction;
use App\Services\DashboardAnalyticsService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

$tenantId = '00000000-0000-0000-0000-000000000001';
$admin = App\Models\User::where('tenant_id', $tenantId)->first();
auth()->login($admin);

echo "--- DASHBOARD AUDIT ---\n";
echo "Current Server Time: " . Carbon::now()->toDateTimeString() . "\n";
echo "Current Jakarta Time: " . Carbon::now('Asia/Jakarta')->toDateTimeString() . "\n";

// Audit Large Transactions
$trxs = Transaction::where('tenant_id', $tenantId)
    ->where('total_amount', '>', 1000000)
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get();

echo "\n--- LARGE TRANSACTIONS AUDIT ---\n";
foreach($trxs as $t) {
    echo "ID: " . $t->id . "\n";
    echo "  Raw DB: " . $t->getRawOriginal('created_at') . "\n";
    echo "  Jakarta: " . $t->created_at->timezone('Asia/Jakarta')->toDateTimeString() . "\n";
    echo "  Amount: " . number_format($t->total_amount) . "\n\n";
}

// Trace the Chart SQL
DB::enableQueryLog();
$service = new DashboardAnalyticsService();
$chartData = $service->getSalesTrend('daily');

echo "--- CHART SQL TRACE ---\n";
$queries = DB::getQueryLog();
foreach($queries as $q) {
    echo "SQL: " . $q['query'] . "\n";
    echo "Bindings: " . json_encode($q['bindings']) . "\n\n";
}
