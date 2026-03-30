<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Persona;
use App\Enums\Genders;
use Illuminate\Support\Facades\Hash;

class AuthTest extends TestCase
{
    use RefreshDatabase; // Resetea la DB en memoria por cada test

    public function test_user_can_register()
    {
        $this->withoutExceptionHandling();
        
        $tipoIdent = \Illuminate\Support\Facades\DB::table('tipo_ident')->insertGetId(['descripcion' => 'CC']);
        \Illuminate\Support\Facades\DB::table('rol')->insert(['id' => 5, 'descripcion' => 'Invitado']);
        
        $payload = [
            'nui' => '987654321',
            'name' => 'Prueba',
            'last_name' => 'Test',
            'phone_number' => '3000000000',
            'gender' => 'Hombre',
            'tipo_ident_id' => $tipoIdent,
            'email' => 'test_registro@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->dump();
        $response->assertStatus(201);

        $this->assertDatabaseHas('users', [
            'email' => 'test_registro@example.com',
        ]);
        
        $this->assertDatabaseHas('personas', [
            'nui' => '987654321',
        ]);
    }

    public function test_user_can_login()
    {
        $tipoIdent = \Illuminate\Support\Facades\DB::table('tipo_ident')->insertGetId(['descripcion' => 'CC']);
        $rol = \Illuminate\Support\Facades\DB::table('rol')->insertGetId(['descripcion' => 'Administrador']);

        // Creamos una persona primero para satisfacer la restricción NOT NULL
        $persona = new Persona();
        $persona->nui = 'login_nui_1';
        $persona->name = 'Test Name';
        $persona->last_name = 'Test Last Name';
        $persona->phone_number = '3000000000';
        $persona->gender = 'Hombre';
        $persona->tipo_ident_id = $tipoIdent;
        $persona->save();

        // Creamos un usuario de prueba directamente
        $user = new User();
        $user->name = 'Test';
        $user->email = 'login_test@example.com';
        $user->password = Hash::make('password123');
        $user->rol_id = $rol; // Admin
        $user->persona_id = $persona->id;
        $user->unable = false;
        $user->save();

        $payload = [
            'email' => 'login_test@example.com',
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/auth/login', $payload);

        $response->dump();
        $response->assertStatus(200);
                 
        // Verificar registro de InicioSesion
        $this->assertDatabaseHas('inicio_sesion', [
            'usuario_id' => $user->id,
        ]);
    }

    public function test_login_requires_valid_credentials()
    {
        $tipoIdent = \Illuminate\Support\Facades\DB::table('tipo_ident')->insertGetId(['descripcion' => 'CC']);
        $rol = \Illuminate\Support\Facades\DB::table('rol')->insertGetId(['descripcion' => 'Administrador']);

        $persona = new Persona();
        $persona->nui = 'wrong_nui_1';
        $persona->name = 'Wrong Name';
        $persona->last_name = 'Wrong Last Name';
        $persona->phone_number = '3000000000';
        $persona->gender = 'Mujer';
        $persona->tipo_ident_id = $tipoIdent;
        $persona->save();

        $user = new User();
        $user->name = 'Wrong';
        $user->email = 'wrong@example.com';
        $user->password = Hash::make('password123');
        $user->persona_id = $persona->id;
        $user->rol_id = $rol;
        $user->save();

        $payload = [
            'email' => 'wrong@example.com',
            'password' => 'wrongpassword',
        ];

        $response = $this->postJson('/api/auth/login', $payload);

        $response->assertStatus(401)
                 ->assertJson(['message' => 'Credenciales incorrectas']);
    }

    public function test_register_fails_with_unconfirmed_password()
    {
        $payload = [
            'nui' => '1111111',
            'name' => 'Bad',
            'last_name' => 'Pass',
            'gender' => 'Mujer',
            'email' => 'badpass@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different', // Fallo intencional
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        // Debería fallar la validación y devolver 422 Unprocessable Entity
        $response->assertStatus(422)
                 ->assertJsonStructure(['errors' => ['password']]);
    }
}
