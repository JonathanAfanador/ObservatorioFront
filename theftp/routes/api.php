<?php

use App\Enums\Acciones;
use App\Enums\Tablas;
use App\Http\Controllers\DepartamentosController;
use App\Http\Controllers\V1\AuditoriaController;
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
// Paginacion
Route::get('/paginacion', [DepartamentosController::class, 'departamentos_paginados'])->middleware('auth:sanctum');
// Creacion
Route::post('/creacion', [DepartamentosController::class, 'crear_departamento'])->middleware('auth:sanctum');
// Actualizacion
Route::put('/actualizacion', [DepartamentosController::class, 'actualizar_departamento'])->middleware('auth:sanctum');
// Eliminacion (Deshabilitacion)
Route::delete('/eliminacion', [DepartamentosController::class, 'eliminar_departamento'])->middleware('auth:sanctum');
// Restauracion (Habilitacion)
Route::post('/restauracion', [DepartamentosController::class, 'restaurar_departamento'])->middleware('auth:sanctum');

// Registro y Login
Route::post('/register', [AuthController::class, 'registro']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->prefix('auditoria')->group(function (){
    Route::get('/get', [AuditoriaController::class,'getFieldsPaginated']);
    Route::get('/{field}/uniques', [AuditoriaController::class, 'getUniquesFields']);
});
