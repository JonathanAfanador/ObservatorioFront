<?php

namespace App\Http\Controllers;

use App\Enums\Acciones;
use App\Enums\Tablas;
use App\Http\Services\PermisosService;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use ReflectionClass;
use ReflectionMethod;
use Throwable;

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
    protected $MAX_SIZE_FILES_IN_MB;
    protected $MIMETYPES_ALLOWED;

    public function __construct(Model $model, Tablas $table){
        $this->model = $model;
        $this->table = $table->value;
        $this->MAX_SIZE_FILES_IN_MB = env('MAX_SIZE_FILES_IN_MB', 10);
        $this->MIMETYPES_ALLOWED = env('MIMETYPES_ALLOWED', ''); // Coma-separated list of allowed MIME types
    }

    /**
     * @param string $modelClass El nombre de la clase del modelo actual (ej: App\Models\User::class).
     * @param int $maxDepth Profundidad máxima de recursión restante.
     * @param string $prefix Prefijo de la relación actual (ej: 'posts.').
     * @param array $allRelationships Array de resultados pasados por referencia.
     */
    protected function getModelRelationshipsRecursive(string $modelClass, int $maxDepth, string $prefix, array &$allRelationships): array
    {
        // Si la profundidad máxima es alcanzada, detenemos la recursión.
        if ($maxDepth <= 0) {
            return [];
        }

        // Instanciar el modelo (necesario para invocar los métodos de relación)
        // Usamos el nombre de la clase, no una instancia
        $model = new $modelClass();
        $reflectionClass = new ReflectionClass($model);

        // Iterar sobre todos los métodos públicos
        foreach ($reflectionClass->getMethods(ReflectionMethod::IS_PUBLIC) as $method) {
            $methodName = $method->getName();

            // 1. Excluir métodos de la clase base Model
            if ($method->getDeclaringClass()->getName() === Model::class) {
                continue;
            }

            // 2. Solo considerar métodos sin parámetros (convención de relaciones)
            if (count($method->getParameters()) === 0) {
                try {
                    // Intentar invocar el método
                    $relationInstance = $method->invoke($model);

                    // 3. Verificar si es una relación válida de Eloquent
                    if ($relationInstance instanceof Relation) {
                        $fullName = $prefix . $methodName;

                        // Añadir la relación actual a la lista
                        $allRelationships[] = $fullName;

                        // 4. Obtener el modelo relacionado (el "hijo")
                        $relatedModel = $relationInstance->getRelated();
                        $relatedModelClass = get_class($relatedModel);

                        // 5. Llamada recursiva
                        $this->getModelRelationshipsRecursive(
                            $relatedModelClass,
                            $maxDepth - 1,
                            $fullName . '.',
                            $allRelationships // ¡Aquí se pasa la variable existente por referencia!
                        );
                    }
                } catch (Throwable $e) {
                    // Omitir si el método no puede ser invocado (ej. si requiere un parámetro)
                    continue;
                }
            }
        }

        return $allRelationships;
    }

    // El método principal para obtener todas las relaciones
    public function getAllowedIncludes(int $maxDepth = 3): array
    {
        $relationships = [];
        $modelClass = get_class($this->model);

        // La llamada inicial: inicializamos la variable $relationships aquí
        // y la pasamos por referencia en el último argumento.
        return $this->getModelRelationshipsRecursive(
            $modelClass,
            $maxDepth,
            '',
            $relationships
        );
    }

    public function get(Request $request)
    {
        // --- Validación de permisos de lectura
        try{
            PermisosService::verificarPermisoIndividual($this->table, Acciones::READ);
        } catch (Exception $e){
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        }

        $datos = $request->all();

        // Casting de booleanos para los parámetros específicos
        $booleanParams = [
            'includeSoftDeleted',
            'onlySoftDeleted',
            'includeRelatedSoftDeleted',
            'onlyRelatedSoftDeleted',
        ];

        foreach ($booleanParams as $param) {
            if (isset($datos[$param])) {
                // ! si no es true/false válido, asignar false por defecto
                $datos[$param] = filter_var($datos[$param], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
            }
        }

        // 1. Definición de Reglas de Validación
        $rules = [
            'page' => 'nullable|integer|min:1',
            'limit' => 'nullable|integer|min:1|max:100', // Limita la paginación a 100 elementos
            'columns' => 'nullable|string', // Se asume una lista separada por comas
            'orderBy' => 'nullable|string|max:50', // Nombre de la columna para ordenar
            'orderDirection' => 'nullable|in:asc,desc',
            'include' => 'nullable|string', // Se asume una lista de relaciones separada por comas
            'filter' => 'nullable|json', // El filtro debe ser una cadena JSON válida
            'includeSoftDeleted' => 'nullable|boolean', // Incluir registros "soft deleted" del modelo principal
            'onlySoftDeleted' => 'nullable|boolean',    // Solo registros "soft deleted" del modelo principal
            'includeRelatedSoftDeleted' => 'nullable|boolean', // Incluir registros "soft deleted" en relaciones
            'onlyRelatedSoftDeleted' => 'nullable|boolean',    // Solo registros "soft deleted" en relaciones
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
            'includeDisabled' => 'incluir registros eliminados (soft-deleted)',
            'onlyDisabled' => 'solo registros eliminados (soft-deleted)',
            'includeChildsDisabled' => 'incluir registros eliminados en relaciones',
            'onlyChildsDisabled' => 'solo registros eliminados en relaciones',
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
            'filter.json' => "El campo :attribute debe ser una cadena de texto JSON válida.",
            'include.string' => 'El campo :attribute debe ser una cadena de texto separada en comas.',
            'includeSoftDeleted.boolean' => 'El campo :attribute debe ser verdadero o falso.',
            'onlySoftDeleted.boolean' => 'El campo :attribute debe ser verdadero o falso.',
            'includeRelatedSoftDeleted.boolean' => 'El campo :attribute debe ser verdadero o falso.',
            'onlyRelatedSoftDeleted.boolean' => 'El campo :attribute debe ser verdadero o falso.',
        ];

        // 4. Ejecución del Validador
        $validator = Validator::make($datos, $rules, $messages);
        $validator->setAttributeNames($attributeNames);

        if ($validator->fails()) {
            return response()->json(
                [
                    'status' => false,
                    'errors' => $validator->errors(),
                    'filterExamples' => [
                        'igualdad (=)' => '{"column":"id","operator":"=","value":1}',
                        'diferente (!=)' => '{"column":"status","operator":"!=","value":"inactive"}',
                        'mayor que (>)' => '{"column":"created_at","operator":">","value":"2023-01-01"}',
                        'menor que (<)' => '{"column":"created_at","operator":"<","value":"2023-12-31"}',
                        'entre un rango (between)' => '{"column":"created_at","operator":"between","value":["2023-01-01","2023-12-31"]}',
                        'no entre un rango (not between)' => '{"column":"created_at","operator":"not between","value":["2023-01-01","2023-12-31"]}',
                        'en un conjunto (in)'=> '{"column":"id","operator":"in","value":[1,2,3]}',
                        'no en un conjunto (not in)'=> '{"column":"id","operator":"not in","value":[4,5,6]}',
                        'nulo (null)'=> '{"column":"deleted_at","operator":"null"}',
                        'no nulo (not null)'=> '{"column":"updated_at","operator":"not null"}',
                        'like'=> '{"column":"name","operator":"like","value":"%John%"}',
                    ]
            ], 422);
        }

        // --- Extracción y Normalización de Parámetros (El código original comienza aquí) ---

        $page = $request->input('page', 1);
        $limit = $request->input('limit', 10);
        $columns = $request->input('columns', '*');
        $orderBy = $request->input('orderBy', 'id');
        $orderDirection = $request->input('orderDirection', 'asc');
        $include = $request->input('include', '');
        $filter = $request->input('filter', '');
        $includeSoftDeleted = $datos['includeSoftDeleted'] ?? false;
        $onlySoftDeleted = $datos['onlySoftDeleted'] ?? false;
        $includeRelatedSoftDeleted = $datos['includeRelatedSoftDeleted'] ?? false;
        $onlyRelatedSoftDeleted = $datos['onlyRelatedSoftDeleted'] ?? false;

        // El filtro ya pasó la validación de JSON, lo decodificamos
        $filter = json_decode($filter, true); //

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

        // Validacione de Include
        if(count($include) > 0 ){
            $allowedIncludes = $this->getAllowedIncludes();
            foreach ($include as $inc){
                if (!in_array($inc, $allowedIncludes)){
                    return response()->json([
                        'status' => false,
                        'message' => "La relación solicitada para incluir '{$inc}' no está permitida.",
                        'allowed_includes' => $allowedIncludes,
                    ], 400);
                }
            }
        }

        try {
            // Construcción de la consulta
            $query = $this->model->query();

            // Manejo de Soft Deletes
            if ($onlySoftDeleted) {
                $query->onlyTrashed();
            } elseif ($includeSoftDeleted) {
                $query->withTrashed();
            }

            // Incluir relaciones si se especifican
            if (count($include) != 0){
                foreach ($include as $relation) {
                    if ($onlyRelatedSoftDeleted) {
                        // Para cada relación pedida, añadimos una clausura que intenta aplicar onlyTrashed()
                        // en la consulta de la relación (si el builder soporta onlyTrashed).
                        $query->with([$relation => function ($q) {
                            $q->onlyTrashed();
                        }]);
                    } elseif ($includeRelatedSoftDeleted) {
                        // Similar para withTrashed()
                        $query->with([$relation => function ($q) {
                            $q->withTrashed();
                        }]);
                    } else {
                        // Inclusión normal sin soft-deleted
                        $query->with($relation);
                    }
                }
            }

            // Aplicar filtros si se especifican
            if (!empty($filter)) {
                // Validación interna de la estructura de cada filtro
                $allowedOperators = ['=', '!=', '>', '<', '>=', '<=', 'in', 'not in', 'null', 'not null', 'between', 'not between', 'like'];

                foreach ($filter as $f) {
                    if (!isset($f['column'], $f['operator'], $f['value']) && !in_array($f['operator'], ['null', 'not null', 'like'])) {
                        // Omitimos o lanzamos una excepción si la estructura de un filtro es inválida.
                        // Aquí elegimos lanzar una excepción para ser estricto.
                        throw new Exception("La estructura de un filtro es inválida. Se requiere 'column', 'operator' y 'value' (excepto para null/not null, like).");
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
                        case 'like':
                            $query->where($column, 'like', $value);
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
                'status' => true,
                'total' => $total,
                'data' => $data,
            ], 200);
        } catch (Exception $e) {
            // Manejo de errores
            return response()->json([
                'status' => false,
                'message' => 'Error al obtener los datos.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getById(string $id, Request $request){

        // --- Validación de permisos de lectura
        try{
            PermisosService::verificarPermisoIndividual($this->table, Acciones::READ);
        } catch (Exception $e){
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        }

        $datos = $request->all();

        // Casting de booleanos para los parámetros específicos
        $booleanParams = [
            'includeSoftDeleted',
            'onlySoftDeleted',
            'includeRelatedSoftDeleted',
            'onlyRelatedSoftDeleted',
        ];

        foreach ($booleanParams as $param) {
            if (isset($datos[$param])) {
                // ! si no es true/false válido, asignar false por defecto
                $datos[$param] = filter_var($datos[$param], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
            }
        }

        $rules = [
            'include' => 'nullable|string', // Se asume una lista de relaciones separada por comas
            'includeSoftDeleted' => 'nullable|boolean', // Incluir registros "soft deleted" del modelo principal
            'onlySoftDeleted' => 'nullable|boolean',    // Solo registros "soft deleted
            'includeRelatedSoftDeleted' => 'nullable|boolean', // Incluir registros "soft deleted" en relaciones
            'onlyRelatedSoftDeleted' => 'nullable|boolean',    // Solo registros "soft deleted" en relaciones
        ];

        $messages = [
            'include.string' => 'El campo :attribute debe ser una cadena de texto separada en comas.',
            'includeSoftDeleted.boolean' => 'El campo :attribute debe ser verdadero o falso.',
            'onlySoftDeleted.boolean' => 'El campo :attribute debe ser verdadero o falso.',
            'includeRelatedSoftDeleted.boolean' => 'El campo :attribute debe ser verdadero o falso.',
            'onlyRelatedSoftDeleted.boolean' => 'El campo :attribute debe ser verdadero o falso.',
        ];

        $attributeNames = [
            'include' => 'relaciones a incluir',
            'includeSoftDeleted' => 'incluir registros eliminados (soft-deleted)',
            'onlySoftDeleted' => 'solo registros eliminados (soft-deleted)',
            'includeRelatedSoftDeleted' => 'incluir registros eliminados en relaciones',
            'onlyRelatedSoftDeleted' => 'solo registros eliminados en relaciones',
        ];

        $validator = Validator::make($datos, $rules, $messages);
        $validator->setAttributeNames($attributeNames);
        if ($validator->fails()) {
            return response()->json(
                [
                    'status' => false,
                    'errors' => $validator->errors(),
            ], 422);
        }

        $include = $request->input('include', '');

        $includeSoftDeleted = $datos['includeSoftDeleted'] ?? false;
        $onlySoftDeleted = $datos['onlySoftDeleted'] ?? false;
        $includeRelatedSoftDeleted = $datos['includeRelatedSoftDeleted'] ?? false;
        $onlyRelatedSoftDeleted = $datos['onlyRelatedSoftDeleted'] ?? false;

        $include = is_array($include) ? $include : explode(',', $include);
        // Remover vacíos
        $include = array_filter($include, fn($inc) => !empty($inc));
        // Validacione de Include
        if(count($include) > 0 ){
            $allowedIncludes = $this->getAllowedIncludes();
            foreach ($include as $inc){
                if (!in_array($inc, $allowedIncludes)){
                    return response()->json([
                        'status' => false,
                        'message' => "La relación solicitada para incluir '{$inc}' no está permitida.",
                        'allowed_includes' => $allowedIncludes,
                    ], 400);
                }
            }
        }

        try {
            // Construcción de la consulta
            $query = $this->model->query();

            if ($includeSoftDeleted){
                // Incluir registros "soft deleted" del modelo principal
                $query = $query->withTrashed();
            }

            if ($onlySoftDeleted){
                // Solo registros "soft deleted" del modelo principal
                $query = $query->onlyTrashed();
            }

            // Incluir relaciones si se especifican
            if (count($include) != 0){
                if ($includeRelatedSoftDeleted) {
                    // Para cada relación pedida, añadimos una clausura que intenta aplicar withTrashed()
                    // en la consulta de la relación (si el builder soporta withTrashed).
                    $eager = [];
                    foreach ($include as $inc) {
                        $eager[$inc] = function ($q) {
                            $q->withTrashed();
                        };
                    }
                    $query->with($eager);
                }

                if ($onlyRelatedSoftDeleted) {
                    // Para cada relación pedida, añadimos una clausura que intenta aplicar onlyTrashed()
                    // en la consulta de la relación (si el builder soporta onlyTrashed).
                    $eager = [];
                    foreach ($include as $inc) {
                        $eager[$inc] = function ($q) {
                            $q->onlyTrashed();
                        };
                    }
                    $query->with($eager);
                }

                else {
                    $query->with($include);
                }
            }

            // Obtener el registro por ID
            $record = $query->find($id);

            if(!$record){
                return response()->json([
                    'status' => false,
                    'message' => 'Registro no encontrado.',
                ], 404);
            }

            // Respuesta exitosa
            return response()->json([
                'status' => true,
                'data' => $record,
            ], 200);
        } catch (Exception $e) {
            // Manejo de errores
            return response()->json([
                'status' => false,
                'message' => 'Error al obtener el registro.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request){

        // -- Permisos
        try{
            PermisosService::verificarPermisoIndividual($this->table, Acciones::CREATE);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        }

        // -- Lógica
        try{
            $newRecord = $this->model->create($request->all());

            return response()->json([
                'status' => true,
                'message' => 'Registro creado exitosamente.',
                'data' => $newRecord,
            ], 201);

        } catch (Exception $e){
            return response()->json([
                'status' => false,
                'message' => 'Error al crear el registro.',
                'error' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        }
    }

    public function update(string $id, Request $request){

        // -- Permisos
        try{
            PermisosService::verificarPermisoIndividual($this->table, Acciones::UPDATE);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        }

        // -- Lógica
        try{
            $record = $this->model->find($id);
            if(!$record){
                return response()->json([
                    'status' => false,
                    'message' => 'Registro no encontrado.',
                ], 404);
            }
            $record->update($request->all());

            return response()->json([
                'status' => true,
                'message' => 'Registro actualizado exitosamente.',
                'data' => $record,
            ], 200);

        } catch (Exception $e){
            return response()->json([
                'status' => false,
                'message' => 'Error al actualizar el registro.',
                'error' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        }

    }

    public function destroy(string $id){

        // -- Permisos
        try{
            PermisosService::verificarPermisoIndividual($this->table, Acciones::UPDATE, Acciones::DELETE);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        }

        // -- Lógica
        try{
            DB::beginTransaction();
            $record = $this->model->withTrashed()->find($id);

            if(!$record){
                return response()->json([
                    'status' => false,
                    'message' => 'Registro no encontrado.',
                ], 404);
            }

            if($record->trashed()){
                return response()->json([
                    'status' => false,
                    'message' => 'El registro ya está deshabilitado.',
                ], 400);
            }

            $record->delete();
            DB::commit();
            return response()->json([
                'status' => true,
                'message' => 'Registro deshabilitado exitosamente.',
            ], 200);
        } catch (Exception $e){
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Error al deshabilitar el registro.',
                'error' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        }
    }

    public function restore(string $id){

        // -- PERMISOS
        try{
            PermisosService::verificarPermisoIndividual($this->table, Acciones::UPDATE, Acciones::DELETE);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        }

        // -- LÓGICA
        try{
            DB::beginTransaction();
            $record = $this->model->onlyTrashed()->find($id);
            if(!$record){
                return response()->json([
                    'status' => false,
                    'message' => 'Registro no deshabilitado.',
                ], 404);
            }
            $record->restore();
            $record->save();
            DB::commit();
            return response()->json([
                'status' => true,
                'message' => 'Registro rehabilitado exitosamente.',
            ], 200);
        } catch (Exception $e){
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Error al rehabilitar el registro.',
                'error' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        }
    }

    // !TODO: Método PATCH genérico (a implementar en controladores hijos según necesidad)
    // ! Sugiero revisión
    public function patch(string $id, Request $request){
        // -- Permisos
        try{
            PermisosService::verificarPermisoIndividual($this->table, Acciones::UPDATE);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        }

        // -- Lógica
        try{
            $record = $this->model->find($id);
            if(!$record){
                return response()->json([
                    'status' => false,
                    'message' => 'Registro no encontrado.',
                ], 404);
            }

            // Validar que haya campos para actualizar
            $payload = $request->all();
            if (empty($payload)) {
                return response()->json([
                    'status' => false,
                    'message' => 'No se proporcionaron campos para actualizar.',
                ], 400);
            }

            // Proteger campos immutables
            // !TODO: ejemplo id, created_at, updated_at, deleted_at
            $immutableFields = ['id', 'created_at', 'updated_at', 'deleted_at'];
            $rawData = $request->except($immutableFields);

            $data = [];
            foreach ($rawData as $key => $value) {
                if ($record->isFillable($key)) {
                    $data[$key] = $value;
                }
            }

            // Aplicar cambios parciales y dectectar cambios
            $record->fill($data);

            // Si no hay modificaciones, retornar mensaje
            if (!$record->isDirty()) {
                return response()->json([
                    'status' => true,
                    'message' => 'No se realizaron cambios en el registro.',
                    'data' => $record,
                ], 200);
            }

            // Capturar los campos modificados
            $dirty = $record->getDirty();
            $changes = [];
            foreach ($dirty as $attr => $newValue) {
                $changes[$attr] = [
                    'from' => $record->getOriginal($attr),
                    'to' => $newValue,
                ];
            }

            // Guardar cambios
            $record->save();

            // Mensaje según los campos modificados
            $changedKeys = array_keys($changes);
            $attrList = implode(', ', $changedKeys);
            $message = count($changedKeys) === 1
                ? "El campo '{$attrList}' ha sido actualizado."
                : "Los campos '{$attrList}' han sido actualizados.";

            // Respuesta exitosa
            return response()->json([
                'status' => true,
                'message' => $message,
                'data' => $record,
                'changes' => $changes,
            ], 200);
        } catch (Exception $e){
            return response()->json([
                'status' => false,
                'message' => 'Error al actualizar el registro.',
                'error' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        }
    }

    private static function throwFileException(string $message, int $code = 422){
        throw new Exception($message, $code);
    }

    private function getAllowedMimeTypesArray(): array{
        return array_filter(array_map('trim', explode(',', $this->MIMETYPES_ALLOWED)));
    }

    public function validateFileUpload(Request $request, string $fileKey){
        if (!$request->hasFile($fileKey)) {
            self::throwFileException("No se ha proporcionado ningún archivo para la clave '{$fileKey}'.");
        }

        $file = $request->file($fileKey);

        if (!$file) {
            self::throwFileException("El archivo proporcionado para la clave '{$fileKey}' es inválido.");
        }

        // Validar tamaño del archivo
        $size = $file->getSize();
        $maxSizeInBytes = $this->MAX_SIZE_FILES_IN_MB * 1024 * 1024;

        if ($size > $maxSizeInBytes) {
            self::throwFileException("El tamaño del archivo excede el límite máximo de {$this->MAX_SIZE_FILES_IN_MB} MB.");
        }

        // Validar tipo MIME
        $allowedMimeTypes = $this->getAllowedMimeTypesArray();
        if (count($allowedMimeTypes) >= 1 && !in_array($file->getMimeType(), $allowedMimeTypes)) {
            self::throwFileException("El tipo de archivo '{$file->getMimeType()}' no está permitido. Tipos permitidos: " . implode(', ', $allowedMimeTypes) . ".");
        }

        return $file;
    }

}
