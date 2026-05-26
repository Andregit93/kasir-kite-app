<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

echo "App Timezone: " . config('app.timezone') . "\n";
echo "Current Carbon Now: " . Carbon::now()->toDateTimeString() . "\n";
echo "Current DB Timestamp: " . DB::select("SELECT CURRENT_TIMESTAMP")[0]->current_timestamp . "\n";

$t = Transaction::orderBy('created_at', 'desc')->first();
if ($t) {
    echo "Latest Transaction Created At: " . $t->created_at->toDateTimeString() . "\n";
}
