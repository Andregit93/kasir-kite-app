<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        // Handle timezone conversion here for enterprise consistency
        $wibDate = Carbon::parse($this->created_at)
            ->timezone('Asia/Jakarta');

        return [
            'id' => $this->id,
            'display_id' => 'TRX-' . strtoupper(substr($this->id, 0, 6)),
            'date' => $wibDate->format('d M Y H:i') . ' WIB',
            'created_at' => $this->created_at,
            'cashier' => $this->user->name ?? 'Kasir',
            'paymentMethod' => $this->payment_method ?? 'cash',
            'status' => $this->status ?? 'success',
            'is_voided' => $this->status === 'void',
            
            // Totals
            'subtotal' => (float) $this->subtotal,
            'subtotal_formatted' => 'Rp ' . number_format($this->subtotal, 0, ',', '.'),
            'tax_amount' => (float) $this->tax_amount,
            'tax_percentage' => (float) $this->tax_percentage,
            'total' => (float) $this->total_amount,
            'total_formatted' => 'Rp ' . number_format($this->total_amount, 0, ',', '.'),
            'total_in_cents' => (int) round($this->total_amount * 100),

            // Nested Relationships
            'items_list' => TransactionItemResource::collection($this->whenLoaded('items')),
            
            // Flattened summary for simple list views
            'items_summary' => $this->whenLoaded('items', function() {
                return $this->items->map(function ($item) {
                    $productName = $item->product->name ?? 'Produk Dihapus';
                    return "{$productName} ({$item->quantity}x)";
                })->join(', ');
            }, 'Tidak ada detail'),
        ];
    }
}
