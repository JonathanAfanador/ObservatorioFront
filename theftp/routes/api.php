<?php

use App\Enums\Acciones;
use App\Enums\Tablas;
use App\Http\Controllers\TestController;
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
Route::get('/test', function (){
    // return barrios::with(['municipio', 'municipio.departamento'])->get();
    // return conductores_licencias::with(['conductor', 'conductor.persona', 'conductor.persona.tipo_ident', 'licencia', 'licencia.restriccion', 'licencia.categoria', 'licencia.documento'])->get();
    // return conductores::with(['persona', 'persona.tipo_ident'])->get();
    // return departamentos::with('municipios')->get();
    // return cierre_sesion::with('usuario', 'usuario.persona', 'usuario.rol', 'usuario.persona.tipo_ident')->get();
    // return documentos::with('tipo_documento')->get();
    // return empresas::with('usuarios')->get();
    // return inicio_sesion::with('usuario')->get();
    // return menus::with(['submenusRecursive', 'roles_menu'])->get();
    // return permisos::with('rol')->get();
    // return propietarios::with(['documento'])->get();
    // return restriccion_lic::with('licencias')->get();
    // return rol::with(['permisos', 'users'])->get();
    // return rutas::with('empresa')->get();
    // return seguim_estado_veh::with(['usuario', 'vehiculo', 'vehiculo.tipo', 'ruta', 'vehiculo.propietario'])->get();
    // return tipo_doc::with('documentos')->get();
    // return tipo_empresa::with('empresas')->get();
    // return tipo_ident::with('personas')->get();

    $test = new TestController();
    return $test->index();
});

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

Route::middleware('auth:sanctum')->group(function (){
    Route::get('/logout', [AuthController::class, 'logout']);
    Route::get('/global-logout', [AuthController::class, 'globalLogout']);
    Route::get('/me', [AuthController::class, 'me']);
});

Route::middleware('auth:sanctum')->prefix('auditoria')->group(function (){
    Route::get('/get', [AuditoriaController::class,'getFieldsPaginated']);
    Route::get('/{field}/uniques', [AuditoriaController::class, 'getUniquesFields']);
});
