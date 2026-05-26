<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        // Gunakan withCount('products') untuk performa, global scope BelongsToTenant akan otomatis handle tenant_id
        $categories = Category::withCount('products')->get();
        return response()->json(['data' => $categories]); 
    }

    public function store(StoreCategoryRequest $request)
    {
        $validated = $request->validated();
        Category::create($validated);
        
        return redirect()->back()->with('success', "Kategori {$validated['name']} berhasil ditambahkan");
    }

    public function update(UpdateCategoryRequest $request, $id)
    {
        // Tanpa manual where('tenant_id'), dihandle global scope
        $category = Category::findOrFail($id);
        
        $category->update($request->validated());
        
        return redirect()->back()->with('success', "Kategori {$category->name} berhasil diperbarui");
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        if ($category->products()->exists()) {
            return redirect()->back()->withErrors([
                'error' => "Kategori tidak dapat dihapus karena masih digunakan pada {$category->products()->count()} produk aktif."
            ]);
        }

        $category->delete();
        
        return redirect()->back()->with('success', "Kategori {$category->name} berhasil dihapus");
    }
}
