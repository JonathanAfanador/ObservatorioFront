<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRolesMenusRequest;
use App\Http\Requests\UpdateRolesMenusRequest;

use App\Enums\Tablas;
use App\Models\Roles_menus;
use Illuminate\Http\Request;

class RolesMenusController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new RolMenu(), Tablas::ROLES_MENUS);
    }

    /**
     * @OA\Get(
     *     path="/api/roles-menus",
     *     summary="Obtener la lista de relaciones Rol-Menú",
     *     tags={"Roles-Menus"},
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
     *         @OA\Schema(type="string", example="rol,menu")
     *     ),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(
     *             type="string",
     *             example="{""rol_id"":{""="":1},""menu_id"":{""="":5}}"
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
     *         description="Lista obtenida exitosamente",
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
     *     path="/api/roles-menus/{id}",
     *     summary="Obtener una relación Rol-Menú por ID",
     *     tags={"Roles-Menus"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la relación",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Parameter(
     *         name="include",
     *         in="query",
     *         description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible",
     *         required=false,
     *         @OA\Schema(type="string", example="rol,menu")
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
     *         description="Relación obtenida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=404, description="Relación no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/roles-menus",
     *     summary="Crear una nueva relación Rol-Menú",
     *     tags={"Roles-Menus"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="rol_id", type="integer", example=1),
     *             @OA\Property(property="menu_id", type="integer", example=5)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Relación creada exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(StoreRolesMenusRequest $request)
    {

        return parent::baseStore($request);
    }

    /**
     * @OA\Put(
     *     path="/api/roles-menus/{id}",
     *     summary="Actualizar una relación Rol-Menú existente",
     *     tags={"Roles-Menus"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la relación",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="rol_id", type="integer", example=2),
     *             @OA\Property(property="menu_id", type="integer", example=7)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Relación actualizada exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, UpdateRolesMenusRequest $request)
    {

        return parent::baseUpdate($id, $request);
    }

    /**
     * @OA\Delete(
     *     path="/api/roles-menus/{id}",
     *     summary="Eliminar una relación Rol-Menú",
     *     tags={"Roles-Menus"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la relación",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Relación eliminada exitosamente"),
     *     @OA\Response(response=404, description="Relación no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/roles-menus/{id}/rehabilitate",
     *     summary="Rehabilitar una relación Rol-Menú eliminada",
     *     tags={"Roles-Menus"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de la relación",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Relación rehabilitada exitosamente"),
     *     @OA\Response(response=404, description="Relación no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }
}
