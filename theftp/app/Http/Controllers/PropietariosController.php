<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropietariosRequest;
use App\Http\Requests\UpdatePropietariosRequest;

use App\Enums\Tablas;
use App\Enums\RolesEnum;
use App\Models\Propietario;
use App\Models\Documento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PropietariosController extends Controller
{
    // Constructor
    public function __construct()
    {
        parent::__construct(new Propietario(), Tablas::PROPIETARIOS);
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
    public function store(StorePropietariosRequest $request)
    {
        $user = auth()->user();
        $payload = $request->validated();

        // 1. Procesar el archivo de la Tarjeta de Propiedad
        if ($request->hasFile('archivo_tarjeta')) {
            $file = $request->file('archivo_tarjeta');
            $path = $file->store('documentos/propietarios', 'public');

            // Crear el registro en la tabla documentos
            $documento = Documento::create([
                'url' => $path,
                'observaciones' => 'Tarjeta de Propiedad - Generada automáticamente',
                'tipo_doc_id' => 1, // Asumimos 1 (PDF) o 6 (Imagen) según el seeder, mapearemos a 1 por ahora
                'empresa_id' => $user->empresa_id ?? $request->empresa_id
            ]);

            $payload['documento_id'] = $documento->id;
        }

        // 2. Forzar la empresa si no es admin
        if ($user && !in_array($user->rol_id, [RolesEnum::ADMIN->value, RolesEnum::SUBADMIN->value, RolesEnum::SECRETARIA->value])) {
            $payload['empresa_id'] = $user->empresa_id;
        }

        $item = Propietario::create($payload);

        return response()->json([
            'status' => true,
            'message' => 'Propietario creado con éxito',
            'data' => $item->load('persona', 'documento', 'empresa')
        ], 201);
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
    public function edit(string $id, UpdatePropietariosRequest $request)
    {
        $item = Propietario::findOrFail($id);
        $payload = $request->validated();

        // Si se sube un nuevo archivo, actualizamos el documento
        if ($request->hasFile('archivo_tarjeta')) {
            $file = $request->file('archivo_tarjeta');
            $path = $file->store('documentos/propietarios', 'public');

            $documento = Documento::create([
                'url' => $path,
                'observaciones' => 'Tarjeta de Propiedad - Actualizada',
                'tipo_doc_id' => 1,
                'empresa_id' => auth()->user()->empresa_id ?? $request->empresa_id
            ]);

            $payload['documento_id'] = $documento->id;
        }

        $item->update($payload);

        return response()->json([
            'status' => true,
            'message' => 'Propietario actualizado con éxito',
            'data' => $item->load('persona', 'documento', 'empresa')
        ]);
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
