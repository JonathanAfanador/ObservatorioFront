<?php

/**
 * routes/web.php — VERSIÓN ACTUALIZADA
 *
 * Se añaden las rutas del módulo Geovisor.
 * El resto de rutas existentes permanece sin cambios.
 */

use Illuminate\Support\Facades\Route;
use App\Models\tipo_ident;
use App\Http\Controllers\GeovisorController; 

// ─────────────────────────────────────────────
//  Rutas públicas existentes 
// ─────────────────────────────────────────────

Route::get('/', function () {
    return view('welcome');
});

Route::get('/login', function () {
    return view('auth.login');
})->name('login');

Route::get('/register', function () {
    $tipos_ident = tipo_ident::whereNull('deleted_at')->get();
    return view('auth.register', ['tipos_ident' => $tipos_ident]);
})->name('register');

// ─────────────────────────────────────────────
//  Rutas del Dashboard 
// ─────────────────────────────────────────────

Route::prefix('dashboard')->name('dashboard.')->group(function () {
    Route::view('/admin',      'dashboard.admin')->name('admin');
    Route::view('/secretaria', 'dashboard.secretaria')->name('secretaria');
    Route::view('/empresa',    'dashboard.empresa')->name('empresa');
    Route::view('/upc',        'dashboard.upc')->name('upc');
});

// ─────────────────────────────────────────────
//  MÓDULO GEOVISOR  
// ─────────────────────────────────────────────

Route::get('/geovisor', [GeovisorController::class, 'index'])
     ->name('geovisor_vite.blade');


Route::get('/geovisor/kmz/{filename}', [GeovisorController::class, 'serveKmz'])
     ->name('geovisor.kmz')
     ->where('filename', '[a-zA-Z0-9_\-\.]+'); // Regex: evita path traversal 