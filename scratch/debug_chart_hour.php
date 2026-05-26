<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$app->boot();

use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

$sample = Transaction::where('tenant_id', '00000000-0000-0000-0000-000000000001')
    ->orderBy('created_at', 'desc')
    ->first();

if (!$sample) {
    die("No transactions found.");
}

echo "Transaction WIB Time: " . $sample->created_at->timezone('Asia/Jakarta')->toDateTimeString() . "\n";
echo "Transaction UTC Time: " . $sample->created_at->timezone('UTC')->toDateTimeString() . "\n";

$queries = [
    "A (Direct)" => "SELECT EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Jakarta') as hr FROM transactions WHERE id = ?",
    "B (Double)" => "SELECT EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') as hr FROM transactions WHERE id = ?",
    "C (None)"   => "SELECT EXTRACT(HOUR FROM created_at) as hr FROM transactions WHERE id = ?",
    "D (UTC Only)" => "SELECT EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC') as hr FROM transactions WHERE id = ?"
];

foreach ($queries as $label => $sql) {
    $res = DB::select($sql, [$sample->id]);
    echo "$label -> Result Hour: " . $res[0]->hr . "\n";
}
