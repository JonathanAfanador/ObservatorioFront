<?php

use App\Http\Controllers\MunicipiosController;
use App\Http\Controllers\DepartamentosController;
use App\Http\Controllers\BarriosController;
use App\Http\Controllers\TipoIdentController;
use App\Http\Controllers\TipoDocController;
use App\Http\Controllers\V1\AuditoriaController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\V1\AuthController;
use App\Http\Middleware\ForceJsonResponse;

// Rutas API

// //TODO: Rutas para departamentos
// Route::middleware('auth:sanctum')->prefix('departamentos')->group(function () {
//     // Paginacion
//     Route::get('/paginacion', [DepartamentosController::class, 'departamentos_paginados']);
//     // Creacion
//     Route::post('/creacion', [DepartamentosController::class, 'crear_departamento']);
//     // Actualizacion
//     Route::put('/actualizacion', [DepartamentosController::class, 'actualizar_departamento']);
//     // Eliminacion (Deshabilitacion)
//     Route::delete('/eliminacion', [DepartamentosController::class, 'eliminar_departamento']);
//     // Restauracion (Habilitacion)
//     Route::post('/restauracion', [DepartamentosController::class, 'restaurar_departamento']);
// });

// Registro y Login
Route::middleware(ForceJsonResponse::class)->group(function (){
    Route::prefix('auth')->group(function (){
        Route::post('/register', [AuthController::class, 'registro']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    Route::middleware('auth:sanctum')->group(function (){
        // -- Auth Routes
        Route::prefix('auth')->group(function (){
            Route::get('/logout', [AuthController::class, 'logout']);
            Route::get('/global-logout', [AuthController::class, 'globalLogout']);
            Route::get('/me', [AuthController::class, 'me']);
        });

        // -- Auditoria Routes
        Route::prefix('auditoria')->group(function (){
            Route::get('/', [AuditoriaController::class,'getFieldsPaginated']);
            Route::get('/{field}/uniques', [AuditoriaController::class, 'getUniquesFields']);
        });

        // -- Municipios Routes
        Route::prefix('municipios')->group(function (){
            Route::get('/', [MunicipiosController::class, 'index']);
            Route::get('/{id}', [MunicipiosController::class, 'show']);
            Route::post('/', [MunicipiosController::class, 'store']);
            Route::put('/{id}', [MunicipiosController::class, 'update']);
            Route::delete('/{id}', [MunicipiosController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [MunicipiosController::class, 'restore']);
        });

        // -- Departamentos Routes
        Route::prefix('departamentos')->group(function (){
            Route::get('/', [DepartamentosController::class, 'index']);
            Route::get('/{id}', [DepartamentosController::class, 'show']);
            Route::post('/', [DepartamentosController::class, 'store']);
            Route::put('/{id}', [DepartamentosController::class, 'update']);
            Route::delete('/{id}', [DepartamentosController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [DepartamentosController::class, 'restore']);
        });

        // -- Barrios Routes
        Route::prefix('barrios')->group(function (){
            // Rutas de Barrios irian aqui
            Route::get('/', [BarriosController::class, 'index']);
            Route::get('/{id}', [BarriosController::class, 'show']);
            Route::post('/', [BarriosController::class, 'store']);
            Route::put('/{id}', [BarriosController::class, 'update']);
            Route::delete('/{id}', [BarriosController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [BarriosController::class, 'restore']);
        });

        // -- Tipo Ident Routes
        Route::prefix('tipo_ident')->group(function (){
            Route::get('/', [TipoIdentController::class, 'index']);
            Route::get('/{id}', [TipoIdentController::class, 'show']);
            Route::post('/', [TipoIdentController::class, 'store']);
            Route::put('/{id}', [TipoIdentController::class, 'update']);
            Route::delete('/{id}', [TipoIdentController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [TipoIdentController::class, 'restore']);
        });

        // -- Tipo Ident Routes
        Route::prefix('tipo_ident')->group(function (){
            Route::get('/', [TipoDocController::class, 'index']);
            Route::get('/{id}', [TipoDocController::class, 'show']);
            Route::post('/', [TipoDocController::class, 'store']);
            Route::put('/{id}', [TipoDocController::class, 'update']);
            Route::delete('/{id}', [TipoDocController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [TipoDocController::class, 'restore']);
        });
    });
});

