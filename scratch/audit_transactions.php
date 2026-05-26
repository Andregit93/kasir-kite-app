<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$app->boot();

use App\Models\Transaction;
use Carbon\Carbon;

$tenantId = '00000000-0000-0000-0000-000000000001';
$now = Carbon::now('Asia/Jakarta');

$start = $now->copy()->startOfDay()->timezone('UTC');
$end = $now->copy()->endOfDay()->timezone('UTC');

echo "--- DEBUG INFO ---\n";
echo "Current App Time (Jakarta): " . $now->toDateTimeString() . "\n";
echo "Query Start (UTC): " . $start->toDateTimeString() . "\n";
echo "Query End (UTC): " . $end->toDateTimeString() . "\n";

$trxs = Transaction::where('tenant_id', $tenantId)
    ->whereBetween('created_at', [$start, $end])
    ->get();

echo "\n--- TRANSACTIONS FOUND TODAY (" . $trxs->count() . ") ---\n";
foreach($trxs as $t) {
    echo "ID: " . substr($t->id, 0, 8) . "... | Created At (UTC): " . $t->created_at . " | In Jakarta: " . $t->created_at->timezone('Asia/Jakarta')->toDateTimeString() . " | Amount: " . $t->total_amount . "\n";
}

echo "\nTotal Revenue for this window: " . $trxs->sum('total_amount') . "\n";
