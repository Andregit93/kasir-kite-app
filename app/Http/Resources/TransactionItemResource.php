<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->product->name ?? 'Produk Dihapus',
            'quantity' => $this->quantity,
            'price' => (float) $this->price_at_sale,
            'price_formatted' => 'Rp ' . number_format($this->price_at_sale, 0, ',', '.'),
            'price_in_cents' => (int) round($this->price_at_sale * 100),
            'subtotal' => (float) $this->subtotal,
            'subtotal_formatted' => 'Rp ' . number_format($this->subtotal, 0, ',', '.'),
            'subtotal_in_cents' => (int) round($this->subtotal * 100),
        ];
    }
}
