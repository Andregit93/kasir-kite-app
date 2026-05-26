<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    use HasUuids, BelongsToTenant;

    protected $table = 'transactions';

    protected $fillable = [
        'tenant_id',
        'user_id',
        'subtotal',
        'tax_amount',
        'tax_percentage',
        'total_amount',
        'payment_method',
        'status',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'created_at'   => 'datetime',
    ];

    // ──────────────────────────────────────
    // SCOPES
    // ──────────────────────────────────────

    /**
     * Filter transactions by a date range.
     */
    public function scopeFilterByDate($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function isVoided(): bool
    {
        return $this->status === 'void';
    }

    // ──────────────────────────────────────
    // RELATIONSHIPS
    // ──────────────────────────────────────


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }
}
