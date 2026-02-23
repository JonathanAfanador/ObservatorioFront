<?php
namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Http\Controllers\Controller;
use App\Models\municipios;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MunicipiosController extends Controller{

    // constructor
    public function __construct(){
        parent::__construct( new municipios(), Tablas::MUNICIPIOS);
    }

    /**
     * @OA\Get(
     *     path="/api/municipios",
     *     summary="Obtener la lista de municipios",
     *     tags={"Municipios"},
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
     *         description="Columnas a seleccionar, separadas por comas, usar * traerá todas las columnas",
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
     *         description="Relaciones a incluir, separadas por comas, si se introduce uno invalido saldra la lista disponible",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="filter",
     *         in="query",
     *         description="Filtro en formato JSON para aplicar condiciones",
     *         required=false,
     *         @OA\Schema(
     *             type="string"
     *         )
     *     ),
     *    @OA\Parameter(
     *         name="includeSoftDeleted",
     *        in="query",
     *    description="Incluir registros deshabilitados (soft deleted)",
     *    required=false,
     *    @OA\Schema(type="boolean", example=false)
     *    ),
     *      @OA\Parameter(
     *         name="onlySoftDeleted",
     *        in="query",
     *   description="Solo registros deshabilitados (soft deleted)",
     *   required=false,
     *   @OA\Schema(type="boolean", example=false)
     * ),
     *  @OA\Parameter(
     *      name="includeRelatedSoftDeleted",
     *     in="query",
     *   description="Incluir registros deshabilitados en relaciones",
     *   required=false,
     *  @OA\Schema(type="boolean", example=false)
     * ),
     * @OA\Parameter(
     *     name="onlyRelatedSoftDeleted",
     *    in="query",
     *  description="Solo registros deshabilitados en relaciones",
     *  required=false,
     * @OA\Schema(type="boolean", example=false)
     * ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de municipios obtenida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="total", type="integer", example=100)
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autenticado"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Error interno del servidor"
     *     )
     * )
     */
    public function index(Request $request){
        return $this->get($request);
    }

    /**
     *  @OA\Get(
     *      path="/api/municipios/{id}",
     *      summary="Obtener un municipio por ID",
     *      tags={"Municipios"},
     *      security={{"sanctum": {}}},
     *      @OA\Parameter(
     *          name="id",
     *          in="path",
     *          description="ID del municipio",
     *          required=true,
     *          @OA\Schema(type="integer", example=1)
     *      ),
          *      @OA\Parameter(
     *          name="include",
     *          in="query",
     *          description="Relaciones a incluir, separadas por comas, si se introduce uno invalido saldra la lista disponible",
     *          required=false,
     *          @OA\Schema(type="string")
     *      ),
     *    @OA\Parameter(
     *         name="includeSoftDeleted",
     *        in="query",
     *    description="Incluir registros deshabilitados (soft deleted)",
     *    required=false,
     *    @OA\Schema(type="boolean", example=false)
     *    ),
     *      @OA\Parameter(
     *         name="onlySoftDeleted",
     *        in="query",
     *   description="Solo registros deshabilitados (soft deleted)",
     *   required=false,
     *   @OA\Schema(type="boolean", example=false)
     * ),
     *  @OA\Parameter(
     *      name="includeRelatedSoftDeleted",
     *     in="query",
     *   description="Incluir registros deshabilitados en relaciones",
     *   required=false,
     *  @OA\Schema(type="boolean", example=false)
     * ),
     * @OA\Parameter(
     *     name="onlyRelatedSoftDeleted",
     *    in="query",
     *  description="Solo registros deshabilitados en relaciones",
     *  required=false,
     * @OA\Schema(type="boolean", example=false)
     * ),
     *      @OA\Response(
     *          response=200,
     *          description="Municipio obtenido exitosamente",
     *          @OA\JsonContent(
     *              @OA\Property(property="status", type="boolean", example=true),
     *              @OA\Property(property="data", type="object")
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="No autenticado"
     *      ),
     *      @OA\Response(
     *          response=404,
     *          description="Municipio no encontrado"
     *      ),
     *      @OA\Response(
     *          response=500,
     *          description="Error interno del servidor"
     *      )
     *  )
     */
    public function show(string $id, Request $request){
        return $this->getById($id, $request);
    }

    /**
     * @OA\Post(
     *     path="/api/municipios",
     *     summary="Crear un nuevo municipio",
     *     tags={"Municipios"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Municipio X"),
     *             @OA\Property(property="codigo_dane", type="string", example="12345"),
     *             @OA\Property(property="departamentos_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Municipio creado exitosamente"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Error interno del servidor"
     *     )
     * )
     */
    public function store(Request $request){
        $rules = [
            'name' => 'required|string|max:255',
            'codigo_dane' => 'required|string|max:255',
            'departamentos_id' => 'required|integer|exists:departamentos,id',
        ];

        $messages = [
            'name.required' => 'El campo nombre es obligatorio.',
            'codigo_dane.required' => 'El campo código DANE es obligatorio.',
            'departamentos_id.required' => 'El campo departamento es obligatorio.',
            'departamentos_id.exists' => 'El departamento especificado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::store($request);
    }

    /**
     * @OA\Put(
     *     path="/api/municipios/{id}",
     *     summary="Actualizar un municipio existente",
     *     tags={"Municipios"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del municipio",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Municipio X"),
     *             @OA\Property(property="codigo_dane", type="string", example="12345"),
     *             @OA\Property(property="departamentos_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Municipio actualizado exitosamente"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Error interno del servidor"
     *     )
     * )
     */
    public function edit(string $id, Request $request){
        $rules = [
            'name' => 'required|string|max:255',
            'codigo_dane' => 'required|string|max:255',
            'departamentos_id' => 'required|integer|exists:departamentos,id',
        ];

        $messages = [
            'name.required' => 'El campo nombre es obligatorio.',
            'codigo_dane.required' => 'El campo código DANE es obligatorio.',
            'departamentos_id.required' => 'El campo departamento es obligatorio.',
            'departamentos_id.exists' => 'El departamento especificado no existe.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        return parent::update($id, $request);
    }

    /**
     * @OA\Delete(
     *     path="/api/municipios/{id}",
     *     summary="Eliminar un municipio",
     *     tags={"Municipios"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del municipio",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Municipio eliminado exitosamente"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Municipio no encontrado"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Error interno del servidor"
     *     )
     * )
     */
    public function destroy(string $id){
        return parent::destroy($id);
    }

    /**
     * @OA\Post(
     *     path="/api/municipios/{id}/rehabilitate",
     *     summary="Rehabilitar un municipio eliminado",
     *     tags={"Municipios"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID del municipio",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Municipio rehabilitado exitosamente"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Municipio no encontrado"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Error interno del servidor"
     *     )
     * )
     */
    public function restore(string $id){
        return parent::restore($id);
    }
}
