<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasUuids, BelongsToTenant, SoftDeletes;

    protected $table = 'products';

    protected $fillable = [
        'id',
        'tenant_id',
        'category_id',
        'name',
        'price',
        'stock',
        'barcode',
        'image_url',
        'is_active',
    ];

    protected $casts = [
        'price'     => 'decimal:2',
        'stock'     => 'integer',
    ];


    // ──────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────

    public function hasUnlimitedStock(): bool
    {
        return $this->stock === -1;
    }

    public function hasSufficientStock(int $quantity): bool
    {
        return $this->hasUnlimitedStock() || $this->stock >= $quantity;
    }

    // ──────────────────────────────────────
    // RELATIONSHIPS
    // ──────────────────────────────────────


    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function transactionItems(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }
}
