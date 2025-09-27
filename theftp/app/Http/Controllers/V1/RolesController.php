<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Models\rol;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RolesController extends Controller
{
    // Notas:
    // "?" = Signo opcional

    // Roles paginados con filtros y permisos
    public function roles_paginados(Request $request){

        $datos = $request->all();

        //Validador
        $validator = Validator::make($datos, [
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'search' => 'sometimes|string|max:255',
        ]);

        //Mensajes de errores en español
        $validator->setAttributeNames([
            'page' => 'página',
            'per_page' => 'elementos por página',
            'search' => 'búsqueda',
        ]);

        //Mensajes de error personalizados
        $messages = [
            'page.integer' => 'El :attribute debe ser un número entero.',
            'page.min' => 'El :attribute debe ser al menos :min.',
            'per_page.integer' => 'El :attribute debe ser un número entero.',
            'per_page.min' => 'El :attribute debe ser al menos :min.',
            'per_page.max' => 'El :attribute no debe exceder :max.',
            'search.string' => 'El :attribute debe ser una cadena de texto.',
            'search.max' => 'El :attribute no debe exceder los :max caracteres.',
        ];

        $validator->setCustomMessages($messages);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }


        $page = $request->input('page', 1); // Valor por defecto 1
        $perPage = $request->input('per_page', 10); // Valor por defecto 10
        $search = $request->input('search', null); // Valor por defecto null

        try {
            // Query con Permisos y Filtro
            $paginator = rol::with('permisos')
                ->when($search, function ($query, $search) {
                    return $query->where('descripcion', 'like', '%' . $search . '%');
                })
                ->orderBy('id', 'asc')
                ->paginate($perPage, ['*'], 'page', $page);

            // Exito o Fracaso de la paginación
            $isEmpty = $paginator->isEmpty();
            $last = $paginator->lastPage(); // Total de páginas
            $total = $paginator->total();

            if ($isEmpty && $page > max(1, $last)) {
                return response()->json(['success' => false,
                'error' => 'Página fuera de rango.',
                'meta' => [
                    'current_page' => $page,
                    'last_page' => $last,
                    'total' => $total,
                    'per_page' => $perPage,
                ],
                'filters' => [
                    'search' => $search,
                ]], 422);
            }

            // Exito: aunque no hayan datos (Filtro muy restrictivo o DB vacía)
            return response()->json([
                'success' => true,
                'data'    => $paginator->items(),  // roles con permisos
                'meta'    => [
                    'current_page' => $paginator->currentPage(),
                    'per_page'     => $paginator->perPage(),
                    'last_page'    => $last,
                    'total'        => $total,
                    'from'         => $paginator->firstItem(),
                    'to'           => $paginator->lastItem(),
                ],
                'links'   => [
                    'first' => $paginator->url(1),
                    'prev'  => $paginator->previousPageUrl(),
                    'next'  => $paginator->nextPageUrl(),
                    'last'  => $paginator->url($last),
                ],
                'filters' => ['search' => $search],
                'message' => $isEmpty ? 'No hay roles para los filtros/página solicitados.' : null,
            ], 200);
        } catch (\Throwable $e) {
            // 4) Error real (SQL, conexión, etc.)
            Log::error('Roles pagination failed', [
                'error'    => $e->getMessage(),
                'page'     => $page,
                'per_page' => $perPage,
                'search'   => $search,
            ]);
        }

        return response()->json([
            'success' => false,
            'error'   => 'Error interno al paginar roles',
        ], 500);
    }


    public function crear_roles(Request $request){
        $datos = $request->all();

        // Validador
        $validator = Validator::make($datos, [
            'descripcion' => 'required|string|max:255|unique:rol,descripcion',
        ]);

        // Mensajes de errores en español
        $validator->setAttributeNames([
            'descripcion' => 'descripción',
        ]);

        // Mensajes de error personalizados
        $messages = [
            'descripcion.required' => 'La :attribute es obligatoria.',
            'descripcion.string' => 'La :attribute debe ser una cadena de texto.',
            'descripcion.max' => 'La :attribute no debe exceder los :max caracteres.',
            'descripcion.unique' => 'La :attribute ya está en uso.',
        ];

        $validator->setCustomMessages($messages);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (rol::where('descripcion', $datos['descripcion'])->exists()) {
            return response()->json(['error' => 'El rol ya existe'], 409);
        }

        // Crear el rol
        $rol = DB::table('rol')->insert([
            'descripcion' => $datos['descripcion'],
        ]);

        return response()->json(['message' => 'Rol creado exitosamente', 'rol' => $rol], 201);
    }

    public function actualizar_rol(Request $request){
        $datos = $request->all();

        // Validador
        $validator = Validator::make($datos, [
            'id' => 'required|integer|exists:rol,id',
            'descripcion' => 'required|string|max:255|unique:rol,descripcion,' . $datos['id'],
        ]);

        // Mensajes de errores en español
        $validator->setAttributeNames([
            'descripcion' => 'descripción',
        ]);

        // Mensajes de error personalizados
        $messages = [
            'id.required' => 'El :attribute es obligatorio.',
            'id.integer' => 'El :attribute debe ser un número entero.',
            'id.exists' => 'El :attribute no existe.',
            'descripcion.required' => 'La :attribute es obligatoria.',
            'descripcion.string' => 'La :attribute debe ser una cadena de texto.',
            'descripcion.max' => 'La :attribute no debe exceder los :max caracteres.',
            'descripcion.unique' => 'La :attribute ya está en uso.',
        ];

        $validator->setCustomMessages($messages);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Actualizar el rol
        DB::table('rol')->where('id', $datos['id'])->update([
            'descripcion' => $datos['descripcion'],
        ]);

        return response()->json(['message' => 'Rol actualizado exitosamente'], 200);
    }
}
