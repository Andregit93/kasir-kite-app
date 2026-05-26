<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$app->boot();

use App\Models\User;
use App\Models\Transaction;
use App\Services\DashboardAnalyticsService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

// 1. Identify a real Admin Toko user
$user = User::where('email', 'admin@gmail.com')->first();
if (!$user) {
    echo "USER NOT FOUND\n";
    exit;
}

// 2. Mock authentication
auth()->login($user);
echo "Logged in as: " . $user->email . " (Tenant: " . $user->tenant_id . ")\n";

// 3. Setup dates exactly like the controller
$now = Carbon::now('Asia/Jakarta');
echo "Current Time (Jakarta): " . $now->toDateTimeString() . "\n";

$start = $now->copy()->startOfDay()->timezone('UTC');
$end = $now->copy()->endOfDay()->timezone('UTC');
echo "Query Window (UTC): " . $start->toDateTimeString() . " to " . $end->toDateTimeString() . "\n";

// 4. Run Analytics with SQL Logging
DB::enableQueryLog();
$service = new DashboardAnalyticsService();
$stats = $service->getSummaryStats($start, $end);

echo "\n--- RAW SQL QUERIES ---\n";
print_r(DB::getQueryLog());

echo "\n--- ANALYTICS RESULTS ---\n";
print_r($stats);

// 5. Compare with manual raw check for this tenant today
$manual = Transaction::where('tenant_id', $user->tenant_id)
    ->whereBetween('created_at', [$start, $end])
    ->sum('total_amount');

echo "\n--- MANUAL RAW VERIFICATION ---\n";
echo "Sum of total_amount for this tenant today: " . $manual . "\n";
