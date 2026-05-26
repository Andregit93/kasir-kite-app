<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Tampilkan halaman login modern (Split-screen).
     */
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Proses login (Enterprise-grade with Throttling & Validation).
     */
    public function login(LoginRequest $request)
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        // Redirect based on role with welcome flash
        return match ($user->role) {
            'super_admin' => redirect()->intended(route('superadmin.index'))->with('welcome', true),
            'store_admin' => redirect()->intended(route('admin.index'))->with('welcome', true),
            'cashier'     => redirect()->intended(route('cashier.index'))->with('welcome', true),
            default       => redirect()->intended(route('login'))->with('welcome', true),
        };

    }

    /**
     * Logout dan hapus session.
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
