<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = '00000000-0000-0000-0000-000000000001';
        $cat1 = 'c1000000-0000-0000-0000-000000000001';
        $cat2 = 'c2000000-0000-0000-0000-000000000002';

        $products = [
            [
                'tenant_id' => $tenantId,
                'category_id' => $cat1,
                'name' => 'Beras Pandan Wangi 10kg',
                'price' => 145000,
                'stock' => 20,
                'barcode' => '8991234567890',
            ],
            [
                'tenant_id' => $tenantId,
                'category_id' => $cat1,
                'name' => 'Minyak Goreng SunCo 2L',
                'price' => 38500,
                'stock' => 50,
                'barcode' => '8991234567891',
            ],
            [
                'tenant_id' => $tenantId,
                'category_id' => $cat1,
                'name' => 'Gula Pasir Gulaku 1kg',
                'price' => 17500,
                'stock' => 100,
                'barcode' => '8991234567892',
            ],
            [
                'tenant_id' => $tenantId,
                'category_id' => $cat2,
                'name' => 'Telur Ayam Ras (Per kg)',
                'price' => 28000,
                'stock' => 30, // 30kg
                'barcode' => '8991234567893',
            ],
            [
                'tenant_id' => $tenantId,
                'category_id' => $cat2,
                'name' => 'Tepung Terigu Segitiga Biru 1kg',
                'price' => 12500,
                'stock' => 40,
                'barcode' => '8991234567894',
            ],
        ];

        foreach ($products as $p) {
            Product::create($p);
        }
    }
}
