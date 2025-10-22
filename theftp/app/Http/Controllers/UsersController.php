<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UsersController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new User(), Tablas::USERS);
    }

    /**
     * @OA\Get(
     *     path="/api/users",
     *     summary="Obtener la lista de usuarios",
     *     tags={"Users"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="page", in="query", description="Número de página para la paginación", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="limit", in="query", description="Cantidad de elementos por página", required=false, @OA\Schema(type="integer", example=10)),
     *     @OA\Parameter(name="columns", in="query", description="Columnas a seleccionar, separadas por comas. Usar * traerá todas las columnas", required=false, @OA\Schema(type="string", example="*")),
     *     @OA\Parameter(name="orderBy", in="query", description="Columna para ordenar los resultados", required=false, @OA\Schema(type="string", example="id")),
     *     @OA\Parameter(name="orderDirection", in="query", description="Dirección de ordenamiento (asc o desc)", required=false, @OA\Schema(type="string", example="asc")),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="persona,rol,empresa")),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(
     *             type="string",
     *             example="{""email"":{""like"":""%@acme.com%""},""rol_id"":{""="":2}}"
     *         )
     *     ),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de usuarios obtenida exitosamente",
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
     *     path="/api/users/{id}",
     *     summary="Obtener un usuario por ID",
     *     tags={"Users"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del usuario", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="persona,rol,empresa")),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Usuario obtenido exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=404, description="Usuario no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/users",
     *     summary="Crear un nuevo usuario",
     *     tags={"Users"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Juan Pérez"),
     *             @OA\Property(property="email", type="string", example="juan.perez@acme.com"),
     *             @OA\Property(property="password", type="string", example="S3guroYSecreto"),
     *             @OA\Property(property="unable", type="boolean", example=false),
     *             @OA\Property(property="unable_date", type="string", format="date-time", example="2025-01-31 08:00:00"),
     *             @OA\Property(property="email_verified_at", type="string", format="date-time", example="2025-02-01 10:30:00"),
     *             @OA\Property(property="persona_id", type="integer", example=1),
     *             @OA\Property(property="rol_id", type="integer", example=2),
     *             @OA\Property(property="empresa_id", type="integer", nullable=true, example=3)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Usuario creado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        $rules = [
            'name'              => 'required|string|max:255',
            'email'             => 'required|string|email|max:255|unique:users,email',
            'password'          => 'required|string|min:8',
            'unable'            => 'sometimes|boolean',
            'unable_date'       => 'nullable|date',
            'email_verified_at' => 'nullable|date',
            'persona_id'        => 'required|integer|exists:personas,id',
            'rol_id'            => 'required|integer|exists:rol,id',
            'empresa_id'        => 'nullable|integer|exists:empresas,id',
        ];

        $messages = [
            'name.required'        => 'El campo nombre es obligatorio.',
            'email.required'       => 'El campo email es obligatorio.',
            'email.email'          => 'El campo email debe ser un correo válido.',
            'email.unique'         => 'El correo ya está registrado.',
            'password.required'    => 'El campo contraseña es obligatorio.',
            'password.min'         => 'La contraseña debe tener al menos 8 caracteres.',
            'persona_id.required'  => 'El campo persona es obligatorio.',
            'persona_id.exists'    => 'La persona especificada no existe.',
            'rol_id.required'      => 'El campo rol es obligatorio.',
            'rol_id.exists'        => 'El rol especificado no existe.',
            'empresa_id.exists'    => 'La empresa especificada no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        // Hash de contraseña antes de guardar
        $request->merge([
            'password' => Hash::make($request->input('password')),
        ]);

        return parent::store($request);
    }

    /**
     * @OA\Put(
     *     path="/api/users/{id}",
     *     summary="Actualizar un usuario existente",
     *     tags={"Users"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del usuario", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Juan A. Pérez"),
     *             @OA\Property(property="email", type="string", example="juan.perez@acme.com"),
     *             @OA\Property(property="password", type="string", example="NuevaC0ntraseñaSegura"),
     *             @OA\Property(property="unable", type="boolean", example=false),
     *             @OA\Property(property="unable_date", type="string", format="date-time", example="2025-01-31 08:00:00"),
     *             @OA\Property(property="email_verified_at", type="string", format="date-time", example="2025-02-01 10:30:00"),
     *             @OA\Property(property="persona_id", type="integer", example=1),
     *             @OA\Property(property="rol_id", type="integer", example=2),
     *             @OA\Property(property="empresa_id", type="integer", nullable=true, example=3)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Usuario actualizado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, Request $request)
    {
        $rules = [
            'name'              => 'required|string|max:255',
            'email'             => 'required|string|email|max:255|unique:users,email,' . $id,
            'password'          => 'sometimes|nullable|string|min:8',
            'unable'            => 'sometimes|boolean',
            'unable_date'       => 'nullable|date',
            'email_verified_at' => 'nullable|date',
            'persona_id'        => 'required|integer|exists:personas,id',
            'rol_id'            => 'required|integer|exists:rol,id',
            'empresa_id'        => 'nullable|integer|exists:empresas,id',
        ];

        $messages = [
            'name.required'        => 'El campo nombre es obligatorio.',
            'email.required'       => 'El campo email es obligatorio.',
            'email.email'          => 'El campo email debe ser un correo válido.',
            'email.unique'         => 'El correo ya está registrado por otro usuario.',
            'password.min'         => 'La contraseña debe tener al menos 8 caracteres.',
            'persona_id.required'  => 'El campo persona es obligatorio.',
            'persona_id.exists'    => 'La persona especificada no existe.',
            'rol_id.required'      => 'El campo rol es obligatorio.',
            'rol_id.exists'        => 'El rol especificado no existe.',
            'empresa_id.exists'    => 'La empresa especificada no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        // Si viene contraseña, hashearla; si no viene, no modificarla
        if ($request->filled('password')) {
            $request->merge([
                'password' => Hash::make($request->input('password')),
            ]);
        } else {
            // Evitar que el campo password se sobreescriba como null
            $request->request->remove('password');
        }

        return parent::update($id, $request);
    }

    /**
     * @OA\Delete(
     *     path="/api/users/{id}",
     *     summary="Eliminar un usuario",
     *     tags={"Users"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del usuario", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Usuario eliminado exitosamente"),
     *     @OA\Response(response=404, description="Usuario no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/users/{id}/rehabilitate",
     *     summary="Rehabilitar un usuario eliminado",
     *     tags={"Users"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID del usuario", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Usuario rehabilitado exitosamente"),
     *     @OA\Response(response=404, description="Usuario no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }
}
