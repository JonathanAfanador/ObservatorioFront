<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Models\tipo_vehiculo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TipoVehiculoController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new tipo_vehiculo(), Tablas::TIPO_VEHICULO);
    }

    /**
     * @OA\Get(
     *     path="/api/tipo-vehiculo",
     *     summary="Obtener la lista de tipos de vehículo",
     *     tags={"TipoVehiculo"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="page", in="query", description="Número de página para la paginación", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="limit", in="query", description="Cantidad de elementos por página", required=false, @OA\Schema(type="integer", example=10)),
     *     @OA\Parameter(name="columns", in="query", description="Columnas a seleccionar, separadas por comas. Usar * traerá todas las columnas", required=false, @OA\Schema(type="string", example="*")),
     *     @OA\Parameter(name="orderBy", in="query", description="Columna para ordenar los resultados", required=false, @OA\Schema(type="string", example="id")),
     *     @OA\Parameter(name="orderDirection", in="query", description="Dirección de ordenamiento (asc o desc)", required=false, @OA\Schema(type="string", example="asc")),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="vehiculos")),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(
     *             type="string",
     *             example="{""descripcion"":{""like"":""%BUS%""},""capacidad"":{""="">= 40}}"
     *         )
     *     ),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de tipos de vehículo obtenida exitosamente",
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
     *     path="/api/tipo-vehiculo/{id}",
     *     summary="Obtener un tipo de vehículo por ID",
     *     tags={"TipoVehiculo"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del tipo de vehículo", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="vehiculos")),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Tipo de vehículo obtenido exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=404, description="Tipo de vehículo no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/tipo-vehiculo",
     *     summary="Crear un nuevo tipo de vehículo",
     *     tags={"TipoVehiculo"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="descripcion", type="string", example="Bus"),
     *             @OA\Property(property="capacidad", type="integer", nullable=true, example=40)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Tipo de vehículo creado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        $rules = [
            'descripcion' => 'required|string|max:255',
            'capacidad'   => 'nullable|integer|min:0',
        ];

        $messages = [
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.string'   => 'La descripción debe ser una cadena de texto.',
            'descripcion.max'      => 'La descripción no debe exceder 255 caracteres.',
            'capacidad.integer'    => 'La capacidad debe ser un número entero.',
            'capacidad.min'        => 'La capacidad no puede ser negativa.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::store($request);
    }

    /**
     * @OA\Put(
     *     path="/api/tipo-vehiculo/{id}",
     *     summary="Actualizar un tipo de vehículo existente",
     *     tags={"TipoVehiculo"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del tipo de vehículo", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="descripcion", type="string", example="Bus"),
     *             @OA\Property(property="capacidad", type="integer", nullable=true, example=45)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Tipo de vehículo actualizado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, Request $request)
    {
        $rules = [
            'descripcion' => 'required|string|max:255',
            'capacidad'   => 'nullable|integer|min:0',
        ];

        $messages = [
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.string'   => 'La descripción debe ser una cadena de texto.',
            'descripcion.max'      => 'La descripción no debe exceder 255 caracteres.',
            'capacidad.integer'    => 'La capacidad debe ser un número entero.',
            'capacidad.min'        => 'La capacidad no puede ser negativa.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::update($id, $request);
    }

    /**
     * @OA\Delete(
     *     path="/api/tipo-vehiculo/{id}",
     *     summary="Eliminar un tipo de vehículo",
     *     tags={"TipoVehiculo"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del tipo de vehículo", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Tipo de vehículo eliminado exitosamente"),
     *     @OA\Response(response=404, description="Tipo de vehículo no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/tipo-vehiculo/{id}/rehabilitate",
     *     summary="Rehabilitar un tipo de vehículo eliminado",
     *     tags={"TipoVehiculo"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del tipo de vehículo", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Tipo de vehículo rehabilitado exitosamente"),
     *     @OA\Response(response=404, description="Tipo de vehículo no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }
}
