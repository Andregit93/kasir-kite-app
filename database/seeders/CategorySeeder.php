<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = '00000000-0000-0000-0000-000000000001';

        Category::create([
            'id' => 'c1000000-0000-0000-0000-000000000001',
            'tenant_id' => $tenantId,
            'name' => 'Sembako & Bahan Pokok',
            'color' => '#3b82f6',
        ]);

        Category::create([
            'id' => 'c2000000-0000-0000-0000-000000000002',
            'tenant_id' => $tenantId,
            'name' => 'Bumbu & Bahan Dapur',
            'color' => '#10b981',
        ]);
    }
}
