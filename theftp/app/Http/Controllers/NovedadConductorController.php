<?php

namespace App\Http\Controllers;

use App\Models\NovedadConductor;
use App\Models\Conductor;
use Illuminate\Http\Request;
use App\Http\Requests\StoreNovedadConductorRequest;
use App\Http\Requests\UpdateNovedadConductorRequest;

use App\Enums\Tablas;

class NovedadConductorController extends Controller
{
    public function __construct()
    {
        parent::__construct(new NovedadConductor(), Tablas::NOVEDADES_CONDUCTORES);
    }

    public function index(Request $request)
    {
        $query = NovedadConductor::with('conductor.persona')->withTrashed();

        if ($request->has('conductor_id')) {
            $query->where('conductor_id', $request->conductor_id);
        }

        // Aplicamos un límite igual que el resto
        $limit = $request->input('limit', 100);
        
        $novedades = $query->orderBy('fecha_inicio', 'desc')->paginate($limit == -1 ? 3000 : $limit);
        return response()->json(['status' => true, 'total' => $novedades->total(), 'data' => $novedades->items()], 200);
    }

    public function store(StoreNovedadConductorRequest $request)
    {
        $novedad = NovedadConductor::create($request->validated());

        // Autómata: Inactivar conductor
        $conductor = Conductor::find($request->conductor_id);
        if ($conductor) {
            $conductor->update([
                'estado' => false,
                'motivo_estado' => ltrim($request->tipo_novedad)
            ]);
        }

        return response()->json(['status' => true, 'data' => $novedad, 'message' => 'Novedad registrada y conductor inactivo.'], 201);
    }

    public function show(string $id)
    {
        $novedad = NovedadConductor::with('conductor.persona')->findOrFail($id);
        return response()->json(['status' => true, 'data' => $novedad], 200);
    }

    public function update(UpdateNovedadConductorRequest $request, string $id)
    {
        $novedad = NovedadConductor::findOrFail($id);
        $novedad->update($request->validated());
        
        // Autómata: Si hay un cambio de tipo de novedad, actualizar el motivo_estado del conductor
        $conductor = Conductor::find($novedad->conductor_id);
        if ($conductor && !$conductor->estado) {
            $conductor->update(['motivo_estado' => ltrim($request->tipo_novedad)]);
        }

        return response()->json(['status' => true, 'data' => $novedad], 200);
    }

    public function destroy(string $id)
    {
        $novedad = NovedadConductor::findOrFail($id);
        $conductor_id = $novedad->conductor_id;
        $novedad->delete();

        // Autómata: Reactivar al conductor 
        $conductor = Conductor::find($conductor_id);
        if ($conductor) {
             $conductor->update([
                 'estado' => true,
                 'motivo_estado' => null
             ]);
        }

        return response()->json(['status' => true, 'message' => 'Novedad eliminada.'], 200);
    }
}
