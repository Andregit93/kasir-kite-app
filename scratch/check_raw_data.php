<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Transaction;

$latest = Transaction::orderBy('created_at', 'desc')->limit(5)->get();

echo "RAW DATABASE INSPECTION:\n";
echo "Current App Timezone: " . config('app.timezone') . "\n";
echo "--------------------------------------------------\n";

foreach ($latest as $t) {
    echo "ID: " . $t->id . "\n";
    echo "Raw created_at (string): " . $t->getRawOriginal('created_at') . "\n";
    echo "Carbon created_at : " . $t->created_at->toDateTimeString() . " (" . $t->created_at->timezoneName . ")\n";
    echo "--------------------------------------------------\n";
}
