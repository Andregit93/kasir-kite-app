#!/bin/bash
# --------------------------------------------------------------------------
# KasirKite Automated Production Deployment Script
# --------------------------------------------------------------------------
# Jalankan skrip ini di server GCP Anda (/var/www/kasir-app/deploy.sh)
# --------------------------------------------------------------------------

set -e # Hentikan eksekusi jika terjadi error pada salah satu baris perintah

echo "=== MEMULAI PROSES DEPLOYMENT KASIRKITE ==="

# Masuk ke direktori root aplikasi
cd /var/www/kasir-app

# Aktifkan mode pemeliharaan (Maintenance Mode)
echo "→ Mengaktifkan mode maintenance..."
php artisan down || true

# Ambil pembaruan kode terbaru dari repositori Git
echo "→ Menarik kode terbaru dari Git..."
git pull origin main

# Instal dependensi PHP produksi
echo "→ Menginstal dependensi Composer (Production)..."
export COMPOSER_ALLOW_SUPERUSER=1
composer install --no-dev --optimize-autoloader --no-interaction

# Instal dependensi Node.js dan kompilasi aset frontend (Vite)
echo "→ Menginstal paket NPM & mem-build aset produksi..."
npm install
npm run build

# Jalankan migrasi database PostgreSQL (Supabase)
echo "→ Menjalankan migrasi database..."
php artisan migrate --force

# Optimalkan cache Laravel untuk kecepatan maksimal di produksi
echo "→ Memperbarui cache konfigurasi & rute Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Muat ulang proses antrean/WebSocket Reverb di Supervisor
echo "→ Memuat ulang server WebSocket Reverb di Supervisor..."
# Catatan Keamanan: Agar baris ini berjalan lancar di CI/CD, tambahkan izin NOPASSWD 
# untuk perintah supervisorctl pada berkas sudoers pengguna deployer Anda.
sudo supervisorctl restart reverb-websocket

# Matikan mode pemeliharaan (Aplikasi kembali Online)
echo "→ Mematikan mode maintenance..."
php artisan up

echo "=== PROSES DEPLOYMENT BERHASIL DISELESAIKAN ==="
