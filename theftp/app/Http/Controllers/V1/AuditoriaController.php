<?php

namespace App\Http\Controllers\V1;

use App\Enums\Acciones;
use App\Enums\Tablas;
use App\Http\Controllers\Controller;
use App\Http\Services\PermisosService;
use App\Models\Audit;
use Exception;
use Illuminate\Http\Request;

class AuditoriaController extends Controller{

    public function getUniquesFields($field){

        // Validar que el campo exista en la tabla audits
        if(!in_array($field, (new Audit())->getFillable())){
            return response()->json([
                'message' => 'El campo no es válido',
            ], 400);
        }

        $data = Audit::select($field)->distinct()->get();
        return response()->json($data);
    }

    public function getFieldsPaginated(Request $request){

        try{
            PermisosService::verificarPermisoIndividual(Tablas::AUDITORIA, Acciones::READ);
        } catch (Exception $e){
            return response()->json([
                'message' => $e->getMessage()
            ], $e->getCode() ?: 400);
        }

        $page = $request->input('page', 1);
        $itemsPerPage = $request->input('itemsPerPage', 10);
        $search = $request->input('search', '');
        $orderBy = $request->input('orderBy', 'id');
        $orderDirection = $request->input('orderDirection', 'asc');
        $columns = $request->input('columns', "*"); // Columnas a buscar

        if($columns = "*"){
            $columns = (new Audit())->getFillable();
        }

        $page = max(0, $page - 1); // Asegurar que la página sea al menos 0
        $query = Audit::select($columns);

        // Aplicar búsqueda si se proporciona
        if($search){
            $query->where(function ($q) use ($search, $columns) {
                foreach ($columns as $column) {
                    $q->orWhere($column, 'LIKE', "%$search%");
                }
            });
        }

        // Aplicar ordenamiento
        $query->orderBy($orderBy, $orderDirection);

        // Obtener total de registros antes de la paginación
        $total = $query->count();

        // Aplicar paginación
        $data = $query->skip($page * $itemsPerPage)
                        ->take($itemsPerPage)
                        ->get();

        return response()->json([
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'itemsPerPage' => $itemsPerPage,
        ]);
    }

}
