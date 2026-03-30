<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckDashboardAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

        $rolId = (int) $user->rol_id;
        $path = $request->path();

        // Mapeo de rutas de dashboard esperadas por ROL
        $dashboards = [
            1 => 'dashboard/admin',
            2 => 'dashboard/secretaria',
            3 => 'dashboard/empresa',
            4 => 'dashboard/upc',
            6 => 'dashboard/admin', // Subadmin usa el panel admin
        ];

        // Determinar a qué dashboard intenta acceder el usuario basándose en el prefijo
        $targetDashboardPrefix = null;
        foreach ($dashboards as $id => $dPath) {
            if (str_starts_with($path, $dPath)) {
                $targetDashboardPrefix = $dPath;
                break;
            }
        }

        // Si la ruta es un dashboard (empieza con dashboard/...)
        if (str_starts_with($path, 'dashboard/')) {
            $expectedPath = $dashboards[$rolId] ?? null;

            // Si el rol no tiene dashboard (ej. Invitado 5), mandarlo al home
            if (!$expectedPath) {
                return redirect('/');
            }

            // Si el dashboard al que entra NO es el que le corresponde
            if (!str_starts_with($path, $expectedPath)) {
                return redirect($expectedPath);
            }
        }

        return $next($request);
    }
}
