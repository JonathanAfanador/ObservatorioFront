<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehiculo;
use App\Models\Empresa;
use App\Models\Documento;
use App\Models\Conductor;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardSecretariaController extends Controller
{
    public function __construct()
    {
        // Sobreescribimos el constructor de la clase base para evitar la inyección obligatoria de un Model
    }

    public function getStats()
    {
        try {
            // 1. KPIs Básicos
            $totalVehiculos = Vehiculo::count();
            $vehiculosOperativos = Vehiculo::where('servicio', true)->count();
            $vehiculosInmovilizados = Vehiculo::where('servicio', false)->count();
            $totalEmpresas = Empresa::count();

            // 2. Salud de la Flota (Para el gráfico de Dona)
            $flotaHealth = [
                'operativos' => $vehiculosOperativos,
                'inmovilizados' => $vehiculosInmovilizados,
                'vencidos' => Vehiculo::where(function($query) {
                    $query->where('fecha_vencimiento_soat', '<', Carbon::now())
                          ->orWhere('fecha_vencimiento_tecno', '<', Carbon::now());
                })->count()
            ];

            // 3. Top 5 Empresas por Cumplimiento
            // Calculamos el % de vehículos en servicio por cada empresa
            $topEmpresas = Empresa::withCount('vehiculos')
                ->get()
                ->map(function ($empresa) {
                    $total = $empresa->vehiculos_count;
                    if ($total == 0) return ['nombre' => $empresa->name, 'cumplimiento' => 0];
                    
                    $operativos = Vehiculo::where('empresa_id', $empresa->id)->where('servicio', true)->count();
                    return [
                        'nombre' => $empresa->name,
                        'cumplimiento' => round(($operativos / $total) * 100, 1)
                    ];
                })
                ->sortByDesc('cumplimiento')
                ->take(5)
                ->values();

            // 4. Alertas Críticas (Vencimientos en los próximos 30 días o ya vencidos)
            $hoy = Carbon::now();
            $proximos = Carbon::now()->addDays(30);

            $alertas = Vehiculo::with('empresa')
                ->where(function($query) use ($hoy, $proximos) {
                    $query->where('fecha_vencimiento_soat', '<', $proximos)
                          ->orWhere('fecha_vencimiento_tecno', '<', $proximos)
                          ->orWhere('servicio', false);
                })
                ->orderBy('updated_at', 'desc')
                ->take(10)
                ->get()
                ->map(function($v) use ($hoy) {
                    $tipo = "Alerta";
                    $mensaje = "";
                    
                    if (!$v->servicio) {
                        $tipo = "Inmovilizado";
                        $mensaje = "Vehículo fuera de servicio por dictamen técnico.";
                    } elseif ($v->fecha_vencimiento_soat < $hoy) {
                        $tipo = "SOAT Vencido";
                        $mensaje = "El SOAT expiró el " . Carbon::parse($v->fecha_vencimiento_soat)->format('d/m/Y');
                    } elseif ($v->fecha_vencimiento_tecno < $hoy) {
                        $tipo = "Tecno Vencida";
                        $mensaje = "Revisión vencida el " . Carbon::parse($v->fecha_vencimiento_tecno)->format('d/m/Y');
                    } else {
                        $tipo = "Próximo Vencimiento";
                        $mensaje = "Documentación por expirar en menos de 30 días.";
                    }

                    return [
                        'placa' => $v->placa,
                        'empresa' => $v->empresa->name ?? 'Particular',
                        'tipo' => $tipo,
                        'mensaje' => $mensaje,
                        'fecha' => $v->updated_at->diffForHumans()
                    ];
                });

            return response()->json([
                'status' => true,
                'data' => [
                    'kpis' => [
                        'total_vehiculos' => $totalVehiculos,
                        'total_empresas' => $totalEmpresas,
                        'total_licencias' => Conductor::where('estado', true)->count(),
                        'total_alertas' => $alertas->count()
                    ],
                    'flota_health' => $flotaHealth,
                    'top_empresas' => $topEmpresas,
                    'alertas' => $alertas
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error al obtener estadísticas del dashboard.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
