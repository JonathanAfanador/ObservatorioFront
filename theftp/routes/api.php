<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\V1\AuthController;
use Illuminate\Support\Facades\Auth;

Route::get('/user', function (Request $request) {
    $usuario = Auth::user();

    $usuario->load(['persona', 'rol', 'persona.tipo_ident']);

    return $usuario;

})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'registro']);
Route::post('/login', [AuthController::class, 'login']);
