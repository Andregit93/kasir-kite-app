<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasUuids, Notifiable, BelongsToTenant, SoftDeletes;

    protected $table = 'users';

    /**
     * The attributes that are mass assignable.
     * Note: password column exists for Laravel compatibility but auth is via Supabase Auth API.
     */
    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'password',
        'role',
        'photo_url',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'is_active' => 'boolean',
        'email_verified_at' => 'datetime',
    ];


    // ──────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isStoreAdmin(): bool
    {
        return $this->role === 'store_admin';
    }

    public function isCashier(): bool
    {
        return $this->role === 'cashier';
    }

    /**
     * Check if user has active tenant.
     */
    public function hasActiveTenant(): bool
    {
        return $this->tenant && $this->tenant->is_active;
    }

    // ──────────────────────────────────────
    // SCOPES
    // ──────────────────────────────────────


    public function scopeCashiers($query)
    {
        return $query->where('role', 'cashier');
    }

    public function scopeStoreAdmins($query)
    {
        return $query->where('role', 'store_admin');
    }

    // ──────────────────────────────────────
    // RELATIONSHIPS
    // ──────────────────────────────────────


    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
