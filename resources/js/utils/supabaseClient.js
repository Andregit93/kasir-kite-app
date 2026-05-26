import { createClient } from '@supabase/supabase-js';

// Mengambil dari file .env frontend (pastikan VITE_SUPABASE_URL dan KEY sudah ada)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Buat instance Supabase hanya jika konfigurasi tersedia
// Ini mencegah crash pada halaman yang tidak memerlukan Supabase
export const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;