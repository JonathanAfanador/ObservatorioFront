<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Models\restriccion_lic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RestriccionLicController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new restriccion_lic(), Tablas::RESTRICCION_LIC);
    }

    /**
     * @OA\Get(
     *     path="/api/restriccion_lic",
     *     summary="Obtener la lista de restricciones de licencia",
     *     tags={"Restriccion Licencia"},
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
     *         @OA\Schema(type="string", example="")
     *     ),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(type="string", example="{""descripcion"":{""like"":""%LENTES%""}}")
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
     *         description="Lista de restricciones de licencia obtenida exitosamente",
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
     *     path="/api/restriccion_lic/{id}",
     *     summary="Obtener una restricción de licencia por ID",
     *     tags={"Restriccion Licencia"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la restricción de licencia",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Parameter(
     *         name="include",
     *         in="query",
     *         description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible",
     *         required=false,
     *         @OA\Schema(type="string", example="")
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
     *         description="Restricción de licencia obtenida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=404, description="Restricción de licencia no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/restriccion_lic",
     *     summary="Crear una nueva restricción de licencia",
     *     tags={"Restriccion Licencia"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="descripcion", type="string", example="Usar lentes")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Restricción de licencia creada exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        $rules = [
            'descripcion' => 'required|string|max:150',
        ];

        $messages = [
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.string'   => 'El campo descripción debe ser una cadena de texto.',
            'descripcion.max'      => 'El campo descripción no debe exceder 150 caracteres.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::store($request);
    }

    /**
     * @OA\Put(
     *     path="/api/restriccion_lic/{id}",
     *     summary="Actualizar una restricción de licencia existente",
     *     tags={"Restriccion Licencia"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la restricción de licencia",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="descripcion", type="string", example="Uso obligatorio de lentes de contacto")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Restricción de licencia actualizada exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, Request $request)
    {
        $rules = [
            'descripcion' => 'required|string|max:150',
        ];

        $messages = [
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.string'   => 'El campo descripción debe ser una cadena de texto.',
            'descripcion.max'      => 'El campo descripción no debe exceder 150 caracteres.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::update($id, $request);
    }

    /**
     * @OA\Delete(
     *     path="/api/restriccion_lic/{id}",
     *     summary="Eliminar una restricción de licencia",
     *     tags={"Restriccion Licencia"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la restricción de licencia",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Restricción de licencia eliminada exitosamente"),
     *     @OA\Response(response=404, description="Restricción de licencia no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/restriccion_lic/{id}/rehabilitate",
     *     summary="Rehabilitar una restricción de licencia eliminada",
     *     tags={"Restriccion Licencia"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la restricción de licencia",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Restricción de licencia rehabilitada exitosamente"),
     *     @OA\Response(response=404, description="Restricción de licencia no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }
}
