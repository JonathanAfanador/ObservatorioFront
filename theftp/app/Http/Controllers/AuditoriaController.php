<?php

namespace App\Http\Controllers;

use App\Enums\Acciones;
use App\Enums\Tablas;
use App\Http\Controllers\Controller;
use App\Http\Services\PermisosService;
use App\Models\Audit;
use Exception;
use Illuminate\Http\Request;

class AuditoriaController extends Controller{

    public function __construct(){
        parent::__construct(new Audit(), Tablas::AUDIT);
    }

    /**
     * @OA\Get(
     *     path="/api/auditoria/{field}/uniques",
     *     summary="Obtener valores únicos de un campo en la tabla de auditoría",
     *     tags={"Auditoría"},
     *    security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="field",
     *         in="path",
     *         description="Campo de la tabla de auditoría para obtener valores únicos",
     *         required=true,
     *         @OA\Schema(type="string", example="event")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Valores únicos obtenidos exitosamente",
     *         @OA\JsonContent(type="array", @OA\Items(type="string"))
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="El campo no es válido"
     *     )
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/auditoria",
     *     summary="Obtener registros de auditoría paginados",
     *     tags={"Auditoría"},
     *   security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Número de página",
     *         required=false,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Parameter(
     *         name="itemsPerPage",
     *         in="query",
     *         description="Cantidad de elementos por página",
     *         required=false,
     *         @OA\Schema(type="integer", example=10)
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Texto de búsqueda",
     *         required=false,
     *         @OA\Schema(type="string", example="updated")
     *     ),
     *     @OA\Parameter(
     *         name="orderBy",
     *         in="query",
     *         description="Columna para ordenar",
     *         required=false,
     *         @OA\Schema(type="string", example="id")
     *     ),
     *     @OA\Parameter(
     *         name="orderDirection",
     *         in="query",
     *         description="Dirección de ordenamiento (asc o desc)",
     *         required=false,
     *         @OA\Schema(type="string", example="asc")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Registros de auditoría obtenidos exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="total", type="integer", example=100),
     *             @OA\Property(property="page", type="integer", example=1),
     *             @OA\Property(property="itemsPerPage", type="integer", example=10)
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Error en los parámetros de entrada"
     *     )
     * )
     */
    public function getFieldsPaginated(Request $request){

        try{
            PermisosService::verificarPermisoIndividual(Tablas::AUDIT, Acciones::READ);
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
