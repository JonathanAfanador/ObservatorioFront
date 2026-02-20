<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PropietariosSeeder extends Seeder
{
    public function run(): void
    {
        // Debe existir al menos un documento
        $docIds = DB::table('documentos')->pluck('id')->all();
        if (empty($docIds)) {
            throw new \RuntimeException("La tabla 'documentos' está vacía. Corre primero DocumentosSeeder.");
        }

        $faker = \Faker\Factory::create('es_CO');

        $rows = [];

        // Crea 30 propietarios de ejemplo
        for ($i = 0; $i < 30; $i++) {
            // fecha de registro entre hace 2 años y ahora
            $fechaRegistro = $faker->dateTimeBetween('-2 years', 'now');

            // timestamps opcionales (a veces null)
            $createdAt = $faker->boolean(70) ? $faker->dateTimeBetween($fechaRegistro, 'now') : null;
            $updatedAt = $createdAt ? $faker->dateTimeBetween($createdAt, 'now') : null;

            $rows[] = [
                'fecha_registro' => $fechaRegistro,                 // puedes omitirlo si quieres usar el DEFAULT
                'documento_id'   => (int) $docIds[array_rand($docIds)],
                'created_at'     => $createdAt,
                'updated_at'     => $updatedAt,
                'deleted_at'     => null,
            ];
        }

        DB::table('propietarios')->insert($rows);
    }
}
