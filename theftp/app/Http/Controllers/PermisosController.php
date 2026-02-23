<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Models\permisos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PermisosController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new permisos(), Tablas::PERMISOS);
    }

    /**
     * @OA\Get(
     *     path="/api/permisos",
     *     summary="Obtener la lista de permisos",
     *     tags={"Permisos"},
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
     *         @OA\Schema(type="string", example="rol")
     *     ),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(
     *             type="string",
     *             example="{""tabla"":{""like"":""%usuarios%""},""rol_id"":{""="":1},""create"":{""="":true}}"
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
     *         description="Lista de permisos obtenida exitosamente",
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
     *     path="/api/permisos/{id}",
     *     summary="Obtener un permiso por ID",
     *     tags={"Permisos"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del permiso",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Parameter(
     *         name="include",
     *         in="query",
     *         description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible",
     *         required=false,
     *         @OA\Schema(type="string", example="rol")
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
     *         description="Permiso obtenido exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=404, description="Permiso no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/permisos",
     *     summary="Crear un nuevo permiso",
     *     tags={"Permisos"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="tabla", type="string", example="usuarios"),
     *             @OA\Property(property="create", type="boolean", example=true),
     *             @OA\Property(property="read", type="boolean", example=true),
     *             @OA\Property(property="update", type="boolean", example=false),
     *             @OA\Property(property="delete", type="boolean", example=false),
     *             @OA\Property(property="rol_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Permiso creado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        $rules = [
            'tabla'  => 'required|string|max:255',
            'create' => 'required|boolean',
            'read'   => 'required|boolean',
            'update' => 'required|boolean',
            'delete' => 'required|boolean',
            'rol_id' => 'required|integer|exists:rol,id',
        ];

        $messages = [
            'tabla.required'  => 'El campo tabla es obligatorio.',
            'tabla.string'    => 'El campo tabla debe ser una cadena de texto.',
            'tabla.max'       => 'El campo tabla no debe exceder 255 caracteres.',
            'create.required' => 'El permiso de creación es obligatorio.',
            'create.boolean'  => 'El permiso de creación debe ser verdadero o falso.',
            'read.required'   => 'El permiso de lectura es obligatorio.',
            'read.boolean'    => 'El permiso de lectura debe ser verdadero o falso.',
            'update.required' => 'El permiso de actualización es obligatorio.',
            'update.boolean'  => 'El permiso de actualización debe ser verdadero o falso.',
            'delete.required' => 'El permiso de eliminación es obligatorio.',
            'delete.boolean'  => 'El permiso de eliminación debe ser verdadero o falso.',
            'rol_id.required' => 'El campo rol_id es obligatorio.',
            'rol_id.integer'  => 'El campo rol_id debe ser un número entero.',
            'rol_id.exists'   => 'El rol especificado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::store($request);
    }

    /**
     * @OA\Put(
     *     path="/api/permisos/{id}",
     *     summary="Actualizar un permiso existente",
     *     tags={"Permisos"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del permiso",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="tabla", type="string", example="departamentos"),
     *             @OA\Property(property="create", type="boolean", example=false),
     *             @OA\Property(property="read", type="boolean", example=true),
     *             @OA\Property(property="update", type="boolean", example=true),
     *             @OA\Property(property="delete", type="boolean", example=false),
     *             @OA\Property(property="rol_id", type="integer", example=2)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Permiso actualizado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, Request $request)
    {
        $rules = [
            'tabla'  => 'required|string|max:255',
            'create' => 'required|boolean',
            'read'   => 'required|boolean',
            'update' => 'required|boolean',
            'delete' => 'required|boolean',
            'rol_id' => 'required|integer|exists:rol,id',
        ];

        $messages = [
            'tabla.required'  => 'El campo tabla es obligatorio.',
            'tabla.string'    => 'El campo tabla debe ser una cadena de texto.',
            'tabla.max'       => 'El campo tabla no debe exceder 255 caracteres.',
            'create.required' => 'El permiso de creación es obligatorio.',
            'create.boolean'  => 'El permiso de creación debe ser verdadero o falso.',
            'read.required'   => 'El permiso de lectura es obligatorio.',
            'read.boolean'    => 'El permiso de lectura debe ser verdadero o falso.',
            'update.required' => 'El permiso de actualización es obligatorio.',
            'update.boolean'  => 'El permiso de actualización debe ser verdadero o falso.',
            'delete.required' => 'El permiso de eliminación es obligatorio.',
            'delete.boolean'  => 'El permiso de eliminación debe ser verdadero o falso.',
            'rol_id.required' => 'El campo rol_id es obligatorio.',
            'rol_id.integer'  => 'El campo rol_id debe ser un número entero.',
            'rol_id.exists'   => 'El rol especificado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::update($id, $request);
    }

    /**
     * @OA\Delete(
     *     path="/api/permisos/{id}",
     *     summary="Eliminar un permiso",
     *     tags={"Permisos"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del permiso",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Permiso eliminado exitosamente"),
     *     @OA\Response(response=404, description="Permiso no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/permisos/{id}/rehabilitate",
     *     summary="Rehabilitar un permiso eliminado",
     *     tags={"Permisos"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del permiso",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Permiso rehabilitado exitosamente"),
     *     @OA\Response(response=404, description="Permiso no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }
}
