<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Store new cashier.
     */
    public function storeCashier(Request $request)
    {
        $tenantId = Auth::user()->tenant_id;

        Log::info('storeCashier request parameters:', $request->all());
        Log::info('storeCashier hasFile(photo): ' . ($request->hasFile('photo') ? 'yes' : 'no'));
        if ($request->hasFile('photo')) {
            Log::info('storeCashier photo file info:', [
                'originalName' => $request->file('photo')->getClientOriginalName(),
                'mimeType' => $request->file('photo')->getClientMimeType(),
                'size' => $request->file('photo')->getSize(),
                'error' => $request->file('photo')->getError(),
                'isValid' => $request->file('photo')->isValid(),
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required', 'email', 
                Rule::unique('users', 'email')->whereNull('deleted_at')
            ],
            'password' => 'required|string|min:6',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah digunakan.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 6 karakter.',
            'photo.image' => 'Berkas yang diunggah harus berupa gambar.',
            'photo.mimes' => 'Format foto harus berupa: jpg, jpeg, png, atau webp.',
            'photo.max' => 'Ukuran foto maksimal adalah 2MB.',
        ]);

        // Handle photo upload
        $photoUrl = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('store_assets/photos', 'public');
            if ($path) {
                $photoUrl = asset('storage/' . $path);
            }
        }

        $validated['tenant_id'] = $tenantId;
        $validated['role'] = 'cashier';
        $validated['password'] = Hash::make($validated['password']);
        $validated['photo_url'] = $photoUrl;

        // Clean up: remove 'photo' file object before database operation
        $userData = collect($validated)->except(['photo'])->toArray();

        User::create($userData);

        return back()->with('success', "Akses kasir {$validated['name']} berhasil ditambahkan");
    }

    /**
     * Update cashier.
     */
    public function updateCashier(Request $request, $id)
    {
        $tenantId = Auth::user()->tenant_id;
        $user = User::where('tenant_id', $tenantId)->cashiers()->findOrFail($id);

        Log::info('updateCashier request parameters:', $request->all());
        Log::info('updateCashier $_FILES:', $_FILES);
        Log::info('updateCashier hasFile(photo): ' . ($request->hasFile('photo') ? 'yes' : 'no'));
        if ($request->hasFile('photo')) {
            Log::info('updateCashier photo file info:', [
                'originalName' => $request->file('photo')->getClientOriginalName(),
                'mimeType' => $request->file('photo')->getClientMimeType(),
                'size' => $request->file('photo')->getSize(),
                'error' => $request->file('photo')->getError(),
                'isValid' => $request->file('photo')->isValid(),
            ]);
        } else if ($request->file('photo')) {
            Log::info('updateCashier photo invalid file info:', [
                'error' => $request->file('photo')->getError(),
                'errorMessage' => $request->file('photo')->getErrorMessage(),
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required', 'email', 
                Rule::unique('users', 'email')->ignore($id)->whereNull('deleted_at')
            ],
            'password' => 'nullable|string|min:6',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah digunakan.',
            'password.min' => 'Password minimal 6 karakter.',
            'photo.image' => 'Berkas yang diunggah harus berupa gambar.',
            'photo.mimes' => 'Format foto harus berupa: jpg, jpeg, png, atau webp.',
            'photo.max' => 'Ukuran foto maksimal adalah 2MB.',
        ]);

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $oldPhotoUrl = $user->photo_url;

            // Delete old photo jika ada
            if ($oldPhotoUrl) {
                $oldPath = str_replace('/storage/', '', parse_url($oldPhotoUrl, PHP_URL_PATH));
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            // Upload new photo
            $path = $request->file('photo')->store('store_assets/photos', 'public');
            if ($path) {
                $validated['photo_url'] = asset('storage/' . $path);
            }
        }

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        // Clean up: remove 'photo' file object before database operation
        $userData = collect($validated)->except(['photo'])->toArray();

        $user->update($userData);

        return back()->with('success', "Profil kasir {$user->name} berhasil diperbarui");
    }

    /**
     * Delete cashier (soft delete dengan set is_active = false).
     */
    public function destroyCashier($id)
    {
        $tenantId = Auth::user()->tenant_id;
        $user = User::where('tenant_id', $tenantId)->cashiers()->findOrFail($id);

        // Soft delete
        $user->delete();

        return back()->with('success', "Akses kasir {$user->name} berhasil dicabut");
    }
}
