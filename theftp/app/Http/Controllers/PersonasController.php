<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Models\Persona;
use App\Http\Requests\StorePersonaRequest;
use App\Http\Requests\UpdatePersonaRequest;
use Illuminate\Http\Request;

class PersonasController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new Persona(), Tablas::PERSONAS);
    }

    /**
     * @OA\Get(
     *     path="/api/personas",
     *     summary="Obtener la lista de personas",
     *     tags={"Personas"},
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
     *         @OA\Schema(type="string", example="tipo_ident")
     *     ),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(
     *             type="string",
     *             example="{""name"":{""like"":""%ANDRES%""},""last_name"":{""like"":""%VEGA%""},""tipo_ident_id"":{""="":4}}"
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
     *         description="Lista de personas obtenida exitosamente",
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
     *     path="/api/personas/{id}",
     *     summary="Obtener una persona por ID",
     *     tags={"Personas"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la persona",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Parameter(
     *         name="include",
     *         in="query",
     *         description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible",
     *         required=false,
     *         @OA\Schema(type="string", example="tipo_ident")
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
     *         description="Persona obtenida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=404, description="Persona no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/personas",
     *     summary="Crear una nueva persona",
     *     tags={"Personas"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="nui", type="string", example="123456789"),
     *             @OA\Property(property="name", type="string", example="Juan Andrés"),
     *             @OA\Property(property="last_name", type="string", example="Vega González"),
     *             @OA\Property(property="phone_number", type="string", example="+57 315 000 0000"),
     *             @OA\Property(property="gender", type="string", example="Hombre"),
     *             @OA\Property(property="tipo_ident_id", type="integer", example=4)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Persona creada exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(StorePersonaRequest $request)
    {
        return parent::baseStore($request);
    }

    /**
     * @OA\Put(
     *     path="/api/personas/{id}",
     *     summary="Actualizar una persona existente",
     *     tags={"Personas"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la persona",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="nui", type="string", example="123456789"),
     *             @OA\Property(property="name", type="string", example="Juan Andrés"),
     *             @OA\Property(property="last_name", type="string", example="Vega González"),
     *             @OA\Property(property="phone_number", type="string", example="+57 315 000 0000"),
     *             @OA\Property(property="gender", type="string", example="Hombre"),
     *             @OA\Property(property="tipo_ident_id", type="integer", example=4)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Persona actualizada exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, UpdatePersonaRequest $request)
    {
        return parent::baseUpdate($id, $request);
    }

    /**
     * @OA\Delete(
     *     path="/api/personas/{id}",
     *     summary="Eliminar una persona",
     *     tags={"Personas"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la persona",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Persona eliminada exitosamente"),
     *     @OA\Response(response=404, description="Persona no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/personas/{id}/rehabilitate",
     *     summary="Rehabilitar una persona eliminada",
     *     tags={"Personas"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la persona",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Persona rehabilitada exitosamente"),
     *     @OA\Response(response=404, description="Persona no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }
}
