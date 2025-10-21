<?php


namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Models\barrios;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BarriosController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new barrios(), Tablas::BARRIOS);
    }
/**
 * @OA\Get(
 *     path="/api/barrios",
 *     summary="Obtener la lista de barrios",
 *     tags={"Barrios"},
 *     security={{"sanctum": {}}},
 *     @OA\Parameter(
 *         name="page",
 *         in="query",
 *         description="Número de página para la paginación",
 *         required=false,
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Parameter(
 *         name="limit",
 *         in="query",
 *         description="Cantidad de elementos por página",
 *         required=false,
 *         @OA\Schema(type="integer", example=10)
 *     ),
 *     @OA\Parameter(
 *         name="columns",
 *         in="query",
 *         description="Columnas a seleccionar, separadas por comas. Usar * traerá todas las columnas",
 *         required=false,
 *         @OA\Schema(type="string", example="*")
 *     ),
 *     @OA\Parameter(
 *         name="orderBy",
 *         in="query",
 *         description="Columna para ordenar los resultados",
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
 *     @OA\Parameter(
 *         name="include",
 *         in="query",
 *         description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible",
 *         required=false,
 *         @OA\Schema(type="string", example="municipio")
 *     ),
 *     @OA\Parameter(
 *         name="filter",
 *         in="query",
 *         description="Filtro en formato JSON para aplicar condiciones",
 *         required=false,
 *         @OA\Schema(type="string", example="{\"name\":{\"like\":\"%CENTRO%\"}}")
 *     ),
 *     @OA\Parameter(
 *         name="includeSoftDeleted",
 *         in="query",
 *         description="Incluir registros deshabilitados (soft deleted)",
 *         required=false,
 *         @OA\Schema(type="boolean", example=false)
 *     ),
 *     @OA\Parameter(
 *         name="onlySoftDeleted",
 *         in="query",
 *         description="Solo registros deshabilitados (soft deleted)",
 *         required=false,
 *         @OA\Schema(type="boolean", example=false)
 *     ),
 *     @OA\Parameter(
 *         name="includeRelatedSoftDeleted",
 *         in="query",
 *         description="Incluir registros deshabilitados en relaciones",
 *         required=false,
 *         @OA\Schema(type="boolean", example=false)
 *     ),
 *     @OA\Parameter(
 *         name="onlyRelatedSoftDeleted",
 *         in="query",
 *         description="Solo registros deshabilitados en relaciones",
 *         required=false,
 *         @OA\Schema(type="boolean", example=false)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Lista de barrios obtenida exitosamente",
 *         @OA\JsonContent(
 *             @OA\Property(property="status", type="boolean", example=true),
 *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
 *             @OA\Property(property="total", type="integer", example=100)
 *         )
 *     ),
 *     @OA\Response(response=401, description="No autenticado"),
 *     @OA\Response(response=500, description="Error interno del servidor")
 * )
 */
    public function index(Request $request)
    {
        return $this->get($request);
    }

/**
 * @OA\Get(
 *     path="/api/barrios/{id}",
 *     summary="Obtener un barrio por ID",
 *     tags={"Barrios"},
 *     security={{"sanctum": {}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         description="ID del barrio",
 *         required=true,
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Parameter(
 *         name="include",
 *         in="query",
 *         description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible",
 *         required=false,
 *         @OA\Schema(type="string", example="municipio")
 *     ),
 *     @OA\Parameter(
 *         name="includeSoftDeleted",
 *         in="query",
 *         description="Incluir registros deshabilitados (soft deleted)",
 *         required=false,
 *         @OA\Schema(type="boolean", example=false)
 *     ),
 *     @OA\Parameter(
 *         name="onlySoftDeleted",
 *         in="query",
 *         description="Solo registros deshabilitados (soft deleted)",
 *         required=false,
 *         @OA\Schema(type="boolean", example=false)
 *     ),
 *     @OA\Parameter(
 *         name="includeRelatedSoftDeleted",
 *         in="query",
 *         description="Incluir registros deshabilitados en relaciones",
 *         required=false,
 *         @OA\Schema(type="boolean", example=false)
 *     ),
 *     @OA\Parameter(
 *         name="onlyRelatedSoftDeleted",
 *         in="query",
 *         description="Solo registros deshabilitados en relaciones",
 *         required=false,
 *         @OA\Schema(type="boolean", example=false)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Barrio obtenido exitosamente",
 *         @OA\JsonContent(
 *             @OA\Property(property="status", type="boolean", example=true),
 *             @OA\Property(property="data", type="object")
 *         )
 *     ),
 *     @OA\Response(response=401, description="No autenticado"),
 *     @OA\Response(response=404, description="Barrio no encontrado"),
 *     @OA\Response(response=500, description="Error interno del servidor")
 * )
 */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/barrios",
     *     summary="Crear un nuevo barrio",
     *     tags={"Barrios"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Barrio X"),
     *             @OA\Property(property="municipios_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Barrio creado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        $rules = [
            'name'          => 'required|string|max:255',
            'municipios_id' => 'required|integer|exists:municipios,id',
        ];

        $messages = [
            'name.required'          => 'El campo nombre es obligatorio.',
            'municipios_id.required' => 'El campo municipio es obligatorio.',
            'municipios_id.exists'   => 'El municipio especificado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::store($request);
    }

    /**
     * @OA\Put(
     *     path="/api/barrios/{id}",
     *     summary="Actualizar un barrio existente",
     *     tags={"Barrios"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del barrio",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Barrio X"),
     *             @OA\Property(property="municipios_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Barrio actualizado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, Request $request)
    {
        $rules = [
            'name'          => 'required|string|max:255',
            'municipios_id' => 'required|integer|exists:municipios,id',
        ];

        $messages = [
            'name.required'          => 'El campo nombre es obligatorio.',
            'municipios_id.required' => 'El campo municipio es obligatorio.',
            'municipios_id.exists'   => 'El municipio especificado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::update($id, $request);
    }

    /**
     * @OA\Delete(
     *     path="/api/barrios/{id}",
     *     summary="Eliminar un barrio",
     *     tags={"Barrios"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del barrio",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Barrio eliminado exitosamente"),
     *     @OA\Response(response=404, description="Barrio no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/barrios/{id}/rehabilitate",
     *     summary="Rehabilitar un barrio eliminado",
     *     tags={"Barrios"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del barrio",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Barrio rehabilitado exitosamente"),
     *     @OA\Response(response=404, description="Barrio no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }
}
