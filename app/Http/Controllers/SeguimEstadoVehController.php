<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Models\seguim_estado_veh;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SeguimEstadoVehController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new seguim_estado_veh(), Tablas::SEGUIM_ESTADO_VEH);
    }

    /**
     * @OA\Get(
     *     path="/api/seguim-estado-veh",
     *     summary="Obtener la lista de seguimientos de estado del vehículo",
     *     tags={"SeguimEstadoVeh"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="page", in="query", description="Número de página para la paginación", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="limit", in="query", description="Cantidad de elementos por página", required=false, @OA\Schema(type="integer", example=10)),
     *     @OA\Parameter(name="columns", in="query", description="Columnas a seleccionar, separadas por comas. Usar * traerá todas las columnas", required=false, @OA\Schema(type="string", example="*")),
     *     @OA\Parameter(name="orderBy", in="query", description="Columna para ordenar los resultados", required=false, @OA\Schema(type="string", example="id")),
     *     @OA\Parameter(name="orderDirection", in="query", description="Dirección de ordenamiento (asc o desc)", required=false, @OA\Schema(type="string", example="asc")),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir (por ejemplo: usuario,vehiculo). Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="usuario,vehiculo")),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(
     *             type="string",
     *             example="{""vehiculo_id"":{""="":3},""fecha_hora"":{""between"":[""2025-01-01 00:00:00"",""2025-01-31 23:59:59""]}}"
     *         )
     *     ),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de seguimientos de estado obtenida exitosamente",
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
     *     path="/api/seguim-estado-veh/{id}",
     *     summary="Obtener un seguimiento de estado por ID",
     *     tags={"SeguimEstadoVeh"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del seguimiento", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir (usuario,vehiculo)", required=false, @OA\Schema(type="string", example="usuario,vehiculo")),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Seguimiento de estado obtenido exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=404, description="Seguimiento no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/seguim-estado-veh",
     *     summary="Crear un nuevo registro de seguimiento de estado del vehículo",
     *     tags={"SeguimEstadoVeh"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"usuario_id","vehiculo_id"},
     *             @OA\Property(property="kilometraje", type="integer", example=152340),
     *             @OA\Property(property="fecha_hora", type="string", format="date-time", example="2025-02-10 09:30:00"),
     *             @OA\Property(property="observaciones", type="string", example="Cambio de aceite y revisión general"),
     *             @OA\Property(property="usuario_id", type="integer", example=5),
     *             @OA\Property(property="vehiculo_id", type="integer", example=12)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Seguimiento creado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        $rules = [
            'kilometraje' => 'nullable|integer|min:0',
            'fecha_hora'  => 'nullable|date',
            'observaciones' => 'nullable|string',
            'usuario_id'  => 'required|integer|exists:users,id',
            'vehiculo_id' => 'required|integer|exists:vehiculo,id',
        ];

        $messages = [
            'kilometraje.integer' => 'El kilometraje debe ser un número entero.',
            'kilometraje.min'     => 'El kilometraje no puede ser negativo.',
            'fecha_hora.date'     => 'La fecha y hora no tiene un formato válido.',
            'observaciones.string'=> 'Las observaciones deben ser un texto.',
            'usuario_id.required' => 'El usuario es obligatorio.',
            'usuario_id.integer'  => 'El identificador de usuario debe ser un número entero.',
            'usuario_id.exists'   => 'El usuario seleccionado no existe.',
            'vehiculo_id.required'=> 'El vehículo es obligatorio.',
            'vehiculo_id.integer' => 'El identificador de vehículo debe ser un número entero.',
            'vehiculo_id.exists'  => 'El vehículo seleccionado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::store($request);
    }

    /**
     * @OA\Put(
     *     path="/api/seguim-estado-veh/{id}",
     *     summary="Actualizar un registro de seguimiento de estado del vehículo",
     *     tags={"SeguimEstadoVeh"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del seguimiento", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="kilometraje", type="integer", example=152500),
     *             @OA\Property(property="fecha_hora", type="string", format="date-time", example="2025-02-11 10:15:00"),
     *             @OA\Property(property="observaciones", type="string", example="Se detecta vibración en alta velocidad"),
     *             @OA\Property(property="usuario_id", type="integer", example=5),
     *             @OA\Property(property="vehiculo_id", type="integer", example=12)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Seguimiento actualizado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, Request $request)
    {
        $rules = [
            'kilometraje' => 'nullable|integer|min:0',
            'fecha_hora'  => 'nullable|date',
            'observaciones' => 'nullable|string',
            'usuario_id'  => 'nullable|integer|exists:users,id',
            'vehiculo_id' => 'nullable|integer|exists:vehiculo,id',
        ];

        $messages = [
            'kilometraje.integer' => 'El kilometraje debe ser un número entero.',
            'kilometraje.min'     => 'El kilometraje no puede ser negativo.',
            'fecha_hora.date'     => 'La fecha y hora no tiene un formato válido.',
            'observaciones.string'=> 'Las observaciones deben ser un texto.',
            'usuario_id.integer'  => 'El identificador de usuario debe ser un número entero.',
            'usuario_id.exists'   => 'El usuario seleccionado no existe.',
            'vehiculo_id.integer' => 'El identificador de vehículo debe ser un número entero.',
            'vehiculo_id.exists'  => 'El vehículo seleccionado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::update($id, $request);
    }

    /**
     * @OA\Delete(
     *     path="/api/seguim-estado-veh/{id}",
     *     summary="Eliminar un registro de seguimiento de estado del vehículo",
     *     tags={"SeguimEstadoVeh"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del seguimiento", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Seguimiento eliminado exitosamente"),
     *     @OA\Response(response=404, description="Seguimiento no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/seguim-estado-veh/{id}/rehabilitate",
     *     summary="Rehabilitar un seguimiento de estado eliminado",
     *     tags={"SeguimEstadoVeh"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del seguimiento", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Seguimiento rehabilitado exitosamente"),
     *     @OA\Response(response=404, description="Seguimiento no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }
}
