<?php

use Illuminate\Support\Facades\Route;
use App\Models\tipo_ident; // <-- Importa tu modelo

//  ruta de la landing page
Route::get('/', function () {
    return view('welcome');
});

// Ruta para MOSTRAR la página de login
Route::get('/login', function () {
    return view('auth.login');
})->name('login'); // Le ponemos nombre para usar route('login')

// Ruta para MOSTRAR la página de registro
Route::get('/register', function () {
    
    // Pasamos los tipos de identificación a la vista
    $tipos_ident = tipo_ident::whereNull('deleted_at')->get();
    
    return view('auth.register', [
        'tipos_ident' => $tipos_ident
    ]);

})->name('register');

