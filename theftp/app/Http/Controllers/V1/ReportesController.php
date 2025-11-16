<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Models\empresas;
use App\Models\conductores;
use App\Models\vehiculo;
use App\Models\rutas;
use Illuminate\Support\Facades\Auth;

class ReportesController extends Controller
{
    /**
     * Descarga reporte de empresas registradas en CSV
     */
    public function empresas()
    {
        // Validar que el usuario sea UPC
        $user = Auth::user();
        if (!$user || $user->rol->descripcion !== 'UPC') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // Obtener todas las empresas
        $empresas = empresas::with('tipo_empresa', 'propietario')
            ->get(['id', 'nit', 'razon_social', 'tipo_empresa_id', 'representante_legal', 'email', 'telefono', 'created_at']);

        // Generar CSV
        return $this->generateCSV('empresas', [
            'ID',
            'NIT',
            'Razón Social',
            'Tipo Empresa',
            'Representante Legal',
            'Email',
            'Teléfono',
            'Fecha Registro'
        ], $empresas->map(function ($empresa) {
            return [
                $empresa->id,
                $empresa->nit,
                $empresa->razon_social,
                $empresa->tipo_empresa->descripcion ?? 'N/A',
                $empresa->representante_legal,
                $empresa->email,
                $empresa->telefono,
                $empresa->created_at->format('Y-m-d')
            ];
        })->toArray());
    }

    /**
     * Descarga reporte de conductores activos en CSV
     */
    public function conductoresActivos()
    {
        // Validar que el usuario sea UPC
        $user = Auth::user();
        if (!$user || $user->rol->descripcion !== 'UPC') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // Obtener conductores activos (con datos de la persona)
        $conductores = conductores::with('persona')
            ->get(['id', 'persona_id', 'created_at']);

        return $this->generateCSV('conductores_activos', [
            'ID',
            'Nombre',
            'Tipo Identificación',
            'Número Identificación',
            'Email',
            'Teléfono',
            'Fecha Registro'
        ], $conductores->map(function ($conductor) {
            return [
                $conductor->id,
                $conductor->persona->primer_nombre . ' ' . $conductor->persona->primer_apellido ?? 'N/A',
                $conductor->persona->tipo_ident?->descripcion ?? 'N/A',
                $conductor->persona->numero_identificacion ?? 'N/A',
                $conductor->persona->email ?? 'N/A',
                $conductor->persona->telefono ?? 'N/A',
                $conductor->created_at->format('Y-m-d')
            ];
        })->toArray());
    }

    /**
     * Descarga reporte de vehículos operativos en CSV
     */
    public function vehiculosOperativos()
    {
        // Validar que el usuario sea UPC
        $user = Auth::user();
        if (!$user || $user->rol->descripcion !== 'UPC') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // Obtener vehículos
        $vehiculos = vehiculo::with('tipo_vehiculo', 'propietario')
            ->get(['id', 'placa', 'marca', 'modelo', 'color', 'tipo_veh_id', 'propietario_id', 'created_at']);

        return $this->generateCSV('vehiculos_operativos', [
            'ID',
            'Placa',
            'Marca',
            'Modelo',
            'Color',
            'Tipo Vehículo',
            'Propietario',
            'Fecha Registro'
        ], $vehiculos->map(function ($v) {
            return [
                $v->id,
                $v->placa,
                $v->marca,
                $v->modelo,
                $v->color,
                $v->tipo_vehiculo?->descripcion ?? 'N/A',
                $v->propietario?->primer_nombre ?? 'N/A',
                $v->created_at->format('Y-m-d')
            ];
        })->toArray());
    }

    /**
     * Descarga reporte de rutas activas en CSV
     */
    public function rutasActivas()
    {
        // Validar que el usuario sea UPC
        $user = Auth::user();
        if (!$user || $user->rol->descripcion !== 'UPC') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // Obtener rutas activas
        $rutas = rutas::with('empresa')
            ->get(['id', 'name', 'empresa_id', 'created_at']);

        return $this->generateCSV('rutas_activas', [
            'ID',
            'Nombre Ruta',
            'Empresa',
            'Fecha Registro'
        ], $rutas->map(function ($ruta) {
            return [
                $ruta->id,
                $ruta->name,
                $ruta->empresa->razon_social ?? $ruta->empresa->name ?? 'N/A',
                $ruta->created_at->format('Y-m-d')
            ];
        })->toArray());
    }

    /**
     * Descarga reporte de resoluciones emitidas en CSV
     */
    public function resoluciones()
    {
        // Validar que el usuario sea UPC
        $user = Auth::user();
        if (!$user || $user->rol->descripcion !== 'UPC') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // Obtener resoluciones (usando tabla de auditoría como aproximación)
        // Esto asume que existen resoluciones en el sistema
        $resoluciones = \DB::table('audit')
            ->where('event', 'created')
            ->where('auditable_type', 'like', '%empresas%')
            ->orWhere('event', 'created')
            ->orWhere('auditable_type', 'like', '%conductores%')
            ->orWhere('event', 'created')
            ->orWhere('auditable_type', 'like', '%vehiculo%')
            ->limit(100)
            ->get(['id', 'event', 'auditable_type', 'user_id', 'created_at']);

        return $this->generateCSV('resoluciones', [
            'ID',
            'Tipo Resolución',
            'Entidad Afectada',
            'Usuario',
            'Fecha'
        ], $resoluciones->map(function ($resolucion) {
            return [
                $resolucion->id,
                strtoupper($resolucion->event),
                class_basename($resolucion->auditable_type),
                $resolucion->user_id,
                \Carbon\Carbon::parse($resolucion->created_at)->format('Y-m-d H:i:s')
            ];
        })->toArray());
    }

    /**
     * Genera un archivo CSV y lo retorna
     */
    private function generateCSV($filename, $headers, $data)
    {
        $output = fopen('php://memory', 'w');

        // Escribir headers
        fputcsv($output, $headers, ';');

        // Escribir datos
        foreach ($data as $row) {
            fputcsv($output, $row, ';');
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        // Retornar como descarga
        return response($csv)
            ->header('Content-Type', 'text/csv; charset=utf-8')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}_" . date('Y-m-d') . ".csv\"");
    }
}
