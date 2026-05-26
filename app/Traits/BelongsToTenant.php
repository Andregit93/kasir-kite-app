<?php

namespace App\Traits;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait BelongsToTenant
{
    /**
     * Boot the trait to apply global scope.
     */
    protected static function bootBelongsToTenant()
    {
        // Otomatis isi tenant_id saat create
        static::creating(function ($model) {
            if (empty($model->tenant_id) && auth()->hasUser()) {
                $model->tenant_id = auth()->user()->tenant_id ?? null;
            }
        });

        // Global scope untuk memfilter data berdasarkan tenant_id user yang sedang login
        static::addGlobalScope('tenant_id', function (Builder $builder) {
            // Hindari infinite loop dengan Auth::hasUser()
            if (auth()->hasUser() && !auth()->user()->isSuperAdmin()) {
                $column = $builder->getModel()->getTable() . '.tenant_id';
                $builder->where($column, auth()->user()->tenant_id);
            }
        });
    }

    /**
     * Scope untuk memfilter berdasarkan tenant_id secara manual.
     */
    public function scopeForTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    /**
     * Relasi ke Tenant
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
