<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Super Admin (Global)
        User::create([
            'name' => 'Super Admin KasirKite',
            'email' => 'superadmin@kasirkite.id',
            'password' => Hash::make('password123'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        // 2. Admin Toko (Sembako Kite)
        User::create([
            'tenant_id' => '00000000-0000-0000-0000-000000000001',
            'name' => 'Admin Sembako Kite',
            'email' => 'admin@sembakokite.com',
            'password' => Hash::make('password123'),
            'role' => 'store_admin',
            'is_active' => true,
        ]);

        // 3. Kasir (Sembako Kite)
        User::create([
            'tenant_id' => '00000000-0000-0000-0000-000000000001',
            'name' => 'Kasir Sembako Kite',
            'email' => 'kasir1@sembakokite.com',
            'password' => Hash::make('password123'),
            'role' => 'cashier',
            'is_active' => true,
        ]);
    }
}
