<?php

use App\Http\Controllers\MunicipiosController;
use App\Http\Controllers\DepartamentosController;
use App\Http\Controllers\DocumentosController;
use App\Http\Controllers\BarriosController;
use App\Http\Controllers\CategoriasLicenciaController;
use App\Http\Controllers\ConductoresController;
use App\Http\Controllers\ConductoresLicenciaController;
use App\Http\Controllers\EmpresasController;
use App\Http\Controllers\LicenciasController;
use App\Http\Controllers\PersonasController;
use App\Http\Controllers\PermisosController;
use App\Http\Controllers\PropietariosController;
use App\Http\Controllers\RestriccionLicController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\RolesMenusController;
use App\Http\Controllers\RutasController;
use App\Http\Controllers\SeguimGpsController;
use App\Http\Controllers\SeguimEstadoVehController;
use App\Http\Controllers\MenusController;
use App\Http\Controllers\TipoEmpresaController;
use App\Http\Controllers\TipoIdentController;
use App\Http\Controllers\TipoDocController;
use App\Http\Controllers\TipoVehiculoController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\VehiculoController;
use App\Http\Controllers\AuditoriaController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\V1\AuthController;
use App\Http\Controllers\V1\ReportesController;
use App\Http\Controllers\V1\EstadisticasController;
use App\Http\Controllers\SecretariaController;
use App\Http\Middleware\ForceJsonResponse;

// Registro y Login
Route::middleware(ForceJsonResponse::class)->group(function (){
    Route::prefix('auth')->group(function (){
        Route::post('/register', [AuthController::class, 'registro']);
        Route::post('/register-upc', [AuthController::class, 'registroUPC']);
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
            Route::get('/', [AuditoriaController::class,'index']);
            Route::get('/{id}', [AuditoriaController::class,'show']);
            Route::get('/{field}/uniques', [AuditoriaController::class, 'getUniqueFields']);
        });

        // -- Municipios Routes
        Route::prefix('municipios')->group(function (){
            Route::get('/', [MunicipiosController::class, 'index']);
            Route::get('/{id}', [MunicipiosController::class, 'show']);
            Route::post('/', [MunicipiosController::class, 'store']);
            Route::put('/{id}', [MunicipiosController::class, 'edit']);
            Route::delete('/{id}', [MunicipiosController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [MunicipiosController::class, 'restore']);
        });

        // -- Departamentos Routes
        Route::prefix('departamentos')->group(function (){
            Route::get('/', [DepartamentosController::class, 'index']);
            Route::get('/{id}', [DepartamentosController::class, 'show']);
            Route::post('/', [DepartamentosController::class, 'store']);
            Route::put('/{id}', [DepartamentosController::class, 'edit']);
            Route::delete('/{id}', [DepartamentosController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [DepartamentosController::class, 'restore']);
        });

        // -- Barrios Routes
        Route::prefix('barrios')->group(function (){
            // Rutas de Barrios irian aqui
            Route::get('/', [BarriosController::class, 'index']);
            Route::get('/{id}', [BarriosController::class, 'show']);
            Route::post('/', [BarriosController::class, 'store']);
            Route::put('/{id}', [BarriosController::class, 'edit']);
            Route::delete('/{id}', [BarriosController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [BarriosController::class, 'restore']);
        });

        // -- Tipo Ident Routes
        Route::prefix('tipo_ident')->group(function (){
            Route::get('/', [TipoIdentController::class, 'index']);
            Route::get('/{id}', [TipoIdentController::class, 'show']);
            Route::post('/', [TipoIdentController::class, 'store']);
            Route::put('/{id}', [TipoIdentController::class, 'edit']);
            Route::delete('/{id}', [TipoIdentController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [TipoIdentController::class, 'restore']);
        });

        // -- Tipo Ident Routes
        Route::prefix('tipo_doc')->group(function (){
            Route::get('/', [TipoDocController::class, 'index']);
            Route::get('/{id}', [TipoDocController::class, 'show']);
            Route::post('/', [TipoDocController::class, 'store']);
            Route::put('/{id}', [TipoDocController::class, 'edit']);
            Route::delete('/{id}', [TipoDocController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [TipoDocController::class, 'restore']);
        });

        // -- Documentos Routes
        Route::prefix('documentos')->group(function (){
            Route::get('/', [DocumentosController::class, 'index']);
            Route::get('/{id}', [DocumentosController::class, 'show']);
            Route::post('/', [DocumentosController::class, 'store']);
            Route::post('/{id}', [DocumentosController::class, 'edit']);
            Route::get('/{id}/file', [DocumentosController::class, 'getFile']);
            Route::delete('/{id}', [DocumentosController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [DocumentosController::class, 'restore']);
        });

        // -- Categorias Licencia Routes
        Route::prefix('categorias_licencia')->group(function (){
            Route::get('/', [CategoriasLicenciaController::class, 'index']);
            Route::get('/{id}', [CategoriasLicenciaController::class, 'show']);
            Route::post('/', [CategoriasLicenciaController::class, 'store']);
            Route::put('/{id}', [CategoriasLicenciaController::class, 'edit']);
            Route::delete('/{id}', [CategoriasLicenciaController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [CategoriasLicenciaController::class, 'restore']);
        });

        // -- Restricciones Licencia Routes
        Route::prefix('restriccion_lic')->group(function (){
            Route::get('/', [RestriccionLicController::class, 'index']);
            Route::get('/{id}', [RestriccionLicController::class, 'show']);
            Route::post('/', [RestriccionLicController::class, 'store']);
            Route::put('/{id}', [RestriccionLicController::class, 'edit']);
            Route::delete('/{id}', [RestriccionLicController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [RestriccionLicController::class, 'restore']);
        });

        // -- Licencias Routes
        Route::prefix('licencias')->group(function (){
            Route::get('/', [LicenciasController::class, 'index']);
            Route::get('/{id}', [LicenciasController::class, 'show']);
            Route::post('/', [LicenciasController::class, 'store']);
            Route::put('/{id}', [LicenciasController::class, 'edit']);
            Route::delete('/{id}', [LicenciasController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [LicenciasController::class, 'restore']);
        });

        // -- Personas Routes
        Route::prefix('personas')->group(function (){
            Route::get('/', [PersonasController::class, 'index']);
            Route::get('/{id}', [PersonasController::class, 'show']);
            Route::post('/', [PersonasController::class, 'store']);
            Route::put('/{id}', [PersonasController::class, 'edit']);
            Route::delete('/{id}', [PersonasController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [PersonasController::class, 'restore']);
        });

        // -- Permisos Routes
        Route::prefix('permisos')->group(function (){
            Route::get('/', [PermisosController::class, 'index']);
            Route::get('/{id}', [PermisosController::class, 'show']);
            Route::post('/', [PermisosController::class, 'store']);
            Route::put('/{id}', [PermisosController::class, 'edit']);
            Route::delete('/{id}', [PermisosController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [PermisosController::class, 'restore']);
        });

        // -- Rol Routes
        Route::prefix('rol')->group(function (){
            Route::get('/', [RolController::class, 'index']);
            Route::get('/{id}', [RolController::class, 'show']);
            Route::post('/', [RolController::class, 'store']);
            Route::put('/{id}', [RolController::class, 'edit']);
            Route::delete('/{id}', [RolController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [RolController::class, 'restore']);
        });

        // -- Menus Routes
        Route::prefix('menus')->group(function (){
            Route::get('/', [MenusController::class, 'index']);
            Route::get('/{id}', [MenusController::class, 'show']);
            Route::post('/', [MenusController::class, 'store']);
            Route::put('/{id}', [MenusController::class, 'edit']);
            Route::delete('/{id}', [MenusController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [MenusController::class, 'restore']);
        });

        // -- Roles Menus Routes
        Route::prefix('roles-menus')->group(function (){
            Route::get('/', [RolesMenusController::class, 'index']);
            Route::get('/{id}', [RolesMenusController::class, 'show']);
            Route::post('/', [RolesMenusController::class, 'store']);
            Route::put('/{id}', [RolesMenusController::class, 'edit']);
            Route::delete('/{id}', [RolesMenusController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [RolesMenusController::class, 'restore']);
        });

        // -- Tipo Empresa Routes
        Route::prefix('tipo-empresa')->group(function (){
            Route::get('/', [TipoEmpresaController::class, 'index']);
            Route::get('/{id}', [TipoEmpresaController::class, 'show']);
            Route::post('/', [TipoEmpresaController::class, 'store']);
            Route::put('/{id}', [TipoEmpresaController::class, 'edit']);
            Route::delete('/{id}', [TipoEmpresaController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [TipoEmpresaController::class, 'restore']);
        });

        // -- Empresas Routes
        Route::prefix('empresas')->group(function (){
            Route::get('/', [EmpresasController::class, 'index']);
            Route::get('/{id}', [EmpresasController::class, 'show']);
            Route::post('/', [EmpresasController::class, 'store']);
            Route::put('/{id}', [EmpresasController::class, 'edit']);
            Route::delete('/{id}', [EmpresasController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [EmpresasController::class, 'restore']);
        });

        // -- Rutas Routes
        Route::prefix('rutas')->group(function (){
            Route::get('/', [RutasController::class, 'index']);
            Route::get('/{id}', [RutasController::class, 'show']);
            Route::get('/{id}/file', [RutasController::class, 'getFile']);
            Route::post('/', [RutasController::class, 'store']);
            Route::post('/{id}', [RutasController::class, 'edit']);
            Route::delete('/{id}', [RutasController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [RutasController::class, 'restore']);
        });

        // -- Users Routes
        Route::prefix('users')->group(function (){
            Route::get('/', [UsersController::class, 'index']);
            Route::get('/{id}', [UsersController::class, 'show']);
            Route::post('/', [UsersController::class, 'store']);
            Route::put('/{id}', [UsersController::class, 'edit']);
            Route::delete('/{id}', [UsersController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [UsersController::class, 'restore']);
            Route::patch('/{id}/role', [UsersController::class, 'patch']);
        });

        // -- Conductores Routes
        Route::prefix('conductores')->group(function (){
            Route::get('/', [ConductoresController::class, 'index']);
            Route::get('/{id}', [ConductoresController::class, 'show']);
            Route::post('/', [ConductoresController::class, 'store']);
            Route::put('/{id}', [ConductoresController::class, 'edit']);
            Route::delete('/{id}', [ConductoresController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [ConductoresController::class, 'restore']);
        });

        // -- Tipo Vehiculo Routes
        Route::prefix('tipo-vehiculo')->group(function (){
            Route::get('/', [TipoVehiculoController::class, 'index']);
            Route::get('/{id}', [TipoVehiculoController::class, 'show']);
            Route::post('/', [TipoVehiculoController::class, 'store']);
            Route::put('/{id}', [TipoVehiculoController::class, 'edit']);
            Route::delete('/{id}', [TipoVehiculoController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [TipoVehiculoController::class, 'restore']);
        });

        // -- Propietarios Routes
        Route::prefix('propietarios')->group(function (){
            Route::get('/', [PropietariosController::class, 'index']);
            Route::get('/{id}', [PropietariosController::class, 'show']);
            Route::post('/', [PropietariosController::class, 'store']);
            Route::put('/{id}', [PropietariosController::class, 'edit']);
            Route::delete('/{id}', [PropietariosController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [PropietariosController::class, 'restore']);
        });

        // -- Vehiculos Routes
        Route::prefix('vehiculos')->group(function (){
            Route::get('/', [VehiculoController::class, 'index']);
            Route::get('/{id}', [VehiculoController::class, 'show']);
            Route::post('/', [VehiculoController::class, 'store']);
            Route::put('/{id}', [VehiculoController::class, 'edit']);
            Route::delete('/{id}', [VehiculoController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [VehiculoController::class, 'restore']);
        });

        // -- Conductores Licencias Routes
        Route::prefix('conductores-licencias')->group(function (){
            Route::get('/', [ConductoresLicenciaController::class, 'index']);
            Route::get('/{id}', [ConductoresLicenciaController::class, 'show']);
            Route::post('/', [ConductoresLicenciaController::class, 'store']);
            Route::put('/{id}', [ConductoresLicenciaController::class, 'edit']);
            Route::delete('/{id}', [ConductoresLicenciaController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [ConductoresLicenciaController::class, 'restore']);
        });

        // -- Seguimientos GPS Routes
        Route::prefix('seguim-gps')->group(function (){
            Route::get('/', [SeguimGpsController::class, 'index']);
            Route::get('/{id}', [SeguimGpsController::class, 'show']);
            Route::post('/', [SeguimGpsController::class, 'store']);
            Route::put('/{id}', [SeguimGpsController::class, 'edit']);
            Route::delete('/{id}', [SeguimGpsController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [SeguimGpsController::class, 'restore']);
        });

        // -- Seguimientos Estado Vehículo Routes
        Route::prefix('seguim-estado-veh')->group(function (){
            Route::get('/', [SeguimEstadoVehController::class, 'index']);
            Route::get('/{id}', [SeguimEstadoVehController::class, 'show']);
            Route::post('/', [SeguimEstadoVehController::class, 'store']);
            Route::put('/{id}', [SeguimEstadoVehController::class, 'edit']);
            Route::delete('/{id}', [SeguimEstadoVehController::class, 'destroy']);
            Route::post('/{id}/rehabilitate', [SeguimEstadoVehController::class, 'restore']);
        });

        // -- Reportes Routes
        Route::prefix('reportes')->group(function (){
            Route::get('/empresas', [ReportesController::class, 'empresas']);
            Route::get('/conductores-activos', [ReportesController::class, 'conductoresActivos']);
            Route::get('/vehiculos-operativos', [ReportesController::class, 'vehiculosOperativos']);
            Route::get('/rutas-activas', [ReportesController::class, 'rutasActivas']);
            Route::get('/resoluciones', [ReportesController::class, 'resoluciones']);
        });

        // -- Estadísticas Routes
        Route::prefix('estadisticas')->group(function (){
            Route::get('/resumen', [EstadisticasController::class, 'resumen']);
            Route::get('/detallado', [EstadisticasController::class, 'detallado']);
        });

        // -- Secretaría Estadísticas Routes
        Route::prefix('secretaria/estadisticas')->group(function (){
            Route::get('/resumen', [SecretariaController::class, 'resumen']);
            Route::get('/detallado', [SecretariaController::class, 'detallado']);
        });
    });
});
