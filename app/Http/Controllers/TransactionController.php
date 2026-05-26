<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Services\CheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\Transaction;
use App\Events\TransactionCompleted;

class TransactionController extends Controller
{
    protected $checkoutService;

    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    /**
     * Proses Checkout — Thin Controller implementation.
     */
    public function store(StoreTransactionRequest $request)
    {
        $user = Auth::user();
        
        try {
            $transaction = $this->checkoutService->processCheckout(
                $request->input('items'),
                $request->input('paymentMethod'),
                $user->tenant_id,
                $user->id
            );

            return back()->with('success', [
                'message' => 'Transaksi berhasil diproses!',
                'transactionId' => $transaction->id,
                'totalAmount' => (float) $transaction->total_amount,
                'paymentMethod' => $transaction->payment_method,
            ]);

        } catch (\Exception $e) {
            return back()->withErrors([
                'items' => 'Terjadi kesalahan sistem: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Riwayat Transaksi — Refactored with API Resources & Scopes.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id;
        $filter = $request->get('filter', 'daily');

        $now = Carbon::now('Asia/Jakarta');

        if ($filter === 'custom' && $request->has(['start_date', 'end_date'])) {
            $startDate = Carbon::parse($request->start_date, 'Asia/Jakarta')->startOfDay();
            $endDate = Carbon::parse($request->end_date, 'Asia/Jakarta')->endOfDay();
        } else {
            $startDate = match ($filter) {
                'monthly' => $now->copy()->startOfMonth()->startOfDay(),
                'yearly' => $now->copy()->startOfYear()->startOfDay(),
                default => $now->copy()->startOfDay(),
            };
            
            $endDate = match ($filter) {
                'monthly' => $now->copy()->endOfMonth()->endOfDay(),
                'yearly' => $now->copy()->endOfYear()->endOfDay(),
                default => $now->copy()->endOfDay(),
            };
        }

        // Fetch transactions using Scope & API Resource
        $transactions = Transaction::with(['user:id,name', 'items.product:id,name'])
            ->forTenant($tenantId)
            ->filterByDate($startDate, $endDate)
            ->orderBy('created_at', 'desc')
            ->get();

        $store = \App\Models\Tenant::find($tenantId);

        return Inertia::render('Transaction/History', [
            'transactions' => \App\Http\Resources\TransactionResource::collection($transactions),
            'filter' => $filter,
            'store' => $store,
        ]);
    }

    /**
     * Pembatalan Transaksi (Void) — Inventory Restoration Logic.
     */
    public function void(Transaction $transaction)
    {
        // 1. Authorization check (Ensure it belongs to the tenant)
        if ($transaction->tenant_id !== Auth::user()->tenant_id) {
            abort(403);
        }

        // 2. State check
        if ($transaction->isVoided()) {
            return back()->withErrors(['id' => 'Transaksi ini sudah dibatalkan sebelumnya.']);
        }

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($transaction) {
                // 3. Increment Product Stock for each item
                // Use Eager Loading to avoid N+1 and pessimistic locking on products
                $transaction->load('items.product');

                foreach ($transaction->items as $item) {
                    if ($item->product && !$item->product->hasUnlimitedStock()) {
                        // Atomic increment to restore inventory
                        $item->product->increment('stock', $item->quantity);
                    }
                }

                // 4. Update Transaction Status
                $transaction->update(['status' => 'void']);
            });

            return back()->with('success', [
                'message' => 'Transaksi berhasil dibatalkan! Stok telah dikembalikan ke inventori.',
            ]);

        } catch (\Exception $e) {
            return back()->withErrors([
                'id' => 'Gagal membatalkan transaksi: ' . $e->getMessage(),
            ]);
        }
    }
}
