<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Models\licencias;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LicenciasController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new licencias(), Tablas::LICENCIAS);
    }

    /**
     * @OA\Get(
     *     path="/api/licencias",
     *     summary="Obtener la lista de licencias",
     *     tags={"Licencias"},
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
     *         @OA\Schema(type="string", example="restriccion_lic,categoria_lic,documento")
     *     ),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(
     *             type="string",
     *             example="{""categoria_lic_id"":{""="":1},""restriccion_lic_id"":{""="":2}}"
     *         )
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
     *         description="Lista de licencias obtenida exitosamente",
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
     *     path="/api/licencias/{id}",
     *     summary="Obtener una licencia por ID",
     *     tags={"Licencias"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la licencia",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Parameter(
     *         name="include",
     *         in="query",
     *         description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible",
     *         required=false,
     *         @OA\Schema(type="string", example="restriccion_lic,categoria_lic,documento")
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
     *         description="Licencia obtenida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=404, description="Licencia no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/licencias",
     *     summary="Crear una nueva licencia",
     *     tags={"Licencias"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="restriccion_lic_id", type="integer", example=1),
     *             @OA\Property(property="categoria_lic_id", type="integer", example=2),
     *             @OA\Property(property="documento_id", type="integer", example=5)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Licencia creada exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        $rules = [
            'restriccion_lic_id' => 'required|integer|exists:restriccion_lic,id',
            'categoria_lic_id'   => 'required|integer|exists:categorias_licencia,id',
            'documento_id'       => 'required|integer|exists:documentos,id',
        ];

        $messages = [
            'restriccion_lic_id.required' => 'El campo restriccion_lic_id es obligatorio.',
            'restriccion_lic_id.integer'  => 'El campo restriccion_lic_id debe ser un número entero.',
            'restriccion_lic_id.exists'   => 'La restricción de licencia especificada no existe.',
            'categoria_lic_id.required'   => 'El campo categoria_lic_id es obligatorio.',
            'categoria_lic_id.integer'    => 'El campo categoria_lic_id debe ser un número entero.',
            'categoria_lic_id.exists'     => 'La categoría de licencia especificada no existe.',
            'documento_id.required'       => 'El campo documento_id es obligatorio.',
            'documento_id.integer'        => 'El campo documento_id debe ser un número entero.',
            'documento_id.exists'         => 'El documento especificado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::store($request);
    }

    /**
     * @OA\Put(
     *     path="/api/licencias/{id}",
     *     summary="Actualizar una licencia existente",
     *     tags={"Licencias"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la licencia",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="restriccion_lic_id", type="integer", example=2),
     *             @OA\Property(property="categoria_lic_id", type="integer", example=3),
     *             @OA\Property(property="documento_id", type="integer", example=7)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Licencia actualizada exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, Request $request)
    {
        $rules = [
            'restriccion_lic_id' => 'required|integer|exists:restriccion_lic,id',
            'categoria_lic_id'   => 'required|integer|exists:categorias_licencia,id',
            'documento_id'       => 'required|integer|exists:documentos,id',
        ];

        $messages = [
            'restriccion_lic_id.required' => 'El campo restriccion_lic_id es obligatorio.',
            'restriccion_lic_id.integer'  => 'El campo restriccion_lic_id debe ser un número entero.',
            'restriccion_lic_id.exists'   => 'La restricción de licencia especificada no existe.',
            'categoria_lic_id.required'   => 'El campo categoria_lic_id es obligatorio.',
            'categoria_lic_id.integer'    => 'El campo categoria_lic_id debe ser un número entero.',
            'categoria_lic_id.exists'     => 'La categoría de licencia especificada no existe.',
            'documento_id.required'       => 'El campo documento_id es obligatorio.',
            'documento_id.integer'        => 'El campo documento_id debe ser un número entero.',
            'documento_id.exists'         => 'El documento especificado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::update($id, $request);
    }

    /**
     * @OA\Delete(
     *     path="/api/licencias/{id}",
     *     summary="Eliminar una licencia",
     *     tags={"Licencias"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la licencia",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Licencia eliminada exitosamente"),
     *     @OA\Response(response=404, description="Licencia no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/licencias/{id}/rehabilitate",
     *     summary="Rehabilitar una licencia eliminada",
     *     tags={"Licencias"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la licencia",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Licencia rehabilitada exitosamente"),
     *     @OA\Response(response=404, description="Licencia no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }
}
