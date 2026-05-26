<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\UploadedFile;

class SupabaseStorageService
{
    protected string $baseUrl;
    protected string $anonKey;
    protected string $storageUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.supabase.url');
        $this->anonKey = config('services.supabase.anon_key');
        $this->storageUrl = "{$this->baseUrl}/storage/v1";
    }

    /**
     * Upload file ke Supabase Storage bucket.
     *
     * @param UploadedFile $file File yang akan diupload
     * @param string $bucket Nama bucket (default: store_assets)
     * @param string $path Path di dalam bucket (default: random filename)
     * @return array ['success' => bool, 'url' => string|null, 'error' => string|null]
     */
    public function upload(UploadedFile $file, string $bucket = 'store_assets', ?string $path = null): array
    {
        try {
            $fileName = $path ?? $this->generateFileName($file);
            $fullPath = "{$bucket}/{$fileName}";

            $contents = file_get_contents($file->getRealPath());

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->anonKey}",
                'apikey' => $this->anonKey,
                'Content-Type' => $file->getMimeType(),
                'Prefer' => 'bypass-cache',
            ])->body($contents)->post("{$this->storageUrl}/objects/{$fullPath}");

            if ($response->successful()) {
                $publicUrl = "{$this->storageUrl}/object/public/{$fullPath}";
                return ['success' => true, 'url' => $publicUrl, 'error' => null, 'path' => $fullPath];
            }

            return [
                'success' => false,
                'url' => null,
                'path' => null,
                'error' => $response->json('message') ?? 'Upload gagal',
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'url' => null,
                'path' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Delete file dari Supabase Storage bucket.
     */
    public function delete(string $bucket, string $path): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->anonKey}",
                'apikey' => $this->anonKey,
            ])->delete("{$this->storageUrl}/objects/{$bucket}", [
                'prefixes' => [$path],
            ]);

            if ($response->successful()) {
                return ['success' => true, 'error' => null];
            }

            return [
                'success' => false,
                'error' => $response->json('message') ?? 'Delete gagal',
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get public URL untuk file di bucket.
     */
    public function getPublicUrl(string $bucket, string $path): string
    {
        return "{$this->storageUrl}/object/public/{$bucket}/{$path}";
    }

    /**
     * Generate unique filename.
     */
    protected function generateFileName(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $filename = uniqid() . '_' . time() . '.' . $extension;

        // Organize by date
        $datePath = date('Y/m/d');

        return "{$datePath}/{$filename}";
    }
}
