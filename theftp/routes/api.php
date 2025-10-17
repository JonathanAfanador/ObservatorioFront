<?php

use App\Enums\Acciones;
use App\Enums\Tablas;
use App\Http\Controllers\V1\DepartamentosController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\V1\AuthController;
use App\Http\Services\PermisosService;
use Illuminate\Support\Facades\Auth;

// Rutas API
Route::get('/test', function (){
    // Definir los permisos a verificar
    $permisos = [
        [
            'tabla' => Tablas::USERS,
            'acciones' => [
                Acciones::CREATE,
                Acciones::READ
            ],
        ],
        [
            'tabla' => Tablas::RUTAS,
            'acciones' => [
                Acciones::CREATE,
                Acciones::READ,
            ],
        ],
        [
            'tabla' => Tablas::DEPARTAMENTOS,
            'acciones' => [
                Acciones::CREATE,
            ],
        ]
    ];
    // Verificar permisos
    try{

        PermisosService::verificarPermisos($permisos);

        return response()->json([
            'message' => 'Permisos verificados correctamente'
        ], 200);
        // Si no tiene permisos, se lanza una excepción y se captura aquí
    } catch (Exception $e){
        return response()->json([
            'message' => $e->getMessage()
        ], $e->getCode() ?: 400);
    }

})->middleware('auth:sanctum');

// Ruta para obtener el usuario autenticado con sus relaciones
Route::get('/user', function (Request $request) {
    $usuario = Auth::user();

    $usuario->load(['persona', 'rol', 'persona.tipo_ident']);

    return $usuario;

})->middleware('auth:sanctum');

//TODO: Rutas para departamentos
Route::middleware('auth:sanctum')->prefix('departamentos')->group(function () {
    // Paginacion
    Route::get('/paginacion', [DepartamentosController::class, 'departamentos_paginados']);
    // Creacion
    Route::post('/creacion', [DepartamentosController::class, 'crear_departamento']);
    // Actualizacion
    Route::put('/actualizacion', [DepartamentosController::class, 'actualizar_departamento']);
    // Eliminacion (Deshabilitacion)
    Route::delete('/eliminacion', [DepartamentosController::class, 'eliminar_departamento']);
    // Restauracion (Habilitacion)
    Route::post('/restauracion', [DepartamentosController::class, 'restaurar_departamento']);
});

// Registro y Login
Route::post('/register', [AuthController::class, 'registro']);
Route::post('/login', [AuthController::class, 'login']);
