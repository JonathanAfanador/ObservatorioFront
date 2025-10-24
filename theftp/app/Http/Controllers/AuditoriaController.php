<?php

namespace App\Http\Controllers;

use App\Enums\Acciones;
use App\Enums\Tablas;
use App\Http\Services\PermisosService;
use App\Http\Controllers\Controller;
use App\Models\Audit;
use Exception;
use Illuminate\Http\Request;

// ! Se realizará una refactorización
// ! al controlador de auditoría con el fin de relacionarlos con el modelos padre
// ! Controller.php, las siguientes modificaciones tendrán que ser revisadas y testeadas.
class AuditoriaController extends Controller{

    public function __construct(){
        parent::__construct(new Audit(), Tablas::AUDIT);
    }

    /**
     * @OA\Get(
     *     path="/api/auditoria",
     *     summary="Listar auditorías (paginado, filtros y relaciones)",
     *     tags={"Auditoría"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="page", in="query",
     *         @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="limit", in="query",
     *         @OA\Schema(type="integer", example=10)),
     *     @OA\Parameter(name="columns", in="query", description="Campos separados por coma o *",
     *         @OA\Schema(type="string", example="*")
     *     ),
     *     @OA\Parameter(name="orderBy", in="query",
     *         @OA\Schema(type="string", example="id")),
     *     @OA\Parameter(name="orderDirection", in="query",
     *         @OA\Schema(type="string", example="asc")),
     *     @OA\Parameter(name="include", in="query", description="Relaciones separadas por coma",
     *         @OA\Schema(type="string", example="user")
     *     ),
     *     @OA\Parameter(name="filter", in="query", description="JSON con filtros avanzados (ver respuestas de error para ejemplos)",
     *         @OA\Schema(type="string", example={ "column": "event", "operator": "like", "value": "%created%" })
     *     ),
     *     @OA\Parameter(name="includeSoftDeleted", in="query",
     *         @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query",
     *         @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query",
     *         @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query",
     *         @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(response=200, description="OK"),
     *     @OA\Response(response=400, description="Parámetro include no permitido o error de validación"),
     *     @OA\Response(response=422, description="Errores de validación")
     * )
     */
    public function index(Request $request) {
        // Delega toda la lógica al método index del controlador padre
        return parent::get($request);
    }

    /**
     * @OA\Get(
     *     path="/api/auditoria/{id}",
     *     summary="Obtener detalle de una auditoría por ID",
     *     tags={"Auditoría"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true,
     *         @OA\Schema(type="integer")),
     *     @OA\Parameter(name="include", in="query",
     *         @OA\Schema(type="string", example="user,auditable")),
     *     @OA\Parameter(name="includeSoftDeleted", in="query",
     *         @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query",
     *         @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query",
     *         @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query",
     *         @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(response=200, description="OK"),
     *     @OA\Response(response=404, description="No encontrado")
     * )
     */
    public function show($id, Request $request) {
        // Delega toda la lógica al método show del controlador padre
        return parent::getById($id, $request);
    }

    /**
     * @OA\Get(
     *     path="/api/auditoria/{field}/uniques",
     *     summary="Valores únicos de un campo de auditoría",
     *     tags={"Auditoría"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="field", in="path", required=true, @OA\Schema(type="string", example="event")),
     *     @OA\Response(response=200, description="OK"),
     *     @OA\Response(response=400, description="Campo no válido"),
     *     @OA\Response(response=403, description="Sin permiso")
     * )
     */
    public function getUniqueFields(string $field) {
        try {
            // Verificar permisos
            PermisosService::verificarPermisoIndividual(Tablas::AUDIT, Acciones::READ);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 400);
        }

        // Campos permitidos: fillables + claves / timestamps comunes (created_at, updated_at, deleted_at)
        $allowed = array_values(array_unique(array_merge(
            (new Audit())->getFillable(),
            ['id', 'created_at', 'updated_at', 'deleted_at']
        )));

        if (!in_array($field, $allowed)) {
            return response()->json([
                'status' => false,
                'message' => "El campo '$field' no es válido para obtener valores únicos."
            ], 400);
        }

        $data = Audit::query()->select($field)->distinct()->orderBy($field)->pluck($field);
        return response()->json([
            'status' => true,
            'data' => $data
        ], 200);
    }
}
