<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CashierController extends Controller
{
    /**
     * Halaman utama kasir POS.
     * Memuat semua data yang diperlukan dan mengirimnya sebagai Inertia props.
     *
     * Ini menggantikan multiple Axios calls di React lama:
     * - GET /products     → props.products
     * - GET /categories   → props.categories
     * - GET /tenant/profile → props.store
     */
    public function index()
    {
        $user     = Auth::user();
        $tenantId = $user->tenant_id;

        // Fetch products with Scope & API Resource
        $products = \App\Models\Product::with('category:id,name,color')
            ->forTenant($tenantId)
            ->orderBy('created_at', 'desc')
            ->get();

        // Fetch categories scoped to tenant
        $categories = \App\Models\Category::where('tenant_id', $tenantId)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        // Fetch store profile
        $store = $user->tenant()->first(['id', 'name', 'phone', 'address', 'logo_url', 'tax_enabled', 'tax_percentage']);

        return Inertia::render('Cashier/Index', [
            'products'   => \App\Http\Resources\ProductResource::collection($products),
            'categories' => $categories,
            'store'      => $store,
        ]);
    }
}
