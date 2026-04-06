<?php

namespace App\Http\Controllers;

use App\Models\Paradero;
use Illuminate\Http\Request;
use App\Enums\Tablas;

class ParaderosController extends Controller
{
    public function __construct()
    {
        parent::__construct(new Paradero(), Tablas::PARADEROS);
    }

    public function index(Request $request)
    {
        return parent::get($request);
    }

    public function show($id, Request $request)
    {
        return parent::getById($id, $request);
    }

    public function store(Request $request)
    {
        return parent::baseStore($request);
    }

    public function update($id, Request $request)
    {
        return parent::baseUpdate($id, $request);
    }

    public function destroy($id)
    {
        return parent::destroy($id);
    }

    /**
     * Endpoint especializado para guardar masivamente paraderos provenientes de un KML/KMZ
     * procesado en el frontend. Opcionalmente recibe "replace" para purgar los anteriores.
     */
    public function bulkStore(Request $request, $ruta_id)
    {
        $paraderos = $request->input('paraderos', []);
        $replace = $request->input('replace', true); // Por defecto reemplaza los existentes

        if (empty($paraderos)) {
            return response()->json(['status' => false, 'message' => 'No se enviaron paraderos válidos.'], 400);
        }

        try {
            // Verificar si el usuario tiene permiso sobre la ruta
            $ruta = \App\Models\Ruta::findOrFail($ruta_id);
            
            // Inyección de seguridad: solo adm o dueños (handled por el TenantScope en Ruta)
            
            if ($replace) {
                // Borrado físico o lógico de los anteriores
                Paradero::where('ruta_id', $ruta_id)->delete();
            }

            $toInsert = [];
            foreach ($paraderos as $p) {
                $toInsert[] = [
                    'ruta_id' => $ruta_id,
                    'name' => $p['name'] ?? 'Paradero',
                    'description' => $p['description'] ?? null,
                    'lat' => $p['lat'],
                    'lng' => $p['lng'],
                    'estado' => $p['estado'] ?? true,
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }

            // Inserción en bloque
            Paradero::insert($toInsert);

            return response()->json([
                'status' => true,
                'message' => 'Paraderos sincronizados con éxito.',
                'count' => count($toInsert)
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error guardando paraderos en bloque.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
