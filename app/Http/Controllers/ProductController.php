<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Handle image upload dari request menggunakan Local Storage (public disk).
     */
    protected function handleImageUpload(Request $request, ?string $oldImageUrl = null): ?string
    {
        if (!$request->hasFile('image')) {
            return $oldImageUrl;
        }

        $file = $request->file('image');

        // Delete old image jika ada
        if ($oldImageUrl) {
            $oldPath = str_replace('/storage/', '', parse_url($oldImageUrl, PHP_URL_PATH));
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        // Upload new image
        $path = $file->store('store_assets', 'public');

        if ($path) {
            return '/storage/' . $path;
        }

        return null;
    }

    /**
     * Store product baru dengan optional image upload.
     */
    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();

        // Handle image upload
        $imageUrl = $this->handleImageUpload($request);
        $validated['image_url'] = $imageUrl;

        // Generate barcode jika tidak ada
        if (empty($validated['barcode'])) {
            $validated['barcode'] = 'KS-' . strtoupper(uniqid());
        }

        Product::create($validated);

        return redirect()->back()->with('success', "Produk {$validated['name']} berhasil ditambahkan");
    }

    /**
     * Update product dengan optional image upload.
     */
    public function update(UpdateProductRequest $request, $id)
    {
        $product = Product::findOrFail($id);
        $oldImageUrl = $product->image_url;

        $validated = $request->validated();

        // Handle image upload (akan delete old image)
        if ($request->hasFile('image')) {
            $validated['image_url'] = $this->handleImageUpload($request, $oldImageUrl);
        }

        $product->update($validated);

        return redirect()->back()->with('success', "Produk {$product->name} berhasil diperbarui");
    }

    /**
     * Delete product.
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        // Native SoftDeletes will handle the deletion gracefully
        $product->delete();

        return redirect()->back()->with('success', "Produk {$product->name} berhasil dihapus");
    }
}
