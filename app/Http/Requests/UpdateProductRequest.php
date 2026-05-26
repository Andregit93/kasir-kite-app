<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('price')) {
            // Strip Indonesian thousand separator (dots) e.g. "1.500.000" → "1500000"
            $this->merge([
                'price' => preg_replace('/[^\d]/', '', $this->price),
            ]);
        }
    }

    public function rules(): array
    {
        $tenantId = auth()->user()->tenant_id;
        $productId = $this->route('product') ?? $this->route('id');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products')->where(function ($query) use ($tenantId) {
                    return $query->where('tenant_id', $tenantId)->whereNull('deleted_at');
                })->ignore($productId),
            ],
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:-1',
            'barcode' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('products')->where(function ($query) use ($tenantId) {
                    return $query->where('tenant_id', $tenantId)->whereNull('deleted_at');
                })->ignore($productId),
            ],
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|mimes:jpg,jpeg,png,webp|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'Nama produk ini sudah ada di toko Anda.',
            'barcode.unique' => 'Barcode ini sudah digunakan oleh produk lain.',
            'name.required' => 'Nama produk wajib diisi.',
            'price.required' => 'Harga wajib diisi.',
            'stock.required' => 'Stok wajib diisi.',
            'image.mimes' => 'Format gambar harus berupa: jpg, jpeg, png, atau webp.',
            'image.max' => 'Ukuran gambar maksimal adalah 2MB.',
        ];
    }
}
