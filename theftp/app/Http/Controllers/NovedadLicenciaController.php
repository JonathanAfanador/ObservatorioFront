<?php

namespace App\Http\Controllers;

use App\Models\NovedadLicencia;
use App\Models\Licencia;
use Illuminate\Http\Request;

use App\Enums\Tablas;

class NovedadLicenciaController extends Controller
{
    public function __construct()
    {
        parent::__construct(new NovedadLicencia(), Tablas::NOVEDADES_LICENCIAS);
    }

    public function index(Request $request)
    {
        $query = NovedadLicencia::with('licencia')->withTrashed();

        if ($request->has('licencia_id')) {
            $query->where('licencia_id', $request->licencia_id);
        }

        return response()->json([
            'status' => true,
            'data' => $query->orderBy('created_at', 'desc')->get()
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'licencia_id' => 'required|exists:licencias,id',
            'tipo_novedad' => 'required|string|max:100',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'observaciones' => 'nullable|string'
        ]);

        $novedad = NovedadLicencia::create($request->all());

        // Autómata: Inactivar licencia
        $licencia = Licencia::find($request->licencia_id);
        if ($licencia) {
            $licencia->update([
                'estado' => false,
                'motivo_estado' => ltrim($request->tipo_novedad)
            ]);
        }

        return response()->json(['status' => true, 'data' => $novedad], 201);
    }

    public function show(string $id)
    {
        $novedad = NovedadLicencia::with('licencia')->findOrFail($id);
        return response()->json(['status' => true, 'data' => $novedad], 200);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'tipo_novedad' => 'sometimes|required|string|max:100',
            'fecha_inicio' => 'sometimes|required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'observaciones' => 'nullable|string'
        ]);

        $novedad = NovedadLicencia::findOrFail($id);
        $novedad->update($request->all());
        
        // Autómata: Si hay un cambio de tipo de novedad, actualizar el motivo_estado de la licencia
        $licencia = Licencia::find($novedad->licencia_id);
        if ($licencia && !$licencia->estado) {
            $licencia->update(['motivo_estado' => ltrim($request->tipo_novedad)]);
        }

        return response()->json(['status' => true, 'data' => $novedad], 200);
    }

    public function destroy(string $id)
    {
        $novedad = NovedadLicencia::findOrFail($id);
        $licencia_id = $novedad->licencia_id;
        $novedad->delete();

        // Autómata: Reactivar a la licencia
        $licencia = Licencia::find($licencia_id);
        if ($licencia) {
             $licencia->update([
                 'estado' => true,
                 'motivo_estado' => null
             ]);
        }

        return response()->json(['status' => true, 'message' => 'Novedad eliminada.'], 200);
    }
}
