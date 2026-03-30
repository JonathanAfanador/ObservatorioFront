<?php

namespace App\Http\Controllers;

use App\Models\NovedadVehiculo;
use App\Models\Vehiculo;
use Illuminate\Http\Request;
use App\Enums\Tablas;

class NovedadVehiculoController extends Controller
{
    public function __construct()
    {
        parent::__construct(new NovedadVehiculo(), Tablas::VEHICULO); // Using VEHICULO enum since it affects the vehicle table
    }

    public function index(Request $request)
    {
        $query = NovedadVehiculo::with('vehiculo')->withTrashed();

        if ($request->has('vehiculo_id')) {
            $query->where('vehiculo_id', $request->vehiculo_id);
        }

        $limit = $request->input('limit', 100);
        $novedades = $query->orderBy('fecha_inicio', 'desc')->paginate($limit == -1 ? 3000 : $limit);

        return response()->json([
            'status' => true, 
            'total' => $novedades->total(), 
            'data' => $novedades->items()
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehiculo_id' => 'required|exists:vehiculo,id',
            'tipo_novedad' => 'required|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'observaciones' => 'nullable|string'
        ]);

        $novedad = NovedadVehiculo::create($validated);

        // Autómata: Inactivar vehículo
        $vehiculo = Vehiculo::find($request->vehiculo_id);
        if ($vehiculo) {
            $vehiculo->update([
                'estado' => false,
                'motivo_estado' => ltrim($request->tipo_novedad)
            ]);
        }

        return response()->json([
            'status' => true, 
            'data' => $novedad, 
            'message' => 'Novedad registrada y vehículo inactivo.'
        ], 201);
    }

    public function show(string $id)
    {
        $novedad = NovedadVehiculo::with('vehiculo')->findOrFail($id);
        return response()->json(['status' => true, 'data' => $novedad], 200);
    }

    public function update(Request $request, string $id)
    {
        $novedad = NovedadVehiculo::findOrFail($id);
        
        $validated = $request->validate([
            'tipo_novedad' => 'sometimes|string',
            'fecha_inicio' => 'sometimes|date',
            'fecha_fin' => 'nullable|date',
            'observaciones' => 'nullable|string'
        ]);

        $novedad->update($validated);
        
        // Autómata: Si hay un cambio de tipo de novedad, actualizar el motivo_estado del vehículo
        $vehiculo = Vehiculo::find($novedad->vehiculo_id);
        if ($vehiculo && !$vehiculo->estado) {
            $vehiculo->update(['motivo_estado' => ltrim($novedad->tipo_novedad)]);
        }

        return response()->json(['status' => true, 'data' => $novedad], 200);
    }

    public function destroy(string $id)
    {
        $novedad = NovedadVehiculo::findOrFail($id);
        $vehiculo_id = $novedad->vehiculo_id;
        $novedad->delete();

        // Autómata: Reactivar al vehículo
        $vehiculo = Vehiculo::find($vehiculo_id);
        if ($vehiculo) {
             $vehiculo->update([
                 'estado' => true,
                 'motivo_estado' => null
             ]);
        }

        return response()->json(['status' => true, 'message' => 'Novedad eliminada y vehículo reactivado.'], 200);
    }
}
