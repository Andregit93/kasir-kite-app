<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

$now = Carbon::now('Asia/Jakarta');
echo "Current Time (Jakarta): " . $now->toDateTimeString() . "\n";

$start = $now->copy()->startOfDay()->timezone('UTC');
$end = $now->copy()->endOfDay()->timezone('UTC');

echo "Today Range (UTC): " . $start->toDateTimeString() . " to " . $end->toDateTimeString() . "\n";

$countToday = Transaction::withoutGlobalScopes()->whereBetween('created_at', [$start, $end])->count();
echo "Transactions Today (All Tenants): $countToday\n";

$durationInSeconds = $end->diffInSeconds($start);
$prevStart = $start->copy()->subSeconds($durationInSeconds + 1);
$prevEnd = $start->copy()->subSecond();

echo "Yesterday Range (UTC): " . $prevStart->toDateTimeString() . " to " . $prevEnd->toDateTimeString() . "\n";

$countYesterday = Transaction::withoutGlobalScopes()->whereBetween('created_at', [$prevStart, $prevEnd])->count();
echo "Transactions Yesterday (All Tenants): $countYesterday\n";

// Check with User's Tenant (Assuming superadmin or first tenant)
$tenantId = DB::table('tenants')->first()->id ?? null;
if ($tenantId) {
    echo "\nChecking for Tenant: $tenantId\n";
    $tToday = Transaction::withoutGlobalScopes()->where('tenant_id', $tenantId)->whereBetween('created_at', [$start, $end])->count();
    $tYesterday = Transaction::withoutGlobalScopes()->where('tenant_id', $tenantId)->whereBetween('created_at', [$prevStart, $prevEnd])->count();
    echo "Transactions Today: $tToday\n";
    echo "Transactions Yesterday: $tYesterday\n";
}
