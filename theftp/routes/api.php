<?php

use App\Http\Controllers\MunicipiosController;
use App\Http\Controllers\DepartamentosController;
use App\Http\Controllers\DocumentosController;
use App\Http\Controllers\BarriosController;
use App\Http\Controllers\CategoriasLicenciaController;
use App\Http\Controllers\LicenciasController;
use App\Http\Controllers\PersonasController;
use App\Http\Controllers\PermisosController;
use App\Http\Controllers\RestriccionLicController;
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

        // -- Documentos Routes
        Route::prefix('documentos')->group(function (){
            Route::get('/', [DocumentosController::class, 'index']);
            Route::get('/{id}', [DocumentosController::class, 'show']);
            Route::post('/', [DocumentosController::class, 'store']);
            Route::put('/{id}', [DocumentosController::class, 'update']);
            Route::delete('/{id}', [DocumentosController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [DocumentosController::class, 'restore']);
        });

        // -- Categorias Licencia Routes
        Route::prefix('categorias_licencia')->group(function (){
            Route::get('/', [CategoriasLicenciaController::class, 'index']);
            Route::get('/{id}', [CategoriasLicenciaController::class, 'show']);
            Route::post('/', [CategoriasLicenciaController::class, 'store']);
            Route::put('/{id}', [CategoriasLicenciaController::class, 'update']);
            Route::delete('/{id}', [CategoriasLicenciaController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [CategoriasLicenciaController::class, 'restore']);
        });

        // -- Restricciones Licencia Routes
        Route::prefix('restricciones_licencia')->group(function (){
            Route::get('/', [RestriccionLicController::class, 'index']);
            Route::get('/{id}', [RestriccionLicController::class, 'show']);
            Route::post('/', [RestriccionLicController::class, 'store']);
            Route::put('/{id}', [RestriccionLicController::class, 'update']);
            Route::delete('/{id}', [RestriccionLicController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [RestriccionLicController::class, 'restore']);
        });

        // -- Licencias Routes
        Route::prefix('licencias')->group(function (){
            Route::get('/', [LicenciasController::class, 'index']);
            Route::get('/{id}', [LicenciasController::class, 'show']);
            Route::post('/', [LicenciasController::class, 'store']);
            Route::put('/{id}', [LicenciasController::class, 'update']);
            Route::delete('/{id}', [LicenciasController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [LicenciasController::class, 'restore']);
        });

        // -- Personas Routes
        Route::prefix('personas')->group(function (){
            Route::get('/', [PersonasController::class, 'index']);
            Route::get('/{id}', [PersonasController::class, 'show']);
            Route::post('/', [PersonasController::class, 'store']);
            Route::put('/{id}', [PersonasController::class, 'update']);
            Route::delete('/{id}', [PersonasController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [PersonasController::class, 'restore']);
        });

        // -- Permisos Routes
        Route::prefix('permisos')->group(function (){
            Route::get('/', [PermisosController::class, 'index']);
            Route::get('/{id}', [PermisosController::class, 'show']);
            Route::post('/', [PermisosController::class, 'store']);
            Route::put('/{id}', [PermisosController::class, 'update']);
            Route::delete('/{id}', [PermisosController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [PermisosController::class, 'restore']);
        });
    });
});
