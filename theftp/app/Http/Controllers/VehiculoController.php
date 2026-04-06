<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Models\Vehiculo;
use App\Http\Requests\StoreVehiculoRequest;
use App\Http\Requests\UpdateVehiculoRequest;
use Illuminate\Http\Request;

class VehiculoController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new Vehiculo(), Tablas::VEHICULO);
        $this->resourceClass = \App\Http\Resources\VehiculoResource::class;
    }

    /**
     * Define las relaciones permitidas para ser incluidas vía API (?include=...)
     */
    public function getAllowedIncludes(int $maxDepth = 3): array
    {
        return array_merge(parent::getAllowedIncludes($maxDepth), [
            'empresa',
            'documentoSoat',
            'documentoTecno',
            'tipo',
            'propietario'
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/vehiculos",
     *     summary="Obtener la lista de vehículos",
     *     tags={"Vehículos"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="page", in="query", description="Número de página para la paginación", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="limit", in="query", description="Cantidad de elementos por página", required=false, @OA\Schema(type="integer", example=10)),
     *     @OA\Parameter(name="columns", in="query", description="Columnas a seleccionar, separadas por comas. Usar * traerá todas las columnas", required=false, @OA\Schema(type="string", example="*")),
     *     @OA\Parameter(name="orderBy", in="query", description="Columna para ordenar los resultados", required=false, @OA\Schema(type="string", example="id")),
     *     @OA\Parameter(name="orderDirection", in="query", description="Dirección de ordenamiento (asc o desc)", required=false, @OA\Schema(type="string", example="asc")),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="propietario,tipoVehiculo")),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(
     *             type="string",
     *             example="{""placa"":{""like"":""%ABC%""},""tipo_veh_id"":{""="":1},""servicio"":{""="":true}}"
     *         )
     *     ),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de vehículos obtenida exitosamente",
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
     *     path="/api/vehiculos/{id}",
     *     summary="Obtener un vehículo por ID",
     *     tags={"Vehículos"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del vehículo", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="propietario,tipoVehiculo")),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Vehículo obtenido exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=404, description="Vehículo no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/vehiculos",
     *     summary="Crear un nuevo vehículo",
     *     tags={"Vehículos"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"color","marca","placa","modelo","propietario_id","tipo_veh_id"},
     *             @OA\Property(property="color", type="string", example="Rojo"),
     *             @OA\Property(property="marca", type="string", example="Toyota"),
     *             @OA\Property(property="placa", type="string", example="ABC123"),
     *             @OA\Property(property="modelo", type="string", example="2019"),
     *             @OA\Property(property="servicio", type="boolean", example=false),
     *             @OA\Property(property="propietario_id", type="integer", example=10),
     *             @OA\Property(property="tipo_veh_id", type="integer", example=2)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Vehículo creado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(StoreVehiculoRequest $request)
    {

        // --- INYECCIÓN DEL GUARDIÁN DE PROPIEDAD DE ESCRITURA ---
        // Asignación forzosa de la empresa actual al registro que se va a crear.
        // Solo un administrador (Rol 1 o 6) o Secretaría (Rol 2) puede asignar manualmente el empresa_id.
        $user = auth()->user();
        if ($user && !in_array($user->rol_id, [\App\Enums\RolesEnum::ADMIN->value, \App\Enums\RolesEnum::SUBADMIN->value, \App\Enums\RolesEnum::SECRETARIA->value])) {
            $request->merge(['empresa_id' => $user->empresa_id]);
        }
        // --------------------------------------------------------

        return parent::baseStore($request);
    }

    /**
     * @OA\Put(
     *     path="/api/vehiculos/{id}",
     *     summary="Actualizar un vehículo existente",
     *     tags={"Vehículos"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del vehículo", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"color","marca","placa","modelo","propietario_id","tipo_veh_id"},
     *             @OA\Property(property="color", type="string", example="Azul"),
     *             @OA\Property(property="marca", type="string", example="Mazda"),
     *             @OA\Property(property="placa", type="string", example="XYZ789"),
     *             @OA\Property(property="modelo", type="string", example="2021"),
     *             @OA\Property(property="servicio", type="boolean", example=true),
     *             @OA\Property(property="propietario_id", type="integer", example=12),
     *             @OA\Property(property="tipo_veh_id", type="integer", example=3)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Vehículo actualizado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function update(string $id, UpdateVehiculoRequest $request)
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
     *     path="/api/vehiculos/{id}",
     *     summary="Eliminar un vehículo",
     *     tags={"Vehículos"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del vehículo", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Vehículo eliminado exitosamente"),
     *     @OA\Response(response=404, description="Vehículo no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/vehiculos/{id}/rehabilitate",
     *     summary="Rehabilitar un vehículo eliminado",
     *     tags={"Vehículos"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del vehículo", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Vehículo rehabilitado exitosamente"),
     *     @OA\Response(response=404, description="Vehículo no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }
}
