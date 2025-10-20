<?php
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
 *         description="Columnas a seleccionar, separadas por comas",
 *         required=false,
 *         @OA\Schema(type="string", example="id,name")
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
 *         description="Relaciones a incluir, separadas por comas",
 *         required=false,
 *         @OA\Schema(type="string", example="departamento,region")
 *     ),
 *     @OA\Parameter(
 *         name="filter",
 *         in="query",
 *         description="Filtro en formato JSON para aplicar condiciones",
 *         required=false,
 *         @OA\Schema(
 *             type="string",
 *             example="[{'column':'name','operator':'like','value':'%Centro%'}]"
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Lista de municipios obtenida exitosamente",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
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

namespace App\Http\Controllers;

use App\Enums\Tablas;
use App\Http\Controllers\Controller;
use App\Models\departamentos;
use App\Models\municipios;
use App\Models\User;
use Illuminate\Http\Request;

class MunicipiosController extends Controller{

    // constructor
    public function __construct(){
        parent::__construct(new departamentos(), Tablas::MUNICIPIOS);
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
     *         description="Columnas a seleccionar, separadas por comas, usar * traera todas las columnas",
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
     *             @OA\Property(property="success", type="boolean", example=true),
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
     *              @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *        )
     *    ),
     *    @OA\Response(
     *        response=401,
     *       description="No autenticado"
     *   ),
     *   @OA\Response(
     *       response=404,
     *      description="Municipio no encontrado"
     *  ),
     *   @OA\Response(
     *      response=500,
     *     description="Error interno del servidor"
     * )
     * )
     */
    public function show($id, Request $request){
        return $this->getById($id, $request);
    }

}
