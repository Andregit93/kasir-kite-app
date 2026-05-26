<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id'        => $request->user()->id,
                    'name'      => $request->user()->name,
                    'email'     => $request->user()->email,
                    'role'      => $request->user()->role,
                    'photo_url' => $request->user()->photo_url,
                    'tenant_id' => $request->user()->tenant_id,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'welcome' => fn () => $request->session()->get('welcome'),
            ],

        ]);
    }
}
