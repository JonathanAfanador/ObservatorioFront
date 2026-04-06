<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Models\Conductor;
use App\Http\Requests\StoreConductorRequest;
use App\Http\Requests\UpdateConductorRequest;
use Illuminate\Http\Request;

class ConductoresController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new Conductor(), Tablas::CONDUCTORES);
        $this->resourceClass = \App\Http\Resources\ConductorResource::class;
    }

    /**
     * @OA\Get(
     *     path="/api/conductores",
     *     summary="Obtener la lista de conductores",
     *     tags={"Conductores"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="page", in="query", description="Número de página para la paginación", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="limit", in="query", description="Cantidad de elementos por página", required=false, @OA\Schema(type="integer", example=10)),
     *     @OA\Parameter(name="columns", in="query", description="Columnas a seleccionar, separadas por comas. Usar * traerá todas las columnas", required=false, @OA\Schema(type="string", example="*")),
     *     @OA\Parameter(name="orderBy", in="query", description="Columna para ordenar los resultados", required=false, @OA\Schema(type="string", example="id")),
     *     @OA\Parameter(name="orderDirection", in="query", description="Dirección de ordenamiento (asc o desc)", required=false, @OA\Schema(type="string", example="asc")),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="persona")),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(type="string", example="{""persona_id"":{""="":1}}")
     *     ),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de conductores obtenida exitosamente",
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
     *     path="/api/conductores/{id}",
     *     summary="Obtener un conductor por ID",
     *     tags={"Conductores"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del conductor", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="persona")),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Conductor obtenido exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=404, description="Conductor no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/conductores",
     *     summary="Crear un nuevo conductor",
     *     tags={"Conductores"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="persona_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Conductor creado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(StoreConductorRequest $request)
    {

        // --- INYECCIÓN DEL GUARDIÁN DE PROPIEDAD DE ESCRITURA ---
        $user = auth()->user();
        if ($user && !in_array($user->rol_id, [\App\Enums\RolesEnum::ADMIN->value, \App\Enums\RolesEnum::SUBADMIN->value, \App\Enums\RolesEnum::SECRETARIA->value])) {
            $request->merge(['empresa_id' => $user->empresa_id]);
        }
        // --------------------------------------------------------

        return parent::baseStore($request);
    }

    /**
     * @OA\Put(
     *     path="/api/conductores/{id}",
     *     summary="Actualizar un conductor existente",
     *     tags={"Conductores"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del conductor", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="persona_id", type="integer", example=2)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Conductor actualizado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, UpdateConductorRequest $request)
    {

        // --- INYECCIÓN DEL GUARDIÁN DE PROPIEDAD DE ESCRITURA (UPDATE) ---
        $user = auth()->user();
        if ($user && !in_array($user->rol_id, [\App\Enums\RolesEnum::ADMIN->value, \App\Enums\RolesEnum::SUBADMIN->value, \App\Enums\RolesEnum::SECRETARIA->value])) {
            $request->merge(['empresa_id' => $user->empresa_id]);
        }
        // -----------------------------------------------------------------

        return parent::baseUpdate($id, $request);
    }

    /**
     * @OA\Delete(
     *     path="/api/conductores/{id}",
     *     summary="Eliminar un conductor",
     *     tags={"Conductores"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del conductor", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Conductor eliminado exitosamente"),
     *     @OA\Response(response=404, description="Conductor no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/conductores/{id}/rehabilitate",
     *     summary="Rehabilitar un conductor eliminado",
     *     tags={"Conductores"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del conductor", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Conductor rehabilitado exitosamente"),
     *     @OA\Response(response=404, description="Conductor no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }
}
