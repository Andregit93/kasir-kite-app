<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * CheckoutService - Atomic Financial Processing Layer.
 * Strictly focuses on data persistence and stock integrity using Pessimistic Locking.
 */
class CheckoutService
{
    /**
     * Process checkout in a single atomic database transaction.
     * Guaranteed safe from race conditions via SELECT FOR UPDATE.
     *
     * @param array $items
     * @param string $paymentMethod
     * @param string $tenantId
     * @param string $userId
     * @return Transaction
     * @throws ValidationException
     */
    public function processCheckout(array $items, string $paymentMethod, string $tenantId, string $userId): Transaction
    {
        return DB::transaction(function () use ($items, $tenantId, $userId, $paymentMethod) {
            
            // 1. Fetch products with PESSIMISTIC LOCKING to prevent TOCTOU race conditions
            $productIds = collect($items)->pluck('productId')->toArray();
            $dbProducts = Product::whereIn('id', $productIds)
                ->where('tenant_id', $tenantId)
                ->lockForUpdate() // Authoritative lock
                ->get()
                ->keyBy('id');

            $totalAmount = 0;
            $transactionItemsData = [];
            $stockUpdates = [];

            // 2. Authoritative Verification & Calculation
            foreach ($items as $item) {
                $product = $dbProducts->get($item['productId']);

                // Final safety check (should be caught by FormRequest, but here for double-security)
                if (!$product) {
                    throw ValidationException::withMessages(['items' => "Terjadi inkonsistensi data: Produk tidak ditemukan."]);
                }

                // AUTHORITATIVE Stock Check (Under Lock)
                if (!$product->hasSufficientStock($item['quantity'])) {
                    throw ValidationException::withMessages([
                        'items' => "Gagal Konfirmasi! Stok '{$product->name}' baru saja berubah dan tidak mencukupi."
                    ]);
                }

                // Calculation from trusted DB Price
                $subtotal = $product->price * $item['quantity'];
                $totalAmount += $subtotal;

                $transactionItemsData[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price_at_sale' => $product->price,
                    'subtotal' => $subtotal,
                ];

                // Prepare for Inventory Update
                if (!$product->hasUnlimitedStock()) {
                    $stockUpdates[] = [
                        'id' => $product->id,
                        'qtyToDeduct' => $item['quantity'],
                    ];
                }
            }

            // 2.5 Fetch Tenant Tax Settings
            $tenant = DB::table('tenants')->where('id', $tenantId)->first(['tax_enabled', 'tax_percentage']);
            $taxRate = ($tenant && $tenant->tax_enabled) ? (float) $tenant->tax_percentage : 0;
            $taxAmount = round($totalAmount * $taxRate / 100);
            $grandTotal = $totalAmount + $taxAmount;

            // 3. Persist Root Transaction
            $transaction = Transaction::create([
                'tenant_id' => $tenantId,
                'user_id' => $userId,
                'subtotal' => $totalAmount,
                'tax_amount' => $taxAmount,
                'tax_percentage' => $taxRate,
                'total_amount' => $grandTotal,
                'payment_method' => $paymentMethod,
            ]);

            // 4. Persist Transaction Details
            foreach ($transactionItemsData as $itemData) {
                $transaction->items()->create($itemData);
            }

            // 5. Atomic Stock Deduction
            foreach ($stockUpdates as $update) {
                Product::withoutGlobalScopes()
                    ->where('id', $update['id'])
                    ->decrement('stock', $update['qtyToDeduct']); // Atomic decrement
            }

            return $transaction;
        });
    }
}
