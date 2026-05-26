<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Upgrades fiscal columns to decimal(20, 2) to prevent numeric field overflow.
     */
    public function up(): void
    {
        // 1. Upgrade Products Price
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('price', 20, 2)->change();
        });

        // 2. Upgrade Transactions Total
        Schema::table('transactions', function (Blueprint $table) {
            $table->decimal('total_amount', 20, 2)->change();
        });

        // 3. Upgrade Transaction Items (Price & Subtotal)
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->decimal('price_at_sale', 20, 2)->change();
            $table->decimal('subtotal', 20, 2)->change();
        });
    }

    /**
     * Reverse the migrations.
     * Reverts to decimal(12, 2) - Warning: High-value data will be truncated.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('price', 12, 2)->change();
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->decimal('total_amount', 12, 2)->change();
        });

        Schema::table('transaction_items', function (Blueprint $table) {
            $table->decimal('price_at_sale', 12, 2)->change();
            $table->decimal('subtotal', 12, 2)->change();
        });
    }
};
