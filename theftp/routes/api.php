<?php

use App\Enums\Acciones;
use App\Enums\Tablas;
use App\Http\Controllers\MunicipiosController;
use App\Http\Controllers\V1\DepartamentosController;
use App\Http\Controllers\V1\AuditoriaController;
use App\Models\conductores;
use App\Models\seguim_estado_veh;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\V1\AuthController;
use App\Http\Services\PermisosService;
use App\Models\barrios;
use App\Models\cierre_sesion;
use App\Models\conductores_licencias;
use App\Models\departamentos;
use App\Models\documentos;
use App\Models\empresas;
use App\Models\inicio_sesion;
use App\Models\menus;
use App\Models\municipios;
use App\Models\permisos;
use App\Models\propietarios;
use App\Models\restriccion_lic;
use App\Models\rol;
use App\Models\rutas;
use App\Models\tipo_doc;
use App\Models\tipo_empresa;
use App\Models\tipo_ident;
use Illuminate\Support\Facades\Auth;

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
    });
});

