<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Models\menus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MenusController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new menus(), Tablas::MENUS);
    }

    /**
     * @OA\Get(
     *     path="/api/menus",
     *     summary="Obtener la lista de menús",
     *     tags={"Menus"},
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
     *         @OA\Schema(type="string", example="padre,hijos")
     *     ),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(
     *             type="string",
     *             example="{""name"":{""like"":""%Admin%""},""padre_id"":{""="":1}}"
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
     *         description="Lista de menús obtenida exitosamente",
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
     *     path="/api/menus/{id}",
     *     summary="Obtener un menú por ID",
     *     tags={"Menus"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del menú",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Parameter(
     *         name="include",
     *         in="query",
     *         description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible",
     *         required=false,
     *         @OA\Schema(type="string", example="padre,hijos")
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
     *         description="Menú obtenido exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=404, description="Menú no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/menus",
     *     summary="Crear un nuevo menú",
     *     tags={"Menus"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Usuarios"),
     *             @OA\Property(property="icon", type="string", example="users"),
     *             @OA\Property(property="url", type="string", example="/admin/usuarios"),
     *             @OA\Property(property="padre_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Menú creado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        $rules = [
            'name'     => 'required|string',
            'icon'     => 'nullable|string',
            'url'      => 'nullable|string',
            'padre_id' => 'required|integer|exists:menus,id',
        ];

        $messages = [
            'name.required'     => 'El campo nombre es obligatorio.',
            'name.string'       => 'El campo nombre debe ser una cadena de texto.',
            'icon.string'       => 'El campo icono debe ser una cadena de texto.',
            'url.string'        => 'El campo url debe ser una cadena de texto.',
            'padre_id.required' => 'El campo padre_id es obligatorio.',
            'padre_id.integer'  => 'El campo padre_id debe ser un número entero.',
            'padre_id.exists'   => 'El menú padre especificado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::store($request);
    }

    /**
     * @OA\Put(
     *     path="/api/menus/{id}",
     *     summary="Actualizar un menú existente",
     *     tags={"Menus"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del menú",
     *         required=true,
     *         @OA\Schema(type="integer", example=5)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Gestión de Usuarios"),
     *             @OA\Property(property="icon", type="string", example="shield-user"),
     *             @OA\Property(property="url", type="string", example="/admin/usuarios"),
     *             @OA\Property(property="padre_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Menú actualizado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, Request $request)
    {
        $rules = [
            'name'     => 'required|string',
            'icon'     => 'nullable|string',
            'url'      => 'nullable|string',
            'padre_id' => 'required|integer|exists:menus,id',
        ];

        $messages = [
            'name.required'     => 'El campo nombre es obligatorio.',
            'name.string'       => 'El campo nombre debe ser una cadena de texto.',
            'icon.string'       => 'El campo icono debe ser una cadena de texto.',
            'url.string'        => 'El campo url debe ser una cadena de texto.',
            'padre_id.required' => 'El campo padre_id es obligatorio.',
            'padre_id.integer'  => 'El campo padre_id debe ser un número entero.',
            'padre_id.exists'   => 'El menú padre especificado no existe.',
        ];

        // Nota: si en tu dominio permites que un menú sea raíz (sin padre),
        // cambia la regla de 'padre_id' a 'nullable|integer|exists:menus,id' y
        // ajusta la columna en la BD para permitir NULL.

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::update($id, $request);
    }

    /**
     * @OA\Delete(
     *     path="/api/menus/{id}",
     *     summary="Eliminar un menú",
     *     tags={"Menus"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del menú",
     *         required=true,
     *         @OA\Schema(type="integer", example=5)
     *     ),
     *     @OA\Response(response=200, description="Menú eliminado exitosamente"),
     *     @OA\Response(response=404, description="Menú no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/menus/{id}/rehabilitate",
     *     summary="Rehabilitar un menú eliminado",
     *     tags={"Menus"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del menú",
     *         required=true,
     *         @OA\Schema(type="integer", example=5)
     *     ),
     *     @OA\Response(response=200, description="Menú rehabilitado exitosamente"),
     *     @OA\Response(response=404, description="Menú no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }
}
