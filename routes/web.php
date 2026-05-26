<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CashierController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\SuperAdminDashboardController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TenantProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SuperAdminManagementController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Rute utama aplikasi KasirKite (Laravel + Inertia.js)
|
*/

// ──────────────────────────────────────
// PUBLIC ROUTES (Guest)
// ──────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

// ──────────────────────────────────────
// PROTECTED ROUTES (Authenticated)
// ──────────────────────────────────────
Route::middleware('auth')->group(function () {

    // Redirect root ke halaman sesuai role
    Route::get('/', function () {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();
        session()->reflash(); // Preserve welcome flash for the next redirect

        return match ($user->role) {
            'super_admin' => redirect()->route('superadmin.index'),
            'store_admin' => redirect()->route('admin.index'),
            'cashier'     => redirect()->route('cashier.index'),
            default       => abort(403, 'Akses tidak sah. Peran pengguna tidak dikenali.'),
        };
    });

    // ──────────────────────────────────────
    // ROLE-BASED GROUPS (PROFESSIONAL ENDPOINTS)
    // ──────────────────────────────────────

    // 1. SUPER ADMIN ONLY
    Route::middleware('role:super_admin')->prefix('super-admin')->group(function () {
        Route::get('/', [SuperAdminDashboardController::class, 'index'])->name('superadmin.index');

        // XHR APIs for Super Admin Dashboard
        Route::post('/tenants', [SuperAdminManagementController::class, 'storeTenant']);
        Route::get('/tenants/{id}/details', [SuperAdminManagementController::class, 'getTenantDetails']);
        Route::put('/tenants/{id}/name', [SuperAdminManagementController::class, 'updateTenantName']);
        Route::put('/tenants/{id}/status', [SuperAdminManagementController::class, 'updateTenantStatus']);
        Route::put('/users/{userId}/reset-password', [SuperAdminManagementController::class, 'resetUserPassword']);
    });

    // 2. STORE ADMIN ONLY
    Route::middleware('role:store_admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.index');
        Route::get('/dashboard/reports/export', [AdminDashboardController::class, 'exportReports']);

        // Management APIs
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);


        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        Route::get('/profile', [TenantProfileController::class, 'show']);
        Route::post('/profile', [TenantProfileController::class, 'update']); // Some forms might use POST for profile updates with files
        Route::put('/profile', [TenantProfileController::class, 'update']);
        Route::put('/security/password', [TenantProfileController::class, 'updatePassword']);

        Route::get('/cashiers', [UserController::class, 'getCashiers']);
        Route::post('/cashiers', [UserController::class, 'storeCashier']);
        Route::put('/cashiers/{id}', [UserController::class, 'updateCashier']);
        Route::delete('/cashiers/{id}', [UserController::class, 'destroyCashier']);

        Route::get('/reports/daily', [ReportController::class, 'getDaily']);
        Route::get('/reports/widgets', [ReportController::class, 'getWidgets']);
    });

    // 3. CASHIER / POS ONLY
    Route::middleware('role:cashier')->prefix('pos')->group(function () {
        Route::get('/', [CashierController::class, 'index'])->name('cashier.index');
        Route::post('/checkout', [TransactionController::class, 'store'])->name('transaction.store');
    });

    // 4. SHARED (ADMIN & CASHIER)
    Route::middleware('role:store_admin,cashier')->prefix('pos')->group(function () {
        Route::get('/transactions', [TransactionController::class, 'index'])->name('transaction.index');
        Route::post('/transactions/{transaction}/void', [TransactionController::class, 'void'])->name('transaction.void');
    });

    // Logout
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});
