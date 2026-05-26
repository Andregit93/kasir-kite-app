<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->decimal('subtotal', 12, 2)->after('user_id')->nullable();
            $table->decimal('tax_amount', 12, 2)->default(0)->after('subtotal');
            $table->decimal('tax_percentage', 5, 2)->default(0)->after('tax_amount');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'tax_amount', 'tax_percentage']);
        });
    }
};
