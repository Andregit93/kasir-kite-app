<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class TenantProfileController extends Controller
{
    /**
     * Show tenant profile.
     */
    public function show()
    {
        // Inertia usually handles this in the Dashboard Controller Props.
        // Keeping this for generic get requests if needed.
        $tenantId = Auth::user()->tenant_id;
        $tenant = Tenant::find($tenantId);

        return response()->json(['data' => $tenant]);
    }

    /**
     * Update tenant profile dengan optional logo upload.
     */
    public function update(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('TenantProfileController update request parameters:', $request->all());
        \Illuminate\Support\Facades\Log::info('TenantProfileController update hasFile(logo): ' . ($request->hasFile('logo') ? 'yes' : 'no'));
        if ($request->hasFile('logo')) {
            $f = $request->file('logo');
            \Illuminate\Support\Facades\Log::info('TenantProfileController update logo file info:', [
                'name' => $f->getClientOriginalName(),
                'mime' => $f->getClientMimeType(),
                'size' => $f->getSize(),
                'isValid' => $f->isValid(),
                'error' => $f->getError(),
                'errorMessage' => $f->getErrorMessage()
            ]);
        }

        $tenantId = Auth::user()->tenant_id;
        $tenant = Tenant::findOrFail($tenantId);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048', // max 2MB
            'tax_enabled' => 'sometimes|boolean',
            'tax_percentage' => 'sometimes|required|numeric|min:0|max:100',
        ], [
            'name.required' => 'Nama toko wajib diisi.',
            'logo.image' => 'Berkas logo harus berupa gambar.',
            'logo.mimes' => 'Format logo harus berupa JPG, JPEG, PNG, atau WEBP.',
            'logo.max' => 'Ukuran logo maksimal adalah 2MB.',
        ]);

        // Ensure tax_percentage is valid when enabled
        if ($request->has('tax_enabled') && $request->tax_enabled && !$request->filled('tax_percentage')) {
            return back()->withErrors(['tax_percentage' => 'Nilai pajak wajib diisi jika PPN aktif.']);
        }

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $oldLogoUrl = $tenant->logo_url;

            // Delete old logo jika ada
            if ($oldLogoUrl) {
                $oldPath = str_replace('/storage/', '', parse_url($oldLogoUrl, PHP_URL_PATH));
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            // Upload new logo
            $path = $request->file('logo')->store('store_assets/logos', 'public');
            if ($path) {
                $validated['logo_url'] = asset('storage/' . $path);
            }
        }

        $tenant->update($validated);

        $isTaxUpdate = $request->has('tax_enabled') || $request->has('tax_percentage');
        $message = $isTaxUpdate ? 'Pengaturan pajak berhasil diperbarui' : 'Profil toko berhasil diperbarui';

        return back()->with('success', $message);
    }

    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'current_password' => 'required|string',
            'password'         => [
                'required',
                'string',
                'min:8',
                'confirmed',
                \Illuminate\Validation\Rules\Password::min(8)->letters()->mixedCase()->numbers()->symbols()
            ],
        ], [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => 'Password baru minimal harus 8 karakter.',
            'password.letters' => 'Password baru harus mengandung huruf.',
            'password.mixed' => 'Password baru harus mengandung campuran huruf besar dan kecil (A-Z, a-z).',
            'password.numbers' => 'Password baru harus mengandung angka.',
            'password.symbols' => 'Password baru harus mengandung setidaknya satu simbol atau karakter khusus.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'Password saat ini salah.']);
        }

        if (Hash::check($request->password, $user->password)) {
            return back()->withErrors(['password' => 'Password baru tidak boleh sama dengan password saat ini.']);
        }

        // Prevent username or email prefix in password
        $emailPrefix = explode('@', $user->email)[0];
        if (stripos($request->password, $user->name) !== false || stripos($request->password, $emailPrefix) !== false) {
            return back()->withErrors(['password' => 'Password baru tidak boleh mengandung nama atau email Anda.']);
        }

        // Additional custom validations
        
        // 1. Block common weak passwords
        $weakPasswords = [
            'password', 'password123', 'admin123', 'kasirkite', 'kasirkite123', 
            '12345678', '123456789', 'qwertyuiop', 'kasir123', 'superadmin', 'administrator'
        ];
        if (in_array(strtolower($request->password), $weakPasswords)) {
            return back()->withErrors(['password' => 'Password baru terlalu umum dan mudah ditebak. Silakan gunakan kombinasi lain.']);
        }

        // 2. Block sequential characters (e.g. 1234, abcd)
        if (preg_match('/1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|qwer|wert|asdf/i', $request->password)) {
            return back()->withErrors(['password' => 'Password baru tidak boleh mengandung pola urutan karakter yang mudah ditebak (seperti 1234, abcd, atau asdf).']);
        }

        // 3. Block repetitive characters (e.g. aaaa, 1111)
        if (preg_match('/(.)\1\1\1/', $request->password)) {
            return back()->withErrors(['password' => 'Password baru tidak boleh mengandung pengulangan karakter yang sama lebih dari 3 kali berturut-turut (seperti aaaa).']);
        }

        // Update password di Laravel users table
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return back()->with('success', 'Kata sandi berhasil diperbarui');
    }
}
