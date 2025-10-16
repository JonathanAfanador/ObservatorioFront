<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{

    const ID_EMPRESA_ATANASIO = 1;
    const ID_EMPRESA_RAPIDO_DEL_CARMEN = 2;

    public function run(): void
    {
        // --- Mapa de roles: 'ADMINISTRADOR' => id ---
        $roles = DB::table('rol')->get(['id','descripcion']);
        $rolMap = [];
        foreach ($roles as $r) {
            $rolMap[mb_strtoupper(trim($r->descripcion))] = (int) $r->id;
        }
        $getRolId = function (string $nombre) use ($rolMap): ?int {
            $key = mb_strtoupper(trim($nombre));
            return $rolMap[$key] ?? null;
        };

        // --- Personas disponibles (no usadas aún por users) ---
        $personasLibres = DB::table('personas')
            ->leftJoin('users', 'users.persona_id', '=', 'personas.id')
            ->whereNull('users.id')
            ->pluck('personas.id')
            ->all();

        // Si no hay personas, mejor fallar temprano (evita violar FK)
        if (empty($personasLibres)) {
            throw new \RuntimeException("No hay 'personas' libres para asignar a 'users'. Corre primero PersonasSeeder.");
        }

        // Helper para “sacar” una persona libre (one-to-one)
        $popPersonaId = function () use (&$personasLibres): int {
            if (empty($personasLibres)) {
                throw new \RuntimeException("Se agotaron las 'personas' libres para users.");
            }
            return (int) array_shift($personasLibres);
        };

        // === 1) Usuarios base (QA) ===
        $base = [
            [
                'name'              => 'Admin Sistema',
                'email'             => 'admin@example.com',
                'password'          => Hash::make('Admin.123'), // cámbialo en PROD
                'unable'            => false,
                'unable_date'       => null,
                'email_verified_at' => now(),
                'persona_id'        => $popPersonaId(),
                'rol_id'            => $getRolId('Administrador'),
                'remember_token'    => Str::random(10),
                'empresa_id'       => null, // Puede ver todas
                // timestamps: los maneja la BD/migración si tienes defaults; si no, se llenan solos por Eloquent. Aquí DB::table(), quedan null => OK.
            ],
            [
                'name'              => 'Secretaría de Tránsito',
                'email'             => 'secretaria@example.com',
                'password'          => Hash::make('Secretaria.123'),
                'unable'            => false,
                'unable_date'       => null,
                'email_verified_at' => now(),
                'persona_id'        => $popPersonaId(),
                'rol_id'            => $getRolId('Secretaria de tránsito'),
                'empresa_id'        => self::ID_EMPRESA_ATANASIO, 
                'remember_token'    => Str::random(10),
            ],
            [
                'name'              => 'Empresa Transporte',
                'email'             => 'empresa@example.com',
                'password'          => Hash::make('Empresa.123'),
                'unable'            => false,
                'unable_date'       => null,
                'email_verified_at' => now(),
                'persona_id'        => $popPersonaId(),
                'rol_id'            => $getRolId('Empresa_transporte'),
                'empresa_id'        => self::ID_EMPRESA_ATANASIO, 
                'remember_token'    => Str::random(10),
            ],
            [
                'name'              => 'Usuario UPC',
                'email'             => 'upc@example.com',
                'password'          => Hash::make('Upc.123'),
                'unable'            => false,
                'unable_date'       => null,
                'email_verified_at' => now(),
                'persona_id'        => $popPersonaId(),
                'rol_id'            => $getRolId('Usuario_upc'),
                'empresa_id'        => self::ID_EMPRESA_ATANASIO, 
                'remember_token'    => Str::random(10),
            ],
            [
                'name'              => 'Invitado Demo',
                'email'             => 'invitado@example.com',
                'password'          => Hash::make('Invitado.123'),
                'unable'            => true,
                'unable_date'       => now(),
                'email_verified_at' => null,
                'persona_id'        => $popPersonaId(),
                'rol_id'            => $getRolId('Invitado'),
                'empresa_id'        => self::ID_EMPRESA_RAPIDO_DEL_CARMEN, 
                'remember_token'    => Str::random(10),
            ],
        ];

        // Filtra nulos por si algún rol no existe aún
        $base = array_values(array_filter($base, fn($u) => !is_null($u['rol_id'])));

        DB::table('users')->insert($base);

        // === 2) Lote Faker (opcional) ===
        $faker = \Faker\Factory::create('es_CO');
        $faker->unique(true);

        $rolesDisponibles = array_values(array_filter([
            $getRolId('Administrador'),
            $getRolId('Secretaria de tránsito'),
            $getRolId('Empresa_transporte'),
            $getRolId('Usuario_upc'),
            $getRolId('Invitado'),
        ], fn($value) => !is_null($value)));

        $bulk = [];
        $n = min(20, count($personasLibres)); // no crear más users que personas libres
        for ($i = 0; $i < $n; $i++) {
            $bulk[] = [
                'name'              => $faker->name(),
                'email'             => $faker->unique()->safeEmail(),
                'password'          => Hash::make('Password.123'), // genérico para QA
                'unable'            => false,
                'unable_date'       => null,
                'email_verified_at' => $faker->boolean(75) ? now() : null,
                'persona_id'        => $popPersonaId(),
                'rol_id'            => $rolesDisponibles[array_rand($rolesDisponibles)],
                'remember_token'    => Str::random(10),
                'empresa_id'        => (rand(0,1) ? self::ID_EMPRESA_ATANASIO : self::ID_EMPRESA_RAPIDO_DEL_CARMEN),
            ];
        }

        if (!empty($bulk)) {
            DB::table('users')->insert($bulk);
        }
    }
}
