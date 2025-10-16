<?php

use App\Enums\Acciones;
use App\Enums\Tablas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\V1\AuthController;
use App\Http\Services\PermisosService;
use Illuminate\Support\Facades\Auth;

Route::get('/test', function (){

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

    try{
        return PermisosService::verificarPermisos($permisos);
    } catch (Exception $e){
        return response()->json([
            'message' => $e->getMessage()
        ], $e->getCode() ?: 400);
    }

})->middleware('auth:sanctum');

Route::get('/user', function (Request $request) {
    $usuario = Auth::user();

    $usuario->load(['persona', 'rol', 'persona.tipo_ident']);

    return $usuario;

})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'registro']);
Route::post('/login', [AuthController::class, 'login']);
