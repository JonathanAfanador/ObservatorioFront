<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Models\propietarios;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PropietariosController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new propietarios(), Tablas::PROPIETARIOS);
    }

    /**
     * @OA\Get(
     *     path="/api/propietarios",
     *     summary="Obtener la lista de propietarios",
     *     tags={"Propietarios"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="page", in="query", description="Número de página para la paginación", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="limit", in="query", description="Cantidad de elementos por página", required=false, @OA\Schema(type="integer", example=10)),
     *     @OA\Parameter(name="columns", in="query", description="Columnas a seleccionar, separadas por comas. Usar * traerá todas las columnas", required=false, @OA\Schema(type="string", example="*")),
     *     @OA\Parameter(name="orderBy", in="query", description="Columna para ordenar los resultados", required=false, @OA\Schema(type="string", example="id")),
     *     @OA\Parameter(name="orderDirection", in="query", description="Dirección de ordenamiento (asc o desc)", required=false, @OA\Schema(type="string", example="asc")),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="documento")),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(type="string", example="{""documento_id"":{""="":1},""fecha_registro"":{""between"":[""2024-01-01"",""2024-12-31""]}}")
     *     ),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de propietarios obtenida exitosamente",
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
     *     path="/api/propietarios/{id}",
     *     summary="Obtener un propietario por ID",
     *     tags={"Propietarios"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del propietario", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="documento")),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Propietario obtenido exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=404, description="Propietario no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

  /**
     * @OA\Post(
     * path="/api/propietarios",
     * summary="Crear un nuevo propietario",
     * tags={"Propietarios"},
     * security={{"sanctum": {}}},
     * @OA\RequestBody(
     * required=true,
     * @OA\JsonContent(
     * required={"persona_id", "documento_id"},
     * @OA\Property(property="fecha_registro", type="string", format="date-time", nullable=true, example="2025-01-15 10:30:00"),
     * @OA\Property(property="documento_id", type="integer", example=5),
     * @OA\Property(property="persona_id", type="integer", example=10)
     * )
     * ),
     * @OA\Response(response=201, description="Propietario creado exitosamente"),
     * @OA\Response(response=422, description="Error de validación"),
     * @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        $rules = [
            'fecha_registro' => 'nullable|date',
            'documento_id'   => 'required|integer|exists:documentos,id',
            'persona_id'     => 'required|integer|exists:personas,id' // <--- NUEVA REGLA
        ];

        $messages = [
            'fecha_registro.date'   => 'La fecha de registro debe ser una fecha válida.',
            'documento_id.required' => 'El campo documento_id es obligatorio.',
            'documento_id.integer'  => 'El campo documento_id debe ser un número entero.',
            'documento_id.exists'   => 'El documento seleccionado no existe.',
            'persona_id.required'   => 'Debe asociar una persona al propietario.',
            'persona_id.exists'     => 'La persona seleccionada no existe.'
        ];

        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::store($request);
    }
    /**
     * @OA\Put(
     * path="/api/propietarios/{id}",
     * summary="Actualizar un propietario existente",
     * tags={"Propietarios"},
     * security={{"sanctum": {}}},
     * @OA\Parameter(name="id", in="path", description="ID del propietario", required=true, @OA\Schema(type="integer", example=1)),
     * @OA\RequestBody(
     * required=true,
     * @OA\JsonContent(
     * @OA\Property(property="fecha_registro", type="string", format="date-time", nullable=true),
     * @OA\Property(property="documento_id", type="integer", example=5),
     * @OA\Property(property="persona_id", type="integer", example=10)
     * )
     * ),
     * @OA\Response(response=200, description="Propietario actualizado exitosamente"),
     * @OA\Response(response=422, description="Error de validación"),
     * @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, Request $request)
    {
        $rules = [
            'fecha_registro' => 'nullable|date',
            'documento_id'   => 'required|integer|exists:documentos,id',
            'persona_id'     => 'required|integer|exists:personas,id' // <--- NUEVA REGLA
        ];

        $messages = [
            'fecha_registro.date'   => 'La fecha de registro debe ser una fecha válida.',
            'documento_id.required' => 'El campo documento_id es obligatorio.',
            'documento_id.exists'   => 'El documento seleccionado no existe.',
            'persona_id.required'   => 'Debe asociar una persona.',
            'persona_id.exists'     => 'La persona seleccionada no existe.'
        ];

        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::update($id, $request);
    }
    /**
     * @OA\Delete(
     *     path="/api/propietarios/{id}",
     *     summary="Eliminar un propietario",
     *     tags={"Propietarios"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del propietario", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Propietario eliminado exitosamente"),
     *     @OA\Response(response=404, description="Propietario no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/propietarios/{id}/rehabilitate",
     *     summary="Rehabilitar un propietario eliminado",
     *     tags={"Propietarios"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del propietario", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Propietario rehabilitado exitosamente"),
     *     @OA\Response(response=404, description="Propietario no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }
}
