<?php

namespace App\Http\Controllers;

use App\Models\Municipio;
use App\Models\Departamento;
use App\Models\Barrio;
use App\Models\Empresa;
use App\Models\Conductor;
use App\Models\Vehiculo;
use App\Models\Ruta;
use App\Models\Persona;
use App\Models\License;
use App\Models\User;
use Illuminate\Http\Request;

class SecretariaController extends Controller
{
    /**
     * GET /api/secretaria/estadisticas/resumen
     * Retorna estadísticas resumidas de gestión territorial y operacional
     */
    public function resumen()
    {
        try {
            $data = [
                'municipios' => Municipio::count(),
                'departamentos' => Departamento::count(),
                'barrios' => Barrio::count(),
                'empresas' => Empresa::count(),
                'conductores' => Conductor::count(),
                'vehiculos' => Vehiculo::count(),
                'rutas' => Ruta::count(),
                'personas' => Persona::count(),
                'licencias' => License::count(),
                'usuarios' => User::count(),
            ];

            return response()->json([
                'status' => 'success',
                'data' => $data,
                'timestamp' => now()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/secretaria/estadisticas/detallado
     * Retorna estadísticas detalladas con información por categoría
     */
    public function detallado()
    {
        try {
            $data = [
                'territorial' => [
                    'municipios' => [
                        'total' => Municipio::count(),
                        'activos' => Municipio::where('deleted_at', null)->count(),
                    ],
                    'departamentos' => [
                        'total' => Departamento::count(),
                        'activos' => Departamento::where('deleted_at', null)->count(),
                    ],
                    'barrios' => [
                        'total' => Barrio::count(),
                        'activos' => Barrio::where('deleted_at', null)->count(),
                    ],
                ],
                'transporte' => [
                    'empresas' => [
                        'total' => Empresa::count(),
                        'activas' => Empresa::where('deleted_at', null)->count(),
                    ],
                    'rutas' => [
                        'total' => Ruta::count(),
                        'activas' => Ruta::where('deleted_at', null)->count(),
                    ],
                ],
                'operacional' => [
                    'conductores' => [
                        'total' => Conductor::count(),
                        'activos' => Conductor::where('deleted_at', null)->count(),
                    ],
                    'vehiculos' => [
                        'total' => Vehiculo::count(),
                        'operativos' => Vehiculo::where('deleted_at', null)->count(),
                    ],
                    'licencias' => [
                        'total' => License::count(),
                        'vigentes' => License::where('fecha_vencimiento', '>', now())->where('deleted_at', null)->count(),
                    ],
                ],
                'usuarios' => [
                    'total' => User::count(),
                    'activos' => User::where('deleted_at', null)->count(),
                ],
                'personas' => [
                    'total' => Persona::count(),
                    'activas' => Persona::where('deleted_at', null)->count(),
                ],
            ];

            return response()->json([
                'status' => 'success',
                'data' => $data,
                'timestamp' => now()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
