<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class DepartamentosController extends Controller
{
    public function departamentos_paginados(Request $request){



        $datos = $request->all();

        // Validador
        $validator = Validator::make($datos, [
            'page'           => 'sometimes|integer|min:1',
            'per_page'       => 'sometimes|integer|min:1|max:100',
            // Permite -created_at, nombre de columna con letras/números/underscore/punto
            'sort'           => ['sometimes','string','max:191','regex:/^-?[A-Za-z0-9_\.]+$/'],
            // filter llega como JSON (array de objetos: [{column: "...", value: ...}])
            'filter'         => 'sometimes|string',
            'includeDeleted' => 'sometimes|boolean',
        ]);

        // Etiquetas
        $validator->setAttributeNames([
            'page'           => 'página',
            'per_page'       => 'elementos por página',
            'sort'           => 'orden',
            'filter'         => 'filtro',
            'includeDeleted' => 'incluir eliminados',
        ]);

        // Mensajes
        $validator->setCustomMessages([
            'page.integer'            => 'El :attribute debe ser un número entero.',
            'page.min'                => 'El :attribute debe ser al menos :min.',
            'per_page.integer'        => 'El :attribute debe ser un número entero.',
            'per_page.min'            => 'El :attribute debe ser al menos :min.',
            'per_page.max'            => 'El :attribute no debe exceder :max.',
            'sort.string'             => 'El :attribute debe ser una cadena de texto.',
            'sort.max'                => 'El :attribute no debe exceder :max caracteres.',
            'sort.regex'              => 'El :attribute debe indicar una columna válida (por ejemplo "-created_at" o "nombre").',
            'filter.string'           => 'El :attribute debe ser una cadena JSON.',
            'includeDeleted.boolean'  => 'El :attribute debe ser true o false.',
        ]);

        // 400 Bad Request
        if ($validator->fails()) {
            return response()->json([
                'status'   => false,
                'messages' => 'Parámetros inválidos',
                'data'     => [],
                'errors'   => $validator->errors()
            ], 400);
        }

        try {
            // Parámetros con valores por defecto
            $page           = (int) $request->input('page', 1);
            $perPage        = (int) $request->input('per_page', 10);
            if ($perPage > 100) $perPage = 100;

            $sortParam      = $request->input('sort'); // p. ej., -created_at
            $filterRaw      = $request->input('filter'); // JSON como string
            $includeDeleted = filter_var($request->input('includeDeleted', false), FILTER_VALIDATE_BOOLEAN);

            $tabla = 'departamentos';
            $query = DB::table($tabla);

            // includeDeleted (por defecto false => sólo no eliminados)
            if (!$includeDeleted && Schema::hasColumn($tabla, 'deleted_at')) {
                $query->whereNull($tabla . '.deleted_at');
            }

            // ---- Filtro avanzado: arreglo de reglas [{column, value}] ----
            if (!empty($filterRaw)) {
                // Intentar decodificar tal cual y luego urldecode si falla
                $filter = json_decode($filterRaw, true);
                if ($filter === null && json_last_error() !== JSON_ERROR_NONE) {
                    $filter = json_decode(urldecode($filterRaw), true);
                }

                // Debe ser array de reglas
                if (!is_array($filter)) {
                    return response()->json([
                        'status'   => false,
                        'messages' => 'El parámetro filter debe ser un JSON con un arreglo de reglas.',
                        'data'     => [],
                        'errors'   => ['filter' => ['Formato inválido: se esperaba un arreglo de objetos {column, value}.']]
                    ], 400);
                }

                foreach ($filter as $idx => $rule) {
                    // Validar estructura mínima
                    if (!is_array($rule) || !array_key_exists('column', $rule)) {
                        return response()->json([
                            'status'   => false,
                            'messages' => 'Parámetros inválidos',
                            'data'     => [],
                            'errors'   => ['filter' => ["Item #$idx inválido: falta la clave 'column'."]]
                        ], 400);
                    }

                    $column = (string) $rule['column'];
                    $value  = $rule['value'] ?? null;

                    // No permitir interferir con includeDeleted
                    if ($column === 'deleted_at') {
                        continue;
                    }

                    // Validar columna existente
                    if (!Schema::hasColumn($tabla, $column)) {
                        return response()->json([
                            'status'   => false,
                            'messages' => "Parámetros inválidos: la columna '$column' no existe.",
                            'data'     => [],
                        ], 400);
                    }

                    // Aplicar condición
                    $colFull = $tabla . '.' . $column;

                    if (is_array($value)) {
                        // whereIn para arrays (si el array viene vacío, no devuelve nada)
                        if (count($value) === 0) {
                            // Forzar resultado vacío de manera explícita
                            $query->whereRaw('1=0');
                        } else {
                            $query->whereIn($colFull, $value);
                        }
                    } else {
                        // Tratar null como whereNull/whereNotNull? (por ahora: whereNull si es null)
                        if (is_null($value)) {
                            $query->whereNull($colFull);
                        } else {
                            $query->where($colFull, $value);
                        }
                    }
                }
            }
            // ---- Fin filtro avanzado ----

            // Orden (sort: "-columna" => desc, "columna" => asc)
            if (!empty($sortParam)) {
                $direction = 'asc';
                $column    = $sortParam;

                if (str_starts_with($sortParam, '-')) {
                    $direction = 'desc';
                    $column    = ltrim($sortParam, '-');
                }

                // Validar columna
                if (!Schema::hasColumn($tabla, $column)) {
                    return response()->json([
                        'status'   => false,
                        'messages' => "Parámetro inválido: la columna de orden '$column' no existe.",
                        'data'     => [],
                    ], 400);
                }

                $query->orderBy($tabla . '.' . $column, $direction);
            }

            // Paginación
            $paginator = $query->paginate($perPage, ['*'], 'page', $page);
            $items     = $paginator->items();

            if (empty($items)) {
                return response()->json([
                    'status'   => false,
                    'messages' => 'No se encontraron departamentos para los parámetros proporcionados.',
                    'data'     => [],
                ], 404);
            }

            return response()->json([
                'status'   => true,
                'messages' => null,
                'data'     => $items,
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'status'   => false,
                'messages' => 'Error interno del servidor.',
                'data'     => [],
                'errors'   => ['exception' => [$e->getMessage()]]
            ], 500);
        }
    }

    public function crear_departamento(Request $request) {

        // 401 Unauthorized si no está autenticado
        if (!Auth::check()) {
            return response()->json([
                'status' => false,
                'messages' => 'No autenticado',
                'data' => null,
            ], 401); // 401 Unauthorized
        }

        $datos = $request->all();

        //Validador
        $validator = Validator::make($datos, [
            'name' => 'required|string|max:255|unique:departamentos,name',
            'codigo_dane' => 'required|string|max:10|unique:departamentos,codigo_dane',
        ]);

        //Mensajes de errores en español
        $validator->setAttributeNames([
            'name' => 'nombre',
            'codigo_dane' => 'Codigo DANE',
        ]);

        //Mensajes de error personalizados
        $messages = [
            'name.required' => 'El :attribute es obligatorio.',
            'name.string' => 'El :attribute debe ser una cadena de texto.',
            'name.max' => 'El :attribute no debe exceder los :max caracteres.',
            'name.unique' => 'El :attribute ya está en uso.',
            'codigo_dane.required' => 'El :attribute es obligatorio.',
            'codigo_dane.string' => 'El :attribute debe ser una cadena de texto.',
            'codigo_dane.max' => 'El :attribute no debe exceder los :max caracteres.',
            'codigo_dane.unique' => 'El :attribute ya está en uso.',
        ];

        $validator->setCustomMessages($messages);

        // 400 Bad Request (Datos inválidos)
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'messages' => 'Datos inválidos',
                'data' => null,
                'errors' => $validator->errors()
            ], 400);
        }

        try {

            DB::beginTransaction();

            $now = now();

            // Inserción
            $id = DB::table('departamentos')->insertGetId([
                'name' => $datos['name'],
                'codigo_dane' => $datos['codigo_dane'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Recuperar el departamento creado
            $departamento = DB::table('departamentos')->where('id', $id)->first();

            DB::commit();

            return response()->json([
                'status' => true,
                'messages' => 'Departamento creado exitosamente',
                'data' => $departamento,
            ], 201); // 201 Created

        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'status' => false,
                'messages' => 'Error interno del servidor.',
                'data' => null,
                'errors' => ['exception' => [$e->getMessage()]]
            ], 500); // 500 Internal Server Error

        }
    }

    public function actualizar_departamento(Request $request) {
        // 401 Unauthorized si no está autenticado
        if (!Auth::check()) {
            return response()->json([
                'status' => false,
                'messages' => 'No autenticado',
                'data' => null,
            ], 401); // 401 Unauthorized
        }

        $datos = $request->all();

        //Validador
        $validator = Validator::make($datos, [
            'id' => 'required|integer|exists:departamentos,id',
            'name' => 'required|string|max:255|unique:departamentos,name,' . $datos['id'],
            'codigo_dane' => 'required|string|max:10|unique:departamentos,codigo_dane,' . $datos['id'],
        ]);

        //Mensajes de errores en español
        $validator->setAttributeNames([
            'id' => 'ID del departamento',
            'name' => 'nombre',
            'codigo_dane' => 'Codigo DANE',
        ]);

        //Mensajes de error personalizados
        $messages = [
            'id.required' => 'El :attribute es obligatorio.',
            'id.integer' => 'El :attribute debe ser un número entero.',
            'id.exists' => 'El :attribute no existe.',
            'name.required' => 'El :attribute es obligatorio.',
            'name.string' => 'El :attribute debe ser una cadena de texto.',
            'name.max' => 'El :attribute no debe exceder los :max caracteres.',
            'name.unique' => 'El :attribute ya está en uso.',
            'codigo_dane.required' => 'El :attribute es obligatorio.',
            'codigo_dane.string' => 'El :attribute debe ser una cadena de texto.',
            'codigo_dane.max' => 'El :attribute no debe exceder los :max caracteres.',
            'codigo_dane.unique' => 'El :attribute ya está en uso.',
        ];

        $validator->setCustomMessages($messages);

        // 400 Bad Request (Datos inválidos)
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'messages' => 'Datos inválidos',
                'data' => null,
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            DB::beginTransaction();

            $id = (int) $request->input('id');

            // Verificar que el departamento exista
            $actual = DB::table('departamentos')->where('id', $id)->first();
            if (!$actual) {
                return response()->json([
                    'status' => false,
                    'messages' => 'El departamento no existe',
                    'data' => null,
                ], 404); // 404 Not Found
            }

            // Actualizar

            DB::table('departamentos')->where('id', $id)->update([
                'name' => $request->input('name'),
                'codigo_dane' => $request->input('codigo_dane'),
                'updated_at' => now(),
            ]);

            // Recuperar el departamento actualizado
            $departamento = DB::table('departamentos')->where('id', $id)->first();

            DB::commit();

            return response()->json([
                'status' => true,
                'messages' => 'Departamento actualizado exitosamente',
                'data' => $departamento,
            ], 200); // 200 OK
        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'status' => false,
                'messages' => 'Error interno del servidor.',
                'data' => null,
                'errors' => ['exception' => [$e->getMessage()]]
            ], 500); // 500 Internal Server Error

        }
    }

    //TODO: Eliminar = Deshabilitar
    public function eliminar_departamento(Request $request) {
        // 401 Unauthorized si no está autenticado
        if (!Auth::check()) {
            return response()->json([
                'status' => false,
                'messages' => 'No autenticado',
                'data' => null,
            ], 401); // 401 Unauthorized
        }

        $datos = $request->all();

        //Validador
        $validator = Validator::make($datos, [
            'id' => 'required|integer|min:1',
        ]);

        //Mensajes de errores en español
        $validator->setAttributeNames([
            'id' => 'ID del departamento',
        ]);

        //Mensajes de error personalizados
        $messages = [
            'id.required' => 'El :attribute es obligatorio.',
            'id.integer' => 'El :attribute debe ser un número entero.',
            'id.exists' => 'El :attribute no existe.',
        ];

        $validator->setCustomMessages($messages);

        // 400 Bad Request (Datos inválidos)
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'messages' => 'Datos inválidos',
                'data' => null,
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            DB::beginTransaction();

            $tabla = 'departamentos';
            $id = (int) $request->input('id');

            // Buscar el departamento (para 404 explicito)
            $registro = DB::table($tabla)->where('id', $id)->first();
            if (!$registro) {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'messages' => 'El departamento no existe',
                    'data' => null,
                ], 404); // 404 Not Found
            }

            $now = now();

            // Soft delete si tiene columna deleted_at
            if (Schema::hasColumn($tabla, 'deleted_at')) {
                //TODO: ¿Mejor usar un code 200 o 409?
                // Si ya esta deshabilitado, devolverlo tal cual
                if (!is_null($registro->deleted_at)) {
                    DB::commit();
                    return response()->json([
                        'status' => true,
                        'messages' => 'El departamento ya está deshabilitado',
                        'data' => $registro,
                    ], 200); // 200 OK
                }

                DB::table($tabla)->where('id', $id)->update([
                    'deleted_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            //No hay formar de deshabilitar
            else {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'messages' => 'No se puede deshabilitar el recurso: la tabla no tiene "deleted_at" ni "eliminado".',
                    'data' => null,
                ], 500); // 500 Internal Server Error
            }

            // Devolver el objeto actualizado/deshabilitado
            $deshabilitado = DB::table($tabla)->where('id', $id)->first();

            DB::commit();

            return response()->json([
                'status' => true,
                'messages' => 'Departamento deshabilitado exitosamente',
                'data' => $deshabilitado,
            ], 200); // 200 OK
        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'status' => false,
                'messages' => 'Error interno del servidor.',
                'data' => null,
                'errors' => ['exception' => [$e->getMessage()]]
            ], 500); // 500 Internal Server Error
        }
    }

    public function restaurar_departamento(Request $request) {

        $datos = $request->all();

        //Validador
        $validator = Validator::make($datos, [
            'id' => 'required|integer|exists:departamentos,id',
        ]);

        //Mensajes de errores en español
        $validator->setAttributeNames([
            'id' => 'ID del departamento',
        ]);

        //Mensajes de error personalizados
        $messages = [
            'id.required' => 'El :attribute es obligatorio.',
            'id.integer' => 'El :attribute debe ser un número entero.',
            'id.exists' => 'El :attribute no existe.',
        ];

        $validator->setCustomMessages($messages);

        // Mapeo: si falla exists, es 404 Not Found
        if($validator->fails()) {
            $failed = $validator->failed();
            if(isset($failed['id']) && array_key_exists('Exists', $failed['id'])) {
                return response()->json([
                    'status' => false,
                    'messages' => 'El departamento no existe',
                    'data' => null,
                ], 404); // 404 Not Found
            }
        }

        // 400 Bad Request (Datos inválidos)
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'messages' => 'Datos inválidos',
                'data' => null,
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            DB::beginTransaction();

            $tabla = 'departamentos';
            $id = (int) $request->input('id');

            // 404 si no existe
            $registro = DB::table($tabla)->where('id', $id)->first();
            if (!$registro) {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'messages' => 'Recurso no encontrado',
                    'data' => null,
                ], 404); // 404 Not Found
            }

            $now = now();

            // Restaurar si tiene columna deleted_at
            if (Schema::hasColumn($tabla, 'deleted_at')) {
                // Si ya esta habilitado, devolverlo tal cual
                if (is_null($registro->deleted_at)) {
                    DB::commit();
                    return response()->json([
                        'status' => true,
                        'messages' => 'El departamento ya está habilitado',
                        'data' => $registro,
                    ], 200); // 200 OK
                }
                DB::table($tabla)->where('id', $id)->update([
                    'deleted_at' => null,
                    'updated_at' => $now,
                ]);
            }
            elseif (Schema::hasColumn($tabla, 'eliminado')) {
                // Si ya esta habilitado, devolverlo tal cual
                if (property_exists($registro, 'eliminado') && (bool) $registro->eliminado === false) {
                    DB::commit();
                    return response()->json([
                        'status' => true,
                        'messages' => 'El departamento ya está habilitado',
                        'data' => $registro,
                    ], 200); // 200 OK
                }
                DB::table($tabla)->where('id', $id)->update([
                    'eliminado' => false,
                    'updated_at' => $now,
                ]);
            }
            else {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'messages' => 'No se puede restaurar el recurso: la tabla no tiene "deleted_at" ni "eliminado".',
                    'data' => null,
                ], 500); // 500 Internal Server Error
            }

            // Devolver el objeto restaurado
            $restaurado = DB::table($tabla)->where('id', $id)->first();

            DB::commit();

            return response()->json([
                'status' => true,
                'messages' => 'Departamento restaurado exitosamente',
                'data' => $restaurado,
            ], 200); // 200 OK
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'messages' => 'Error interno del servidor.',
                'data' => null,
                'errors' => ['exception' => [$e->getMessage()]]
            ], 500); // 500 Internal Server Error
        }
    }
}
