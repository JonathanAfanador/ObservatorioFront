<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Models\empresas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EmpresasController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new empresas(), Tablas::EMPRESAS);
    }

    /**
     * @OA\Get(
     *     path="/api/empresas",
     *     summary="Obtener la lista de empresas",
     *     tags={"Empresas"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="page", in="query", description="Número de página para la paginación", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="limit", in="query", description="Cantidad de elementos por página", required=false, @OA\Schema(type="integer", example=10)),
     *     @OA\Parameter(name="columns", in="query", description="Columnas a seleccionar, separadas por comas. Usar * traerá todas las columnas", required=false, @OA\Schema(type="string", example="*")),
     *     @OA\Parameter(name="orderBy", in="query", description="Columna para ordenar los resultados", required=false, @OA\Schema(type="string", example="id")),
     *     @OA\Parameter(name="orderDirection", in="query", description="Dirección de ordenamiento (asc o desc)", required=false, @OA\Schema(type="string", example="asc")),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="tipo_empresa")),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(type="string", example="{""name"":{""like"":""%ACME%""},""nit"":{""="":""900123456-7""}}")
     *     ),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de empresas obtenida exitosamente",
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
     *     path="/api/empresas/{id}",
     *     summary="Obtener una empresa por ID",
     *     tags={"Empresas"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID de la empresa", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="tipo_empresa")),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Empresa obtenida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=404, description="Empresa no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/empresas",
     *     summary="Crear una nueva empresa",
     *     tags={"Empresas"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="nit", type="string", example="900123456-7"),
     *             @OA\Property(property="name", type="string", example="ACME S.A."),
     *             @OA\Property(property="tipo_empresa_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Empresa creada exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        $rules = [
            'nit'              => 'required|string|max:255',
            'name'             => 'required|string|max:255',
            'tipo_empresa_id'  => 'required|integer|exists:tipo_empresa,id',
        ];

        $messages = [
            'nit.required'             => 'El campo NIT es obligatorio.',
            'nit.string'               => 'El campo NIT debe ser una cadena de texto.',
            'nit.max'                  => 'El campo NIT no debe exceder 255 caracteres.',
            'name.required'            => 'El campo nombre es obligatorio.',
            'name.string'              => 'El campo nombre debe ser una cadena de texto.',
            'name.max'                 => 'El campo nombre no debe exceder 255 caracteres.',
            'tipo_empresa_id.required' => 'El campo tipo de empresa es obligatorio.',
            'tipo_empresa_id.integer'  => 'El campo tipo de empresa debe ser un número entero.',
            'tipo_empresa_id.exists'   => 'El tipo de empresa especificado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::store($request);
    }

    /**
     * @OA\Put(
     *     path="/api/empresas/{id}",
     *     summary="Actualizar una empresa existente",
     *     tags={"Empresas"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID de la empresa", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="nit", type="string", example="901234567-8"),
     *             @OA\Property(property="name", type="string", example="ACME S.A.S."),
     *             @OA\Property(property="tipo_empresa_id", type="integer", example=2)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Empresa actualizada exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, Request $request)
    {
        $rules = [
            'nit'              => 'required|string|max:255',
            'name'             => 'required|string|max:255',
            'tipo_empresa_id'  => 'required|integer|exists:tipo_empresa,id',
        ];

        $messages = [
            'nit.required'             => 'El campo NIT es obligatorio.',
            'nit.string'               => 'El campo NIT debe ser una cadena de texto.',
            'nit.max'                  => 'El campo NIT no debe exceder 255 caracteres.',
            'name.required'            => 'El campo nombre es obligatorio.',
            'name.string'              => 'El campo nombre debe ser una cadena de texto.',
            'name.max'                 => 'El campo nombre no debe exceder 255 caracteres.',
            'tipo_empresa_id.required' => 'El campo tipo de empresa es obligatorio.',
            'tipo_empresa_id.integer'  => 'El campo tipo de empresa debe ser un número entero.',
            'tipo_empresa_id.exists'   => 'El tipo de empresa especificado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::update($id, $request);
    }

    /**
     * @OA\Delete(
     *     path="/api/empresas/{id}",
     *     summary="Eliminar una empresa",
     *     tags={"Empresas"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID de la empresa", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Empresa eliminada exitosamente"),
     *     @OA\Response(response=404, description="Empresa no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/empresas/{id}/rehabilitate",
     *     summary="Rehabilitar una empresa eliminada",
     *     tags={"Empresas"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID de la empresa", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Empresa rehabilitada exitosamente"),
     *     @OA\Response(response=404, description="Empresa no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }
}
