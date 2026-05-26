<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string[]  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // Jika user memiliki salah satu role yang diizinkan, izinkan permintaan berlanjut
        if (in_array($user->role, $roles)) {
            return $next($request);
        }

        // Jika tidak diizinkan, arahkan ke dashboard masing-masing untuk mencegah loop
        $redirectPath = match ($user->role) {
            'super_admin' => '/super-admin',
            'store_admin' => '/admin/dashboard',
            'cashier'     => '/pos',
            default       => '/login',
        };

        // Safety check: Jika sudah di path tujuan tapi role tidak cocok di middleware ini, 
        // kita hentikan loop dengan membiarkan request lewat (atau abort 403)
        if ($request->is(trim($redirectPath, '/')) || $request->is(trim($redirectPath, '/') . '/*')) {
            return $next($request);
        }

        // Jika role tidak dikenal dan kita tidak di path tujuan,
        // berikan 403 untuk mencegah loop redirect ke /login yang mengirim balik ke /
        if ($redirectPath === '/login') {
            abort(403, 'Anda tidak memiliki peran yang valid untuk mengakses halaman ini.');
        }

        return redirect($redirectPath)->with('error', 'Akses ditolak. Anda dialihkan ke dashboard Anda.');
    }
}
