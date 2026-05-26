<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Transaction;

echo "Transaction Counts by Date (UTC):\n";
Transaction::withoutGlobalScopes()
    ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
    ->groupBy('date')
    ->orderBy('date', 'desc')
    ->get()
    ->each(function($t) {
        echo "Date: " . $t->date . " | Count: " . $t->count . "\n";
    });
