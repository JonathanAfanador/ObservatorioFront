<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // 1. Verificamos si el usuario actual está autenticado
        if (!$request->user()) {
            return response()->json(['status' => false, 'message' => 'No autorizado. Debe iniciar sesión.'], 401);
        }

        // 2. Obtenemos el rol_id del usuario (relación en el modelo User)
        $userRoleId = $request->user()->rol_id;

        // 3. Verificamos si el rol_id del usuario está dentro de los roles permitidos para esta ruta
        if (!in_array($userRoleId, $roles)) {
            return response()->json([
                'status' => false, 
                'message' => 'Acceso denegado. No tienes permisos para realizar esta acción.'
            ], 403);
        }

        return $next($request);
    }
}
