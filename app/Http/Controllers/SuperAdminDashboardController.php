<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Transaction;
use Inertia\Inertia;

class SuperAdminDashboardController extends Controller
{
    public function index()
    {
        $tenants = Tenant::withCount('users')->get();

        $stats = [
            'totalTenants' => Tenant::count(),
            'totalUsers' => User::count(),
            'totalTransactions' => Transaction::count(),
            'systemRevenue' => (float) Transaction::sum('total_amount'),
        ];

        return Inertia::render('SuperAdmin/SuperAdminDashboard', [
            'stats' => $stats,
            'tenants' => $tenants->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'phone' => $t->phone,
                'address' => $t->address,
                'logo_url' => $t->logo_url,
                'is_active' => $t->is_active,
                'created_at' => $t->created_at,
                'users_count' => $t->users_count,
            ]),
        ]);
    }
}
