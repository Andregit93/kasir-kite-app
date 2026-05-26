<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionItem extends Model
{
    use HasUuids;

    protected $table = 'transaction_items';

    protected $fillable = [
        'transaction_id',
        'product_id',
        'quantity',
        'price_at_sale',
        'subtotal',
    ];

    protected $casts = [
        'quantity'      => 'integer',
        'price_at_sale' => 'decimal:2',
        'subtotal'      => 'decimal:2',
    ];

    // ──────────────────────────────────────
    // RELATIONSHIPS
    // ──────────────────────────────────────

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }
}
