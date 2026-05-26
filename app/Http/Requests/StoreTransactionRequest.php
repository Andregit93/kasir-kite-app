<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Product;

/**
 * StoreTransactionRequest - Advanced Validation & IDOR Protection.
 * Ensures data integrity before hitting the CheckoutService.
 */
class StoreTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Must be authenticated to checkout
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $tenantId = $this->user()->tenant_id;

        return [
            // Root validation
            'items' => 'required|array|min:1',
            
            // Item-level "Optimistic" Validation
            'items.*.productId' => [
                'required', 
                'uuid',
                function ($attribute, $value, $fail) use ($tenantId) {
                    // IDOR Protection: Product must belong to the active tenant
                    $product = Product::where('id', $value)
                        ->where('tenant_id', $tenantId)
                        ->first(['id', 'name', 'stock']);

                    if (!$product) {
                        return $fail('Salah satu produk tidak valid atau bukan milik toko Anda.');
                    }

                    // Pre-flight "Optimistic" Stock Check 
                    // (The authoritative check remains inside the DB transaction in Service)
                    $index = explode('.', $attribute)[1];
                    $qty = $this->input("items.{$index}.quantity");

                    if ($product->stock !== -1 && $product->stock < $qty) {
                        return $fail("Stok '{$product->name}' saat ini tidak mencukupi untuk pesanan ini.");
                    }
                },
            ],
            
            'items.*.quantity' => 'required|integer|min:1',
            'paymentMethod' => 'required|string|in:cash,qris,transfer',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'items.required' => 'Keranjang belanja tidak boleh kosong.',
            'items.min' => 'Keranjang belanja minimal harus berisi 1 produk.',
            'paymentMethod.required' => 'Metode pembayaran harus dipilih.',
            'items.*.quantity.min' => 'Kuantitas produk minimal 1.',
        ];
    }
}
