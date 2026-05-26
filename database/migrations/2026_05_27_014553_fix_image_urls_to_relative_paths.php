<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Konversi URL absolut (http://domain/storage/...) menjadi path relatif (/storage/...)
     * agar gambar berfungsi di environment manapun tanpa bergantung pada domain tertentu.
     */
    public function up(): void
    {
        // Fix image_url di tabel products
        // Menghapus prefix domain apapun, menyisakan /storage/...
        DB::table('products')
            ->whereNotNull('image_url')
            ->where('image_url', 'like', 'http%/storage/%')
            ->update([
                'image_url' => DB::raw("'/storage/' || SPLIT_PART(image_url, '/storage/', 2)")
            ]);

        // Fix logo_url di tabel tenants
        DB::table('tenants')
            ->whereNotNull('logo_url')
            ->where('logo_url', 'like', 'http%/storage/%')
            ->update([
                'logo_url' => DB::raw("'/storage/' || SPLIT_PART(logo_url, '/storage/', 2)")
            ]);

        // Fix photo_url di tabel users (foto kasir)
        DB::table('users')
            ->whereNotNull('photo_url')
            ->where('photo_url', 'like', 'http%/storage/%')
            ->update([
                'photo_url' => DB::raw("'/storage/' || SPLIT_PART(photo_url, '/storage/', 2)")
            ]);
    }

    /**
     * Reverse tidak diperlukan — path relatif sudah lebih baik dari path absolut.
     */
    public function down(): void
    {
        // Tidak perlu di-revert
    }
};
