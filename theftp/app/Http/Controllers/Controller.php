<?php

namespace App\Http\Controllers;

use App\Enums\Acciones;
use App\Enums\Tablas;
use App\Http\Services\PermisosService;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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

    public function index(Request $request)
    {
        // --- Validación de permisos de lectura
        try{
            PermisosService::verificarPermisoIndividual($this->table, Acciones::READ);
        } catch (Exception $e){
            return response()->json([
                'message' => $e->getMessage()
            ], $e->getCode() ?: 400);
        }

        $datos = $request->all();

        // 1. Definición de Reglas de Validación
        $rules = [
            'page' => 'nullable|integer|min:1',
            'limit' => 'nullable|integer|min:1|max:100', // Limita la paginación a 100 elementos
            'columns' => 'nullable|string', // Se asume una lista separada por comas o un array
            'orderBy' => 'nullable|string|max:50', // Nombre de la columna para ordenar
            'orderDirection' => 'nullable|in:asc,desc',
            'include' => 'nullable|string', // Se asume una lista de relaciones separada por comas
            'filter' => 'nullable|json', // El filtro debe ser una cadena JSON válida
        ];

        // 2. Nombres de Atributos Personalizados
        $attributeNames = [
            'page' => 'página',
            'limit' => 'límite de elementos',
            'columns' => 'columnas a seleccionar',
            'orderBy' => 'columna de ordenamiento',
            'orderDirection' => 'dirección de ordenamiento',
            'include' => 'relaciones a incluir',
            'filter' => 'filtro de consulta (JSON)',
        ];

        // 3. Mensajes de Error Personalizados
        $messages = [
            'page.integer' => 'El campo :attribute debe ser un número entero.',
            'page.min' => 'El campo :attribute debe ser al menos :min.',
            'limit.integer' => 'El campo :attribute debe ser un número entero.',
            'limit.min' => 'El campo :attribute debe ser al menos :min.',
            'limit.max' => 'El campo :attribute no debe exceder :max.',
            'orderBy.string' => 'El campo :attribute debe ser una cadena de texto.',
            'orderDirection.in' => 'El campo :attribute debe ser "asc" o "desc".',
            'filter.json' => "El campo :attribute debe ser una cadena de texto JSON válida. Casos soportados:\n\nIgualdad (=):\n{\"column\":\"id\",\"operator\":\"=\",\"value\":1}\n\nDiferente (!=):\n{\"column\":\"status\",\"operator\":\"!=\",\"value\":\"inactive\"}\n\nMayor que (>):\n{\"column\":\"created_at\",\"operator\":\">\",\"value\":\"2023-01-01\"}\n\nMenor que (<):\n{\"column\":\"created_at\",\"operator\":\"<\",\"value\":\"2023-12-31\"}\n\nEntre un rango (between):\n{\"column\":\"created_at\",\"operator\":\"between\",\"value\":[\"2023-01-01\",\"2023-12-31\"]}\n\nNo entre un rango (not between):\n{\"column\":\"created_at\",\"operator\":\"not between\",\"value\":[\"2023-01-01\",\"2023-12-31\"]}\n\nEn un conjunto (in):\n{\"column\":\"id\",\"operator\":\"in\",\"value\":[1,2,3]}\n\nNo en un conjunto (not in):\n{\"column\":\"id\",\"operator\":\"not in\",\"value\":[4,5,6]}\n\nNulo (null):\n{\"column\":\"deleted_at\",\"operator\":\"null\"}\n\nNo nulo (not null):\n{\"column\":\"updated_at\",\"operator\":\"not null\"}"
        ];

        // 4. Ejecución del Validador
        $validator = Validator::make($datos, $rules, $messages);
        $validator->setAttributeNames($attributeNames);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // --- Extracción y Normalización de Parámetros (El código original comienza aquí) ---

        $page = $request->input('page', 1);
        $limit = $request->input('limit', 10);
        $columns = $request->input('columns', '*');
        $orderBy = $request->input('orderBy', 'id');
        $orderDirection = $request->input('orderDirection', 'asc');
        $include = $request->input('include', '');
        $filter = $request->input('filter', '');

        // El filtro ya pasó la validación de JSON, lo decodificamos
        $filter = json_decode($filter, true);

        $columns = is_array($columns) ? $columns : explode(',', $columns);
        $include = is_array($include) ? $include : explode(',', $include);

        // Si filter es nulo o JSON inválido, normalizar a array vacío
        // Nota: La validación 'json' previa asegura que solo llega aquí si es válido o nulo/vacío
        if ($filter === null) {
            $filter = [];
        }

        // Si filter es un objeto asociativo ({}), convertir a [ {} ]
        if (is_array($filter) && array_values($filter) !== $filter) {
            $filter = [$filter];
        }

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
                // Validación interna de la estructura de cada filtro
                $allowedOperators = ['=', '!=', '>', '<', '>=', '<=', 'in', 'not in', 'null', 'not null', 'between', 'not between'];

                foreach ($filter as $f) {
                    if (!isset($f['column'], $f['operator'], $f['value'])) {
                        // Omitimos o lanzamos una excepción si la estructura de un filtro es inválida.
                        // Aquí elegimos lanzar una excepción para ser estricto.
                        throw new Exception("La estructura de un filtro es inválida. Se requiere 'column', 'operator' y 'value' (excepto para null/not null).");
                    }

                    if (!in_array($f['operator'], $allowedOperators)) {
                        throw new Exception("Operador no soportado: " . $f['operator']);
                    }

                    // Asumiendo que 'value' es opcional solo para 'null'/'not null'
                    $valueIsRequired = !in_array($f['operator'], ['null', 'not null']);

                    if ($valueIsRequired && !isset($f['value'])) {
                        throw new Exception("El operador '{$f['operator']}' requiere un valor.");
                    }

                    $column = $f['column'];
                    $operator = $f['operator'];
                    $value = $f['value'] ?? null;

                    switch ($operator) {
                        case '=':
                        case '!=':
                        case '>':
                        case '<':
                        case '>=':
                        case '<=':
                            $query->where($column, $operator, $value);
                            break;
                        case 'in':
                        case 'not in':
                            if (is_array($value)) {
                                $method = ($operator === 'in') ? 'whereIn' : 'whereNotIn';
                                $query->{$method}($column, $value);
                            }
                            break;
                        case 'null':
                        case 'not null':
                            $method = ($operator === 'null') ? 'whereNull' : 'whereNotNull';
                            $query->{$method}($column);
                            break;
                        case 'between':
                        case 'not between':
                            if (is_array($value) && count($value) === 2) {
                                $method = ($operator === 'between') ? 'whereBetween' : 'whereNotBetween';
                                $query->{$method}($column, $value);
                            }
                            break;
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
        } catch (Exception $e) {
            // Manejo de errores
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los datos.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request){
        // TODO: Ejecución de almacenamiento
    }

    public function update(string $id, Request $request){
        // TODO: Ejecución de actualización individual
    }

    public function disable(string $id){
        // TODO: Deshabiliar registro, para este caso hay que hacer
        // TODO: Una técnica de que si queremos deshabilitar,
        // TODO: Primero haremos una transacción para eliminarlo de la base de datos
        // TODO: Si se elimina, hacemos rollback para añadirle el disabled_at con la fecha de hoy.
        // TODO: Si no se elimina, no podemos eliminarlo notificando que tiene registros enlazados.
    }

    public function rehabilitate(string $id){
        // TODO: Rehabilitar
    }


}
