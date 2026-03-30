<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRutasRequest;
use App\Http\Requests\UpdateRutasRequest;

use App\Enums\Tablas;
use App\Models\Ruta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RutasController extends Controller
{

    const FOLDER = 'rutas';

    // Constructor
    public function __construct()
    {
        parent::__construct(new Ruta(), Tablas::RUTAS);
    }

    /**
     * @OA\Get(
     *     path="/api/rutas",
     *     summary="Obtener la lista de rutas",
     *     tags={"Rutas"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="page", in="query", description="Número de página para la paginación", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="limit", in="query", description="Cantidad de elementos por página", required=false, @OA\Schema(type="integer", example=10)),
     *     @OA\Parameter(name="columns", in="query", description="Columnas a seleccionar, separadas por comas. Usar * traerá todas las columnas", required=false, @OA\Schema(type="string", example="*")),
     *     @OA\Parameter(name="orderBy", in="query", description="Columna para ordenar los resultados", required=false, @OA\Schema(type="string", example="id")),
     *     @OA\Parameter(name="orderDirection", in="query", description="Dirección de ordenamiento (asc o desc)", required=false, @OA\Schema(type="string", example="asc")),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(type="string", example="{""name"":{""like"":""%Ruta%""},""empresa_id"":{""="":1}}")
     *     ),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de rutas obtenida exitosamente",
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
     *     path="/api/rutas/{id}",
     *     summary="Obtener una ruta por ID",
     *     tags={"Rutas"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID de la ruta", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="include", in="query", description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible", required=false, @OA\Schema(type="string", example="empresa.municipio")),
     *     @OA\Parameter(name="includeSoftDeleted", in="query", description="Incluir registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlySoftDeleted", in="query", description="Solo registros deshabilitados (soft deleted)", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="includeRelatedSoftDeleted", in="query", description="Incluir registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Parameter(name="onlyRelatedSoftDeleted", in="query", description="Solo registros deshabilitados en relaciones", required=false, @OA\Schema(type="boolean", example=false)),
     *     @OA\Response(
     *         response=200,
     *         description="Ruta obtenida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=404, description="Ruta no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/rutas",
     *     summary="Crear una nueva ruta (form-data con un solo archivo)",
     *     tags={"Rutas"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 type="object",
     *                 @OA\Property(property="file", type="string", format="binary", description="Archivo único (ej. geojson)"),
     *                 @OA\Property(property="name", type="string", description="Nombre de la ruta", example="Ruta 101"),
     *                 @OA\Property(property="empresa_id", type="integer", description="ID de la empresa", example=1),
     *                 required={"file","name","empresa_id"}
     *             )
     *         )
     *     ),
     *     @OA\Response(response=201, description="Ruta creada exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(StoreRutasRequest $request)
    {

        // ! Validación de archivos
        try{
            $this->validateFileUpload( $request, "file" );
        } catch(\Exception $e){
            return response()->json(['status' => false, 'errors' => ['file' => [$e->getMessage()]]] , 422);
        }


        // Almacenar el archivo localmente
        $file = Storage::disk('local')->put(self::FOLDER, $request->file('file'));
        $request->merge(['file_name' => Storage::url($file)]);

        // --- INYECCIÓN DEL GUARDIÁN DE PROPIEDAD DE ESCRITURA ---
        $user = auth()->user();
        if ($user && !in_array($user->rol_id, [\App\Enums\RolesEnum::ADMIN->value, \App\Enums\RolesEnum::SUBADMIN->value])) {
            $request->merge(['empresa_id' => $user->empresa_id]);
        }
        // --------------------------------------------------------

        return parent::baseStore($request);
    }

    /**
     * @OA\Post(
     *     path="/api/rutas/{id}",
     *     summary="Actualizar una ruta existente (form-data con un solo archivo)",
     *     tags={"Rutas"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID de la ruta", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 type="object",
     *                 @OA\Property(property="file", type="string", format="binary", description="Archivo único (ej. geojson)"),
     *                 @OA\Property(property="name", type="string", description="Nombre de la ruta", example="Ruta 101 Actualizada"),
     *                 @OA\Property(property="empresa_id", type="integer", description="ID de la empresa", example=1),
     *                 required={"file","name","empresa_id"}
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Ruta actualizada exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, UpdateRutasRequest $request)
    {
        // 1. Validación de Archivo (AHORA OPCIONAL)
        if ($request->hasFile('file')) { // <--- AGREGAR ESTE IF
            try {
                $this->validateFileUpload($request, "file");
            } catch (\Exception $e) {
                return response()->json(['status' => false, 'errors' => ['file' => [$e->getMessage()]]], 422);
            }
        }

        // 2. Reglas de validación de texto

        // 3. Lógica de guardado de archivo (SOLO SI HAY ARCHIVO NUEVO)
        $file = $request->file('file');
        
        if ($file) {
            // Buscar registro actual para borrar archivo viejo
            $data = Ruta::find($id);
            if ($data && $data->file_name) {
                $previousFilePath = str_replace('/storage/', '', $data->file_name);
                Storage::disk('local')->delete($previousFilePath);
            }

            // Guardar nuevo
            $newFilePath = Storage::disk('local')->put(self::FOLDER, $file);
            $request->merge(['file_name' => Storage::url($newFilePath)]);
        }

        // 4. INYECCIÓN DEL GUARDIÁN DE PROPIEDAD DE ESCRITURA (UPDATE)
        $user = auth()->user();
        if ($user && !in_array($user->rol_id, [\App\Enums\RolesEnum::ADMIN->value, \App\Enums\RolesEnum::SUBADMIN->value])) {
            $request->merge(['empresa_id' => $user->empresa_id]);
        }
        // -----------------------------------------------------------------

        return parent::baseUpdate($id, $request);
    }
    /**
     * @OA\Delete(
     *     path="/api/rutas/{id}",
     *     summary="Eliminar una ruta",
     *     tags={"Rutas"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID de la ruta", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Ruta eliminada exitosamente"),
     *     @OA\Response(response=404, description="Ruta no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/rutas/{id}/rehabilitate",
     *     summary="Rehabilitar una ruta eliminada",
     *     tags={"Rutas"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", description="ID de la ruta", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Ruta rehabilitada exitosamente"),
     *     @OA\Response(response=404, description="Ruta no encontrada"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }

    /**
     * @OA\Get(
     *     path="/api/rutas/{id}/file",
     *     tags={"Rutas"},
     *     security={{"sanctum": {}}},
     *     summary="Descargar el archivo asociado a una ruta",
     *     description="Obtiene y descarga el archivo almacenado para la ruta identificada por {id}. Retorna un stream binario si existe el archivo o un JSON con mensaje de error si no se encuentra.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la ruta",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Archivo descargado",
     *         @OA\MediaType(
     *             mediaType="application/octet-stream",
     *             @OA\Schema(type="string", format="binary")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Archivo no encontrado",
     *         @OA\JsonContent(
     *             type="object",
     *             required={"status","message"},
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Archivo no encontrado.")
     *         )
     *     )
     * )
     */
    public function getFile(string $id){

        $model = Ruta::find($id);

        if(!$model){
            return response()->json(['status' => false, 'message' => 'Registro no encontrado.'], 404);
        }

        if (!$model->file_name) {
            return response()->json(['status' => false, 'message' => 'Archivo no establecido.'], 404);
        }

        $filePath = str_replace('/storage/', '', $model->file_name);
        if (!Storage::disk('local')->exists($filePath)) {
            return response()->json(['status' => false, 'message' => 'Archivo no encontrado en el servidor.'], 404);
        }

        return response()->download(storage_path('app/private/' . $filePath));
    }
}
