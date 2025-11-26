<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Models\documentos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DocumentosController extends Controller{

    const FOLDER = "documentos";

    // Constructor
    public function __construct()
    {
        parent::__construct(new documentos(), Tablas::DOCUMENTOS);
    }

    /**
     * @OA\Get(
     *     path="/api/documentos",
     *     summary="Obtener la lista de documentos",
     *     tags={"Documentos"},
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
     *         @OA\Schema(type="string", example="tipo_doc")
     *     ),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(type="string", example="{""observaciones"":{""like"":""%resolución%""}, ""tipo_doc_id"":{""="":1}}")
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
     *         description="Lista de documentos obtenida exitosamente",
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
     *     path="/api/documentos/{id}",
     *     summary="Obtener un documento por ID",
     *     tags={"Documentos"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del documento",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Parameter(
     *         name="include",
     *         in="query",
     *         description="Relaciones a incluir, separadas por comas. Si se introduce una inválida saldrá la lista disponible",
     *         required=false,
     *         @OA\Schema(type="string", example="tipo_doc")
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
     *         description="Documento obtenido exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=404, description="Documento no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show(string $id, Request $request)
    {
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/documentos",
     *     summary="Crear un nuevo documento (form-data con archivo)",
     *     tags={"Documentos"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 type="object",
     *                 required={"file","observaciones","tipo_doc_id"},
     *                 @OA\Property(
     *                     property="file",
     *                     description="Archivo a subir (un solo archivo)",
     *                     type="string",
     *                     format="binary"
     *                 ),
     *                 @OA\Property(
     *                     property="observaciones",
     *                     description="Observaciones del documento",
     *                     type="string",
     *                     example="Resolución escaneada y firmada."
     *                 ),
     *                 @OA\Property(
     *                     property="tipo_doc_id",
     *                     description="ID del tipo de documento",
     *                     type="integer",
     *                     example=1
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=201, description="Documento creado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        // ! Validación de archivos
        try{
            $this->validateFileUpload( $request, "file" );
        } catch(\Exception $e){
            return response()->json(['status' => false, 'errors' => ['file' => [$e->getMessage()]]] , 422);
        }

        $rules = [
            'observaciones' => 'required|string',
            'tipo_doc_id'   => 'required|integer|exists:tipo_doc,id',
            'empresa_id' => 'nullable|integer|exists:empresas,id',
        ];

        $messages = [
            'observaciones.required'   => 'El campo observaciones es obligatorio.',
            'tipo_doc_id.required'     => 'El campo tipo_doc_id es obligatorio.',
            'tipo_doc_id.integer'      => 'El campo tipo_doc_id debe ser un número entero.',
            'tipo_doc_id.exists'       => 'El tipo de documento especificado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        // Almacenar el archivo localmente
        $file = Storage::disk('local')->put(self::FOLDER, $request->file('file'));
        $request->merge(['url' => Storage::url($file)]);

        return parent::store($request);
    }

    /**
     * @OA\Post(
     *     path="/api/documentos/{id}",
     *     summary="Actualizar un documento existente (form-data con archivo)",
     *     tags={"Documentos"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del documento",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 type="object",
     *                 required={"file"},
     *                 @OA\Property(
     *                     property="file",
     *                     description="Archivo a subir (un solo archivo)",
     *                     type="string",
     *                     format="binary"
     *                 ),
     *                 @OA\Property(
     *                     property="observaciones",
     *                     type="string",
     *                     example="Actualización de documento por nueva firma."
     *                 ),
     *                 @OA\Property(
     *                     property="tipo_doc_id",
     *                     type="integer",
     *                     example=2
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Documento actualizado exitosamente"),
     *     @OA\Response(response=422, description="Error de validación"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function edit(string $id, Request $request)    {

        // ! Validación de archivos
        try{
            $this->validateFileUpload( $request, "file" );
        } catch(\Exception $e){
            return response()->json(['status' => false, 'errors' => ['file' => [$e->getMessage()]]] , 422);
        }

        $rules = [
            'observaciones' => 'required|string',
            'tipo_doc_id'   => 'required|integer|exists:tipo_doc,id',
        ];

        $messages = [
            'observaciones.required'   => 'El campo observaciones es obligatorio.',
            'tipo_doc_id.required'     => 'El campo tipo_doc_id es obligatorio.',
            'tipo_doc_id.integer'      => 'El campo tipo_doc_id debe ser un número entero.',
            'tipo_doc_id.exists'       => 'El tipo de documento especificado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        // Eliminar el archivo anterior si se subió uno nuevo
        $file = $request->file('file');
        if (!$file){
            return;
        }
        $documento = documentos::find($id);
        if (!$documento || !$documento->url) {
            return;
        }

        // Obtener la ruta del archivo anterior
        $previousFilePath = str_replace('/storage/', '', $documento->url);
        Storage::disk('local')->delete($previousFilePath);

        // Almacenar el nuevo archivo
        $newFilePath = Storage::disk('local')->put(self::FOLDER, $file);
        $request->merge(['url' => Storage::url($newFilePath)]);

        return parent::update($id, $request);
    }

    /**
     * @OA\Delete(
     *     path="/api/documentos/{id}",
     *     summary="Eliminar un documento",
     *     tags={"Documentos"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del documento",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Documento eliminado exitosamente"),
     *     @OA\Response(response=404, description="Documento no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy(string $id)
    {
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/documentos/{id}/rehabilitate",
     *     summary="Rehabilitar un documento eliminado",
     *     tags={"Documentos"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del documento",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Documento rehabilitado exitosamente"),
     *     @OA\Response(response=404, description="Documento no encontrado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function restore(string $id)
    {
        return parent::restore($id);
    }

    /**
     * @OA\Get(
     *     path="/api/documentos/{id}/file",
     *     tags={"Documentos"},
     *     security={{"sanctum": {}}},
     *     summary="Descargar el archivo asociado a un documento",
     *     description="Obtiene y descarga el archivo almacenado para el documento identificado por {id}. Retorna un stream binario si existe el archivo o un JSON con mensaje de error si no se encuentra.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del documento",
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

        $model = documentos::find($id);

        if(!$model){
            return response()->json(['status' => false, 'message' => 'Registro no encontrado.'], 404);
        }

        if (!$model->url) {
            return response()->json(['status' => false, 'message' => 'Archivo no establecido.'], 404);
        }

        $filePath = str_replace('/storage/', '', $model->url);
        if (!Storage::disk('local')->exists($filePath)) {
            return response()->json(['status' => false, 'message' => 'Archivo no encontrado en el servidor.'], 404);
        }

        return response()->download(storage_path('app/private/' . $filePath));
    }
}
