<?php

namespace App\Services;

use Firebase\JWT\JWT;

class SupabaseTokenService
{
    /**
     * Generate a signed JWT for Supabase to authenticate as a specific tenant.
     * Use the SUPABASE_JWT_SECRET from .env to sign the token.
     */
    public function generateToken(string $tenantId): string
    {
        $secret = config('services.supabase.jwt_secret');

        if (!$secret) {
            throw new \Exception('SUPABASE_JWT_SECRET is not set in config/services.php');
        }

        $payload = [
            'aud' => 'authenticated',
            'role' => 'anon', 
            'iss' => 'supabase',
            'iat' => time(),
            'exp' => time() + (2 * 3600),
            'sub' => $tenantId, // Tambahkan kembali sub agar library tidak error
            'tenant_id' => $tenantId,
        ];

        return JWT::encode($payload, $secret, 'HS256');
    }
}
