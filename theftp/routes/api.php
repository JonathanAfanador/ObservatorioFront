<?php

use App\Http\Controllers\MunicipiosController;
use App\Http\Controllers\DepartamentosController;
use App\Http\Controllers\DocumentosController;
use App\Http\Controllers\BarriosController;
use App\Http\Controllers\CategoriasLicenciaController;
use App\Http\Controllers\ConductoresController;
use App\Http\Controllers\ConductoresLicenciaController;
use App\Http\Controllers\NovedadConductorController;
use App\Http\Controllers\NovedadLicenciaController;
// use App\Http\Controllers\RestriccionLicenciaController; // Eliminado por redundancia
use Illuminate\Http\Request;
use App\Http\Controllers\EmpresasController;
use App\Http\Controllers\LicenciasController;
use App\Http\Controllers\PersonasController;
use App\Http\Controllers\PermisosController;
use App\Http\Controllers\PropietariosController;
use App\Http\Controllers\RestriccionLicController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\RolesMenusController;
use App\Http\Controllers\RutasController;
use App\Http\Controllers\ParaderosController;
use App\Http\Controllers\SeguimGpsController;
use App\Http\Controllers\SeguimEstadoVehController;
use App\Http\Controllers\MenusController;
use App\Http\Controllers\TipoEmpresaController;
use App\Http\Controllers\TipoIdentController;
use App\Http\Controllers\TipoDocController;
use App\Http\Controllers\TipoVehiculoController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\VehiculoController;
use App\Http\Controllers\NovedadVehiculoController;
use App\Http\Controllers\AuditoriaController;
use App\Http\Controllers\Api\DashboardSecretariaController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\V1\AuthController;
use App\Http\Middleware\ForceJsonResponse;

// Rutas Públicas (Geovisor y Consultas Ciudadanas)
Route::group(['middleware' => [ForceJsonResponse::class, 'throttle:100,1']], function (){
    Route::prefix('public')->group(function (){
        Route::get('/geovisor/rutas', [RutasController::class, 'publicGeovisor']);
        Route::get('/geovisor/osrm-route', [\App\Http\Controllers\GeovisorController::class, 'proxyOsrmRoute']);
    });
});

// Registro y Login (Ajustado para desarrollo - 60 requests por minuto)
Route::group(['middleware' => [ForceJsonResponse::class, 'throttle:60,1']], function (){
    Route::prefix('auth')->group(function (){
        Route::post('/register', [AuthController::class, 'registro']);
        Route::post('/login', [AuthController::class, 'login']);
    });
});

// Rutas protegidas por Sanctum y Throttle estándar (200 requests por minuto)
Route::group(['middleware' => [ForceJsonResponse::class, 'auth:sanctum', 'throttle:200,1']], function (){
    // -- Auth Routes
    Route::prefix('auth')->group(function (){
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/global-logout', [AuthController::class, 'globalLogout']);
        
        // ==============================================
        // 1. RUTAS PÚBLICAS (Solo requieren autenticación)
        // Usadas por todos los roles para alimentar sus dashboards
        // ==============================================
        Route::get('/me', [AuthController::class, 'me']);
    });
    
    // Rutas de Obtención (Catálogos y Listados) - Abierto para Dashboards (Secretaría, Empresa, etc.)
    Route::get('/municipios', [MunicipiosController::class, 'index']);
    Route::get('/municipios/{id}', [MunicipiosController::class, 'show']);
    
    Route::get('/departamentos', [DepartamentosController::class, 'index']);
    Route::get('/departamentos/{id}', [DepartamentosController::class, 'show']);
    
    Route::get('/barrios', [BarriosController::class, 'index']);
    Route::get('/barrios/{id}', [BarriosController::class, 'show']);
    
    Route::get('/tipo_ident', [TipoIdentController::class, 'index']);
    Route::get('/tipo_ident/{id}', [TipoIdentController::class, 'show']);
    
    Route::get('/tipo_doc', [TipoDocController::class, 'index']);
    Route::get('/tipo_doc/{id}', [TipoDocController::class, 'show']);
    
    Route::get('/documentos', [DocumentosController::class, 'index']);
    Route::get('/documentos/{id}', [DocumentosController::class, 'show']);
    Route::get('/documentos/{id}/file', [DocumentosController::class, 'getFile']);
    
    Route::get('/categorias_licencia', [CategoriasLicenciaController::class, 'index']);
    Route::get('/categorias_licencia/{id}', [CategoriasLicenciaController::class, 'show']);
    
    Route::get('/restriccion_lic', [RestriccionLicController::class, 'index']);
    Route::get('/restriccion_lic/{id}', [RestriccionLicController::class, 'show']);
    
    Route::get('/licencias', [LicenciasController::class, 'index']);
    Route::get('/licencias/{id}', [LicenciasController::class, 'show']);
    
    Route::get('/personas', [PersonasController::class, 'index']);
    Route::get('/personas/{id}', [PersonasController::class, 'show']);
    
    Route::get('/permisos', [PermisosController::class, 'index']);
    Route::get('/permisos/{id}', [PermisosController::class, 'show']);
    
    Route::get('/rol', [RolController::class, 'index']);
    Route::get('/rol/{id}', [RolController::class, 'show']);
    
    Route::get('/menus', [MenusController::class, 'index']);
    Route::get('/menus/{id}', [MenusController::class, 'show']);
    
    Route::get('/roles-menus', [RolesMenusController::class, 'index']);
    Route::get('/roles-menus/{id}', [RolesMenusController::class, 'show']);
    
    Route::get('/tipo-empresa', [TipoEmpresaController::class, 'index']);
    Route::get('/tipo-empresa/{id}', [TipoEmpresaController::class, 'show']);
    
    Route::get('/empresas', [EmpresasController::class, 'index']);
    Route::get('/empresas/{id}', [EmpresasController::class, 'show']);
    
    Route::get('/rutas', [RutasController::class, 'index']);
    Route::get('/rutas/{id}', [RutasController::class, 'show']);
    Route::get('/rutas/{id}/file', [RutasController::class, 'getFile']);
    
    Route::get('/users', [UsersController::class, 'index']);
    Route::get('/users/{id}', [UsersController::class, 'show']);
    
    Route::get('/conductores', [ConductoresController::class, 'index']);
    Route::get('/conductores/{id}', [ConductoresController::class, 'show']);
    
    Route::get('/tipo-vehiculo', [TipoVehiculoController::class, 'index']);
    Route::get('/tipo-vehiculo/{id}', [TipoVehiculoController::class, 'show']);
    
    Route::get('/propietarios', [PropietariosController::class, 'index']);
    Route::get('/propietarios/{id}', [PropietariosController::class, 'show']);
    
    Route::get('/vehiculos', [VehiculoController::class, 'index']);
    Route::get('/vehiculos/{id}', [VehiculoController::class, 'show']);
    
    Route::get('/conductores-licencias', [ConductoresLicenciaController::class, 'index']);
    Route::get('/conductores-licencias/{id}', [ConductoresLicenciaController::class, 'show']);
    
    Route::get('/novedades-conductores', [NovedadConductorController::class, 'index']);
    Route::get('/novedades-conductores/{id}', [NovedadConductorController::class, 'show']);
    
    Route::get('/novedades-licencias', [NovedadLicenciaController::class, 'index']);
    Route::get('/novedades-licencias/{id}', [NovedadLicenciaController::class, 'show']);

    // ==============================================
    // 1.1 MÓDULO GPS (Protegido por rol: Admin, Empresa, Secretaría)
    // ==============================================
    Route::middleware('role:1,2,3,6')->group(function () {
        Route::prefix('seguim-gps')->group(function (){
            Route::get('/', [SeguimGpsController::class, 'index']);
            Route::get('/{id}', [SeguimGpsController::class, 'show']);
            Route::post('/', [SeguimGpsController::class, 'store']);
            Route::put('/{id}', [SeguimGpsController::class, 'edit']);
            Route::delete('/{id}', [SeguimGpsController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [SeguimGpsController::class, 'restore']);
        });

        Route::prefix('seguim-estado-veh')->group(function (){
            Route::get('/', [SeguimEstadoVehController::class, 'index']);
            Route::get('/{id}', [SeguimEstadoVehController::class, 'show']);
            Route::post('/', [SeguimEstadoVehController::class, 'store']);
            Route::put('/{id}', [SeguimEstadoVehController::class, 'edit']);
            Route::delete('/{id}', [SeguimEstadoVehController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [SeguimEstadoVehController::class, 'restore']);
        });
    });

    // ==============================================
    // 2. RUTAS PROTEGIDAS PARA GESTIÓN DE EMPRESAS (Admin [1,6], Secretaría [2] y Empresa [3])
    // ==============================================
    Route::middleware('role:1,2,3,6')->group(function () {
        // Vehículos (La Empresa 3 puede crear los suyos)
        Route::post('/vehiculos', [VehiculoController::class, 'store']);
        Route::put('/vehiculos/{id}', [VehiculoController::class, 'update']);
        Route::delete('/vehiculos/{id}', [VehiculoController::class, 'destroy']);
        Route::post('/vehiculos/{id}/rehabilitate', [VehiculoController::class, 'restore']);
        
        // Novedades de Vehículos
        Route::get('/novedades-vehiculos', [NovedadVehiculoController::class, 'index']);
        Route::post('/novedades-vehiculos', [NovedadVehiculoController::class, 'store']);
        Route::get('/novedades-vehiculos/{id}', [NovedadVehiculoController::class, 'show']);
        Route::put('/novedades-vehiculos/{id}', [NovedadVehiculoController::class, 'update']);
        Route::delete('/novedades-vehiculos/{id}', [NovedadVehiculoController::class, 'destroy']);

        // Rutas de Transporte (La Empresa 3 puede proponer/crear sus rutas)
        Route::post('/rutas', [RutasController::class, 'store']);
        Route::post('/rutas/{id}', [RutasController::class, 'edit']);
        Route::patch('/rutas/{id}', [RutasController::class, 'patch']);
        Route::delete('/rutas/{id}', [RutasController::class, 'destroy']);
        Route::post('/rutas/{id}/rehabilitate', [RutasController::class, 'restore']);

        // Paraderos (La Secretaría gestiona paraderos en masa o unitarios)
        Route::apiResource('paraderos', ParaderosController::class);
        Route::post('/rutas/{id}/paraderos/bulk', [ParaderosController::class, 'bulkStore']);

        // Conductores (La Empresa 3 puede afiliar a sus conductores)
        Route::post('/conductores', [ConductoresController::class, 'store']);
        Route::put('/conductores/{id}', [ConductoresController::class, 'edit']);
        Route::delete('/conductores/{id}', [ConductoresController::class, 'destroy']);
        Route::post('/conductores/{id}/rehabilitate', [ConductoresController::class, 'restore']);

        // Licencias (La Empresa y Agentes pueden cargar licencias vinculadas)
        Route::post('/licencias', [LicenciasController::class, 'store']);
        Route::put('/licencias/{id}', [LicenciasController::class, 'edit']);
        Route::delete('/licencias/{id}', [LicenciasController::class, 'destroy']);
        Route::post('/licencias/{id}/rehabilitate', [LicenciasController::class, 'restore']);
        
        // Personas y Propietarios (A menudo requeridos para dar de alta al conductor/vehículo)
        Route::post('/personas', [PersonasController::class, 'store']);
        Route::put('/personas/{id}', [PersonasController::class, 'edit']);
        Route::delete('/personas/{id}', [PersonasController::class, 'destroy']);
        Route::post('/personas/{id}/rehabilitate', [PersonasController::class, 'restore']);
        
        Route::post('/propietarios', [PropietariosController::class, 'store']);
        Route::put('/propietarios/{id}', [PropietariosController::class, 'edit']);
        Route::delete('/propietarios/{id}', [PropietariosController::class, 'destroy']);
        Route::post('/propietarios/{id}/rehabilitate', [PropietariosController::class, 'restore']);

        Route::post('/conductores-licencias', [ConductoresLicenciaController::class, 'store']);
        Route::put('/conductores-licencias/{id}', [ConductoresLicenciaController::class, 'edit']);
        Route::delete('/conductores-licencias/{id}', [ConductoresLicenciaController::class, 'destroy']);
        Route::post('/conductores-licencias/{id}/rehabilitate', [ConductoresLicenciaController::class, 'restore']);
        
        // Historial de Novedades de Condcutores
        Route::post('/novedades-conductores', [NovedadConductorController::class, 'store']);
        Route::put('/novedades-conductores/{id}', [NovedadConductorController::class, 'update']);
        Route::delete('/novedades-conductores/{id}', [NovedadConductorController::class, 'destroy']);
        
        // Historial de Novedades de Licencias
        Route::apiResource('novedades-licencias', NovedadLicenciaController::class);
        Route::apiResource('restricciones-licencia', RestriccionLicController::class);
        
        // Documentos
        Route::post('/documentos', [DocumentosController::class, 'store']);
        Route::post('/documentos/{id}', [DocumentosController::class, 'edit']);
        Route::delete('/documentos/{id}', [DocumentosController::class, 'destroy']);
        Route::post('/documentos/{id}/rehabilitate', [DocumentosController::class, 'restore']);

        // Dashboard Inteligente (Secretaría)
        Route::prefix('secretaria')->group(function () {
            Route::get('/dashboard-stats', [DashboardSecretariaController::class, 'getStats']);
        });
    });

    // ==============================================
    // 3. RUTAS ESTRICTAMENTE ADMINISTRATIVAS
    // ==============================================
    Route::middleware('role:1,4,6')->group(function () { // <-- Operador UPC [4] incluido para Auditoría
        
        // Auditoría (UPC tiene acceso)
        Route::prefix('auditoria')->group(function (){
            Route::get('/', [AuditoriaController::class,'index']);
            Route::get('/{id}', [AuditoriaController::class,'show']);
            Route::get('/{field}/uniques', [AuditoriaController::class, 'getUniqueFields']);
        });
    });

    // Catálogos Base (Solo Admin y Subadmin pueden modificarlos)
    Route::middleware('role:1,6')->group(function () {
        // Catálogos Geográficos
        Route::post('/municipios', [MunicipiosController::class, 'store']);
        Route::put('/municipios/{id}', [MunicipiosController::class, 'edit']);
        Route::delete('/municipios/{id}', [MunicipiosController::class, 'destroy']);
        Route::post('/municipios/{id}/rehabilitate', [MunicipiosController::class, 'restore']);
        
        Route::post('/departamentos', [DepartamentosController::class, 'store']);
        Route::put('/departamentos/{id}', [DepartamentosController::class, 'edit']);
        Route::delete('/departamentos/{id}', [DepartamentosController::class, 'destroy']);
        Route::post('/departamentos/{id}/rehabilitate', [DepartamentosController::class, 'restore']);
        
        Route::post('/barrios', [BarriosController::class, 'store']);
        Route::put('/barrios/{id}', [BarriosController::class, 'edit']);
        Route::delete('/barrios/{id}', [BarriosController::class, 'destroy']);
        Route::post('/barrios/{id}/rehabilitate', [BarriosController::class, 'restore']);

        // Catálogos Base
        Route::post('/tipo_ident', [TipoIdentController::class, 'store']);
        Route::put('/tipo_ident/{id}', [TipoIdentController::class, 'edit']);
        Route::delete('/tipo_ident/{id}', [TipoIdentController::class, 'destroy']);
        Route::post('/tipo_ident/{id}/rehabilitate', [TipoIdentController::class, 'restore']);
        
        Route::post('/tipo_doc', [TipoDocController::class, 'store']);
        Route::put('/tipo_doc/{id}', [TipoDocController::class, 'edit']);
        Route::delete('/tipo_doc/{id}', [TipoDocController::class, 'destroy']);
        Route::post('/tipo_doc/{id}/rehabilitate', [TipoDocController::class, 'restore']);
        
        Route::post('/categorias_licencia', [CategoriasLicenciaController::class, 'store']);
        Route::put('/categorias_licencia/{id}', [CategoriasLicenciaController::class, 'edit']);
        Route::delete('/categorias_licencia/{id}', [CategoriasLicenciaController::class, 'destroy']);
        Route::post('/categorias_licencia/{id}/rehabilitate', [CategoriasLicenciaController::class, 'restore']);
        
        Route::post('/restriccion_lic', [RestriccionLicController::class, 'store']);
        Route::put('/restriccion_lic/{id}', [RestriccionLicController::class, 'edit']);
        Route::delete('/restriccion_lic/{id}', [RestriccionLicController::class, 'destroy']);
        Route::post('/restriccion_lic/{id}/rehabilitate', [RestriccionLicController::class, 'restore']);
        
        Route::post('/tipo-empresa', [TipoEmpresaController::class, 'store']);
        Route::put('/tipo-empresa/{id}', [TipoEmpresaController::class, 'edit']);
        Route::delete('/tipo-empresa/{id}', [TipoEmpresaController::class, 'destroy']);
        Route::post('/tipo-empresa/{id}/rehabilitate', [TipoEmpresaController::class, 'restore']);
        
        Route::post('/tipo-vehiculo', [TipoVehiculoController::class, 'store']);
        Route::put('/tipo-vehiculo/{id}', [TipoVehiculoController::class, 'edit']);
        Route::delete('/tipo-vehiculo/{id}', [TipoVehiculoController::class, 'destroy']);
        Route::post('/tipo-vehiculo/{id}/rehabilitate', [TipoVehiculoController::class, 'restore']);

        // Configuración del Sistema y Seguridad Crítica
        Route::post('/empresas', [EmpresasController::class, 'store']);
        Route::put('/empresas/{id}', [EmpresasController::class, 'edit']);
        Route::delete('/empresas/{id}', [EmpresasController::class, 'destroy']);
        Route::post('/empresas/{id}/rehabilitate', [EmpresasController::class, 'restore']);
        
        Route::post('/permisos', [PermisosController::class, 'store']);
        Route::put('/permisos/{id}', [PermisosController::class, 'edit']);
        Route::delete('/permisos/{id}', [PermisosController::class, 'destroy']);
        Route::post('/permisos/{id}/rehabilitate', [PermisosController::class, 'restore']);
        
        Route::post('/rol', [RolController::class, 'store']);
        Route::put('/rol/{id}', [RolController::class, 'edit']);
        Route::delete('/rol/{id}', [RolController::class, 'destroy']);
        Route::post('/rol/{id}/rehabilitate', [RolController::class, 'restore']);
        
        Route::post('/menus', [MenusController::class, 'store']);
        Route::put('/menus/{id}', [MenusController::class, 'edit']);
        Route::delete('/menus/{id}', [MenusController::class, 'destroy']);
        Route::post('/menus/{id}/rehabilitate', [MenusController::class, 'restore']);
        
        Route::post('/roles-menus', [RolesMenusController::class, 'store']);
        Route::put('/roles-menus/{id}', [RolesMenusController::class, 'edit']);
        Route::delete('/roles-menus/{id}', [RolesMenusController::class, 'destroy']);
        Route::post('/roles-menus/{id}/rehabilitate', [RolesMenusController::class, 'restore']);
        
        Route::post('/users', [UsersController::class, 'store']);
        Route::put('/users/{id}', [UsersController::class, 'edit']);
        Route::delete('/users/{id}', [UsersController::class, 'destroy']);
        Route::post('/users/{id}/rehabilitate', [UsersController::class, 'restore']);
        Route::patch('/users/{id}/role', [UsersController::class, 'patch']);

        // Gestión de Backups (S3)
        Route::prefix('backups')->group(function () {
            Route::get('/', [\App\Http\Controllers\BackupController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\BackupController::class, 'create']);
            Route::get('/download/{file}', [\App\Http\Controllers\BackupController::class, 'download'])->name('backups.download');
            Route::delete('/{file}', [\App\Http\Controllers\BackupController::class, 'destroy']);
        });
    });
});
