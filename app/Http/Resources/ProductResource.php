<?php
/*
 * (c) Andre Se
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'price'       => (float) $this->price,
            'price_formatted' => 'Rp ' . number_format($this->price, 0, ',', '.'),
            'price_in_cents' => (int) round($this->price * 100), // Standard Money Pattern
            'stock'       => $this->stock,
            'barcode'     => $this->barcode,
            'image_url'   => $this->image_url,
            'category_id' => $this->category_id,
            'category'    => [
                'id'    => $this->category->id ?? null,
                'name'  => $this->category->name ?? 'Tanpa Kategori',
                'color' => $this->category->color ?? '#94a3b8',
            ],
        ];
    }
}
