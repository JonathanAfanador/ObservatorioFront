<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTipoEmpresaRequest;
use App\Http\Requests\UpdateTipoEmpresaRequest;

use App\Enums\Tablas;
use App\Models\TipoEmpresa;
use Illuminate\Http\Request;

class TipoEmpresaController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new TipoEmpresa(), Tablas::TIPO_EMPRESA);
    }

    /**
     * @OA\Get(
     *     path="/api/tipo-empresa",
     *     summary="Obtener la lista de tipos de empresa",
     *     tags={"Tipo Empresa"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="page", in="query", description="Número de página para la paginación", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="limit", in="query", description="Cantidad de elementos por página", required=false, @OA\Schema(type="integer", example=10)),
     *     @OA\Parameter(name="columns", in="query", description="Columnas a seleccionar, separadas por comas. Usar * traerá todas las columnas", required=false, @OA\Schema(type="string", example="*")),
     *     @OA\Parameter(name="orderBy", in="query", description="Columna para ordenar los resultados", required=false, @OA\Schema(type="string", example="id")),
     *     @OA\Parameter(name="orderDirection", in="query", description="Dirección de ordenamiento (asc o desc)", required=false, @OA\Schema(type="string", example="asc")),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="empresas")),
     *     @OA\Parameter(name="filter", in="query", description="Filtro en formato JSON para aplicar condiciones", required=false, @OA\Schema(type="string", example="{""descripcion"":{""like"":""%SAS%""}}")),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de tipos de empresa obtenida exitosamente",
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
     *     path="/api/tipo-empresa/{id}",
     *     summary="Obtener un tipo de empresa por ID",
     *     tags={"Tipo Empresa"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del tipo de empresa", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="empresas")),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Tipo de empresa obtenido exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=404, description="Tipo de empresa no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/tipo-empresa",
     *     summary="Crear un nuevo tipo de empresa",
     *     tags={"Tipo Empresa"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="descripcion", type="string", example="Sociedad por Acciones Simplificada (SAS)")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Tipo de empresa creado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(StoreTipoEmpresaRequest $request)
    {

        return parent::baseStore($request);
    }

    /**
     * @OA\Put(
     *     path="/api/tipo-empresa/{id}",
     *     summary="Actualizar un tipo de empresa existente",
     *     tags={"Tipo Empresa"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del tipo de empresa", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="descripcion", type="string", example="Empresa Unipersonal")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Tipo de empresa actualizado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, UpdateTipoEmpresaRequest $request)
    {

        return parent::baseUpdate($id, $request);
    }

    /**
     * @OA\Delete(
     *     path="/api/tipo-empresa/{id}",
     *     summary="Eliminar un tipo de empresa",
     *     tags={"Tipo Empresa"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del tipo de empresa", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Tipo de empresa eliminado exitosamente"),
     *     @OA\Response(response=404, description="Tipo de empresa no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/tipo-empresa/{id}/rehabilitate",
     *     summary="Rehabilitar un tipo de empresa eliminado",
     *     tags={"Tipo Empresa"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del tipo de empresa", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Tipo de empresa rehabilitado exitosamente"),
     *     @OA\Response(response=404, description="Tipo de empresa no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }
}
