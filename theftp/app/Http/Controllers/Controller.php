<?php

namespace App\Http\Controllers;

use App\Enums\Tablas;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/**
 *  @OA\PathItem(path="/api")
 *  @OA\Info(
 *     title="Observatorio de Transporte Público API",
 *     version="1.0.0",
 *     description="Backend y API Acceso a datos.",
 *     @OA\Contact(
 *         email="juan-vega6@upc.edu.co"
 *     ),
 *     @OA\License(
 *         name="@Universidad Piloto de Colombia SAM - Todos los Derechos Reservados",
 *     )
 * )
 *
 *  @OA\SecurityScheme(
 *     type="http",
 *     description="Sanctum Token Bearer",
 *     name="Authorization",
 *     in="header",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     securityScheme="sanctum"
 * )
 */
abstract class Controller{

    // Contructor que recibe un Model con el que trabajara el controlador
    protected $model;
    protected $table = "";

    public function __construct(Model $model, Tablas $table){
        $this->model = $model;
        $this->table = $table->value;
    }

    public function fetchData(Request $request)
    {
        $page = $request->input('page', 1);
        $limit = $request->input('limit', 10);
        $columns = $request->input('columns', '*');
        $orderBy = $request->input('orderBy', 'id');
        $orderDirection = $request->input('orderDirection', 'asc');
        $include = $request->input('include', '');
        $filter = $request->input('filter', '');

        $columns = is_array($columns) ? $columns : explode(',', $columns);
        $include = is_array($include) ? $include : explode(',', $include);
        $filter = is_array($filter) ? $filter : json_decode($filter, true);
        // Remover vacíos
        $columns = array_filter($columns, fn($col) => !empty($col));
        $include = array_filter($include, fn($inc) => !empty($inc));

        try {
            // Construcción de la consulta
            $query = $this->model->query();

            // Incluir relaciones si se especifican
            if (count($include) != 0){ 
                $query->with($include);
            }

            // Aplicar filtros si se especifican
            if (!empty($filter)) {
                foreach ($filter as $filter) {
                    if (isset($filter['column'], $filter['operator'], $filter['value'])) {
                        switch ($filter['operator']) {
                            case '=':
                            case '!=':
                            case '>':
                            case '<':
                            case '>=':
                            case '<=':
                                $query->where($filter['column'], $filter['operator'], $filter['value']);
                                break;
                            case 'in':
                                $query->whereIn($filter['column'], $filter['value']);
                                break;
                            case 'not in':
                                $query->whereNotIn($filter['column'], $filter['value']);
                                break;
                            case 'null':
                                $query->whereNull($filter['column']);
                                break;
                            case 'not null':
                                $query->whereNotNull($filter['column']);
                                break;
                            case 'between':
                                if (is_array($filter['value']) && count($filter['value']) === 2) {
                                    $query->whereBetween($filter['column'], $filter['value']);
                                }
                                break;
                            case 'not between':
                                if (is_array($filter['value']) && count($filter['value']) === 2) {
                                    $query->whereNotBetween($filter['column'], $filter['value']);
                                }
                                break;
                            default:
                                throw new \Exception("Operador no soportado: " . $filter['operator']);
                        }
                    }
                }
            }

            // Ordenar los resultados
            $query->orderBy($orderBy, $orderDirection);

            // Obtener los datos paginados
            $data = $query->select($columns)
                          ->paginate($limit, ['*'], 'page', $page);

            $total = $data->total();

            // Respuesta exitosa
            return response()->json([
                'success' => true,
                'total' => $total,
                'data' => $data,
            ], 200);
        } catch (\Exception $e) {
            // Manejo de errores
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los datos.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

}
