<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Models\seguim_gps;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SeguimGpsController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new seguim_gps(), Tablas::SEGUIM_GPS);
    }

    /**
     * @OA\Get(
     *     path="/api/seguim-gps",
     *     summary="Obtener la lista de seguimientos GPS",
     *     tags={"SeguimGps"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="page", in="query", description="Número de página para la paginación", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="limit", in="query", description="Cantidad de elementos por página", required=false, @OA\Schema(type="integer", example=10)),
     *     @OA\Parameter(name="columns", in="query", description="Columnas a seleccionar, separadas por comas. Usar * traerá todas las columnas", required=false, @OA\Schema(type="string", example="*")),
     *     @OA\Parameter(name="orderBy", in="query", description="Columna para ordenar los resultados", required=false, @OA\Schema(type="string", example="id")),
     *     @OA\Parameter(name="orderDirection", in="query", description="Dirección de ordenamiento (asc o desc)", required=false, @OA\Schema(type="string", example="asc")),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir (por ejemplo: vehiculo). Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="vehiculo")),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(
     *             type="string",
     *             example="{""vehiculo_id"":{""="":1},""fecha_hora"":{""between"":[""2025-01-01 00:00:00"",""2025-01-31 23:59:59""]}}"
     *         )
     *     ),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de seguimientos GPS obtenida exitosamente",
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
     *     path="/api/seguim-gps/{id}",
     *     summary="Obtener un seguimiento GPS por ID",
     *     tags={"SeguimGps"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del seguimiento", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir (vehiculo)", required=false, @OA\Schema(type="string", example="vehiculo")),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Seguimiento GPS obtenido exitosamente",
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
     *     path="/api/seguim-gps",
     *     summary="Crear un nuevo registro de seguimiento GPS",
     *     tags={"SeguimGps"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"vehiculo_id"},
     *             @OA\Property(property="latitud", type="number", example=4.7110),
     *             @OA\Property(property="longitud", type="number", example=-74.0721),
     *             @OA\Property(property="fecha_hora", type="string", format="date-time", example="2025-01-15 08:30:00"),
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
            'latitud'     => 'nullable|numeric|between:-90,90',
            'longitud'    => 'nullable|numeric|between:-180,180',
            'fecha_hora'  => 'nullable|date',
            'vehiculo_id' => 'required|integer|exists:vehiculo,id',
        ];

        $messages = [
            'latitud.numeric'     => 'La latitud debe ser numérica.',
            'latitud.between'     => 'La latitud debe estar entre -90 y 90.',
            'longitud.numeric'    => 'La longitud debe ser numérica.',
            'longitud.between'    => 'La longitud debe estar entre -180 y 180.',
            'fecha_hora.date'     => 'La fecha y hora no tiene un formato válido.',
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
     *     path="/api/seguim-gps/{id}",
     *     summary="Actualizar un registro de seguimiento GPS",
     *     tags={"SeguimGps"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del seguimiento", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="latitud", type="number", example=6.2518),
     *             @OA\Property(property="longitud", type="number", example=-75.5636),
     *             @OA\Property(property="fecha_hora", type="string", format="date-time", example="2025-01-16 14:45:00"),
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
            'latitud'     => 'nullable|numeric|between:-90,90',
            'longitud'    => 'nullable|numeric|between:-180,180',
            'fecha_hora'  => 'nullable|date',
            'vehiculo_id' => 'nullable|integer|exists:vehiculo,id',
        ];

        $messages = [
            'latitud.numeric'     => 'La latitud debe ser numérica.',
            'latitud.between'     => 'La latitud debe estar entre -90 y 90.',
            'longitud.numeric'    => 'La longitud debe ser numérica.',
            'longitud.between'    => 'La longitud debe estar entre -180 y 180.',
            'fecha_hora.date'     => 'La fecha y hora no tiene un formato válido.',
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
     *     path="/api/seguim-gps/{id}",
     *     summary="Eliminar un registro de seguimiento GPS",
     *     tags={"SeguimGps"},
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
     *     path="/api/seguim-gps/{id}/rehabilitate",
     *     summary="Rehabilitar un seguimiento GPS eliminado",
     *     tags={"SeguimGps"},
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
