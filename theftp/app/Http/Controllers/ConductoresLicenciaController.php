<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Models\conductores_licencias;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConductoresLicenciaController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new conductores_licencias(), Tablas::CONDUCTORES_LICENCIAS);
    }

    /**
     * @OA\Get(
     *     path="/api/conductores-licencias",
     *     summary="Obtener la lista de conductores/licencias",
     *     tags={"ConductoresLicencias"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="page", in="query", description="Número de página para la paginación", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="limit", in="query", description="Cantidad de elementos por página", required=false, @OA\Schema(type="integer", example=10)),
     *     @OA\Parameter(name="columns", in="query", description="Columnas a seleccionar, separadas por comas. Usar * traerá todas las columnas", required=false, @OA\Schema(type="string", example="*")),
     *     @OA\Parameter(name="orderBy", in="query", description="Columna para ordenar los resultados", required=false, @OA\Schema(type="string", example="id")),
     *     @OA\Parameter(name="orderDirection", in="query", description="Dirección de ordenamiento (asc o desc)", required=false, @OA\Schema(type="string", example="asc")),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="conductor,licencia")),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(type="string", example="{""licencia_id"":{""="":1},""conductor_id"":{""="":5}}")
     *     ),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de relaciones conductor-licencia obtenida exitosamente",
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
     *     path="/api/conductores-licencias/{id}",
     *     summary="Obtener una relación conductor-licencia por ID",
     *     tags={"ConductoresLicencias"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID de la relación", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir (conductor, licencia)", required=false, @OA\Schema(type="string", example="conductor,licencia")),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
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
     *     path="/api/conductores-licencias",
     *     summary="Crear una nueva relación conductor-licencia",
     *     tags={"ConductoresLicencias"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"licencia_id","conductor_id"},
     *             @OA\Property(property="licencia_id", type="integer", example=3),
     *             @OA\Property(property="conductor_id", type="integer", example=7)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Relación creada exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        $rules = [
            'licencia_id' => 'required|integer|exists:licencias,id',
            'conductor_id'=> 'required|integer|exists:conductores,id',
        ];

        $messages = [
            'licencia_id.required' => 'La licencia es obligatoria.',
            'licencia_id.integer'  => 'El identificador de licencia debe ser un número entero.',
            'licencia_id.exists'   => 'La licencia seleccionada no existe.',
            'conductor_id.required'=> 'El conductor es obligatorio.',
            'conductor_id.integer' => 'El identificador de conductor debe ser un número entero.',
            'conductor_id.exists'  => 'El conductor seleccionado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::store($request);
    }

    /**
     * @OA\Put(
     *     path="/api/conductores-licencias/{id}",
     *     summary="Actualizar una relación conductor-licencia",
     *     tags={"ConductoresLicencias"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID de la relación", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"licencia_id","conductor_id"},
     *             @OA\Property(property="licencia_id", type="integer", example=4),
     *             @OA\Property(property="conductor_id", type="integer", example=10)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Relación actualizada exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, Request $request)
    {
        $rules = [
            'licencia_id' => 'required|integer|exists:licencias,id',
            'conductor_id'=> 'required|integer|exists:conductores,id',
        ];

        $messages = [
            'licencia_id.required' => 'La licencia es obligatoria.',
            'licencia_id.integer'  => 'El identificador de licencia debe ser un número entero.',
            'licencia_id.exists'   => 'La licencia seleccionada no existe.',
            'conductor_id.required'=> 'El conductor es obligatorio.',
            'conductor_id.integer' => 'El identificador de conductor debe ser un número entero.',
            'conductor_id.exists'  => 'El conductor seleccionado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::update($id, $request);
    }

    /**
     * @OA\Delete(
     *     path="/api/conductores-licencias/{id}",
     *     summary="Eliminar una relación conductor-licencia",
     *     tags={"ConductoresLicencias"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID de la relación", required=true, @OA\Schema(type="integer", example=1)),
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
     *     path="/api/conductores-licencias/{id}/rehabilitate",
     *     summary="Rehabilitar una relación conductor-licencia eliminada",
     *     tags={"ConductoresLicencias"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID de la relación", required=true, @OA\Schema(type="integer", example=1)),
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
