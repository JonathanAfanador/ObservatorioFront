<?php

use App\Http\Controllers\MunicipiosController;
use App\Http\Controllers\DepartamentosController;
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
    });
});

