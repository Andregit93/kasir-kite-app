<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantId = auth()->user()->tenant_id;
        // Kita tangkap ID dari parameter route, biasanya bernama 'category' atau 'id'
        $categoryId = $this->route('category') ?? $this->route('id');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->ignore($categoryId)->where(function ($query) use ($tenantId) {
                    return $query->where('tenant_id', $tenantId)->whereNull('deleted_at');
                }),
            ],
            'color' => [
                'nullable',
                'string',
                'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'Kategori dengan nama ini sudah ada.',
            'name.required' => 'Nama kategori wajib diisi.',
            'color.regex' => 'Format warna tidak valid. Gunakan format HEX (contoh: #ff0000).',
        ];
    }
}
