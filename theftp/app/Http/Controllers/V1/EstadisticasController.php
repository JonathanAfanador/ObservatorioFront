<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Models\empresas;
use App\Models\conductores;
use App\Models\vehiculo;
use App\Models\rutas;
use App\Models\tipo_ident;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EstadisticasController extends Controller
{
    /**
     * Obtener resumen de estadísticas (números totales)
     */
    public function resumen()
    {
        // Validar que el usuario sea UPC
        $user = Auth::user();
        if (!$user || $user->rol->descripcion !== 'UPC') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        return response()->json([
            'empresas' => empresas::count(),
            'conductores' => conductores::count(),
            'vehiculos' => vehiculo::count(),
            'rutas' => rutas::count(),
        ]);
    }

    /**
     * Obtener estadísticas detalladas para gráficos
     */
    public function detallado()
    {
        // Validar que el usuario sea UPC
        $user = Auth::user();
        if (!$user || $user->rol->descripcion !== 'UPC') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // Estadísticas de vehículos por tipo
        $vehiculos = DB::table('vehiculo')
            ->join('tipo_vehiculo', 'vehiculo.tipo_veh_id', '=', 'tipo_vehiculo.id')
            ->select('tipo_vehiculo.descripcion as tipo', DB::raw('count(*) as count'))
            ->whereNull('vehiculo.deleted_at')
            ->groupBy('tipo_vehiculo.descripcion')
            ->get();

        // Estadísticas de rutas por empresa
        $rutas = DB::table('rutas')
            ->join('empresas', 'rutas.empresa_id', '=', 'empresas.id')
            ->select('empresas.name as empresa', DB::raw('count(*) as count'))
            ->whereNull('rutas.deleted_at')
            ->groupBy('empresas.name', 'empresas.id')
            ->get();

        // Estadísticas de conductores por tipo de identificación
        $conductores = DB::table('conductores')
            ->join('personas', 'conductores.persona_id', '=', 'personas.id')
            ->join('tipo_ident', 'personas.tipo_ident_id', '=', 'tipo_ident.id')
            ->select('tipo_ident.descripcion as tipo_ident', DB::raw('count(*) as count'))
            ->whereNull('conductores.deleted_at')
            ->groupBy('tipo_ident.descripcion')
            ->get();

        // Estadísticas de empresas por tipo
        $empresas = DB::table('empresas')
            ->join('tipo_empresa', 'empresas.tipo_empresa_id', '=', 'tipo_empresa.id')
            ->select('tipo_empresa.descripcion as tipo_empresa', DB::raw('count(*) as count'))
            ->whereNull('empresas.deleted_at')
            ->groupBy('tipo_empresa.descripcion')
            ->get();

        return response()->json([
            'vehiculos' => $vehiculos,
            'rutas' => $rutas,
            'conductores' => $conductores,
            'empresas' => $empresas,
        ]);
    }
}
