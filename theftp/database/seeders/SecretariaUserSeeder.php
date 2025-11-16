<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SecretariaUserSeeder extends Seeder
{
    public function run(): void
    {
        // Asegurar que exista al menos un tipo_ident
        $tipoIdent = DB::table('tipo_ident')->first();
        if (!$tipoIdent) {
            $id = DB::table('tipo_ident')->insertGetId([
                'descripcion' => 'Cédula',
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $tipoIdent = DB::table('tipo_ident')->where('id', $id)->first();
        }

        // Buscar rol Secretaría (por descripcion)
        $rol = DB::table('rol')->where('descripcion', 'like', '%Secretar%')->first();
        if (!$rol) {
            // Si no existe, crear rol y tomar su id
            $rolId = DB::table('rol')->insertGetId([
                'descripcion' => 'Secretaria de tránsito',
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $rol = DB::table('rol')->where('id', $rolId)->first();
        }

        // Crear persona
        $personaId = DB::table('personas')->insertGetId([
            'nui' => (string) rand(100000000, 999999999),
            'name' => 'Usuario',
            'last_name' => 'Secretaria',
            'phone_number' => '3000000000',
            'gender' => 'Hombre',
            'tipo_ident_id' => $tipoIdent->id,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Crear usuario solo si no existe
        $email = 'secretaria@test.com';
        $existing = DB::table('users')->where('email', $email)->first();
        if (!$existing) {
            DB::table('users')->insert([
                'name' => 'Usuario Secretaria',
                'email' => $email,
                'password' => bcrypt('password123'),
                'unable' => false,
                'persona_id' => $personaId,
                'rol_id' => $rol->id,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $this->command->info('Usuario secretaria creado: ' . $email . ' / password123');
        } else {
            $this->command->info('Usuario secretaria ya existe: ' . $email);
        }
    }
}
