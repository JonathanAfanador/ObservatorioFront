<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return view('welcome');
});

use Illuminate\Support\Facades\Route as FacadeRoute;

// Rutas públicas de autenticación - Login y Registro general para todos los roles
FacadeRoute::get('/login', function(){
    return view('auth.role-selection');
})->name('login');

FacadeRoute::get('/registro', function(){
    return view('auth.register');
})->name('register');

// Alias para compatibilidad (redirige a /registro)
FacadeRoute::get('/registro-upc', function(){
    return redirect('/registro');
});

// Ruta para dashboard UPC
FacadeRoute::get('/dashboard/upc', function(){
    $user = Auth::user();
    // Permitimos ver la página a todo el mundo temporalmente.
    // Las acciones (descargas/edición) quedarán habilitadas solo si el usuario tiene rol UPC.
    return view('dashboard.upc');
})->name('dashboard.upc');

// Ruta para dashboard Secretaría
FacadeRoute::get('/dashboard/secretaria', function(){
    $user = Auth::user();
    // Permitimos ver la página a todo el mundo temporalmente.
    // Las acciones quedarán habilitadas solo si el usuario tiene rol Secretaría.
    return view('dashboard.secretaria');
})->name('dashboard.secretaria');

