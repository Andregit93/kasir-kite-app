<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class SuperAdminManagementController extends Controller
{
    public function storeTenant(Request $request)
    {
        $validated = $request->validate([
            'storeName' => 'required|string',
            'adminName' => 'required|string',
            'adminEmail' => 'required|email|unique:users,email',
            'adminPassword' => 'required|string|min:6',
        ]);

        DB::transaction(function() use ($validated) {
            $tenant = Tenant::create(['name' => $validated['storeName'], 'is_active' => true]);
            User::create([
                'tenant_id' => $tenant->id,
                'name' => $validated['adminName'],
                'email' => $validated['adminEmail'],
                'password' => Hash::make($validated['adminPassword']),
                'role' => 'store_admin'
            ]);
        });
        
        return redirect()->back()->with('success', 'Toko baru berhasil dibuat!');
    }

    public function getTenantDetails($id)
    {
        // Tetap dirender sebagai JSON karena sering dipanggil via modal di frontend tanpa reload halaman penuh
        // atau jika diubah ke Inertia harus melempar modal state. Kita kembalikan JSON saja untuk yang ini.
        $tenant = Tenant::findOrFail($id);
        $totalProducts = \App\Models\Product::where('tenant_id', $id)->count();
        $totalTransactions = Transaction::where('tenant_id', $id)->count();
        $totalRevenue = (float) Transaction::where('tenant_id', $id)->sum('total_amount');
        
        $recentTransactions = Transaction::where('tenant_id', $id)->orderBy('created_at', 'desc')->limit(5)->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'date' => $t->created_at->format('d M Y H:i'),
                'total' => $t->total_amount,
                'paymentMethod' => $t->payment_method,
            ]);

        $employees = User::where('tenant_id', $id)->get();
        
        return response()->json(['data' => [
            'totalProducts' => $totalProducts,
            'totalTransactions' => $totalTransactions,
            'totalRevenue' => $totalRevenue,
            'recentTransactions' => $recentTransactions,
            'employees' => $employees,
        ]]);
    }

    public function updateTenantName(Request $request, $id)
    {
        $request->validate(['name' => 'required|string']);
        $tenant = Tenant::findOrFail($id);
        $tenant->update(['name' => $request->name]);
        return redirect()->back()->with('success', 'Nama toko berhasil diubah');
    }

    public function updateTenantStatus(Request $request, $id)
    {
        $request->validate(['is_active' => 'required|boolean']);
        $tenant = Tenant::findOrFail($id);
        $tenant->update(['is_active' => $request->is_active]);
        
        $status = $request->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->back()->with('success', "Status toko berhasil {$status}");
    }

    public function resetUserPassword(Request $request, $id)
    {
        $request->validate(['newPassword' => 'required|string|min:6']);
        $user = User::findOrFail($id);
        $user->update(['password' => Hash::make($request->newPassword)]);
        return redirect()->back()->with('success', 'Kata sandi berhasil direset');
    }
}
