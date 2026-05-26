<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use HasUuids;

    protected $table = 'tenants';

    protected $fillable = [
        'id',
        'name',
        'phone',
        'address',
        'logo_url',
        'is_active',
        'tax_enabled',
        'tax_percentage',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'tax_enabled' => 'boolean',
        'tax_percentage' => 'float',
    ];

    // ──────────────────────────────────────
    // RELATIONSHIPS
    // ──────────────────────────────────────

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
