<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PersonasSeeder extends Seeder
{
    public function run(): void
    {
        // Asegurar que existan tipos de identificación
        $tiposMap = DB::table('tipo_ident')->pluck('id', 'descripcion')->toArray();
        if (empty($tiposMap)) {
            throw new \RuntimeException("La tabla 'tipo_ident' está vacía. Corre primero el Tipo_identSeeder.");
        }

        // Helper: obtener ID por descripción (con fallback a coincidencia insensible)
        $getTipoByDesc = function (string $desc) use ($tiposMap): int {
            if (isset($tiposMap[$desc])) {
                return (int) $tiposMap[$desc];
            }
            foreach ($tiposMap as $k => $v) {
                if (mb_strtoupper($k) === mb_strtoupper($desc)) {
                    return (int) $v;
                }
            }
            // Como último recurso, toma uno aleatorio de los existentes
            return (int) array_values($tiposMap)[array_rand($tiposMap)];
        };

        // Para asignación aleatoria rápida
        $tipoIds = array_values($tiposMap);

        // --- Registros base determinísticos (buen smoke test) ---
        $base = [
            [
                'nui'           => '100000001',
                'name'          => 'Balatro',
                'last_name'     => 'Balatrez',
                'phone_number'  => '3121234567',
                'gender'        => 'Hombre', // EXACTO como en la migración
                'tipo_ident_id' => $getTipoByDesc('CÉDULA DE CIUDADANÍA'),
                // created_at / updated_at -> nulos (no se incluyen)
            ],
            [
                'nui'           => '100000002',
                'name'          => 'María Fernanda',
                'last_name'     => 'López Ríos',
                'phone_number'  => '3207654321',
                'gender'        => 'Mujer',
                'tipo_ident_id' => $getTipoByDesc('TARJETA DE IDENTIDAD'),
            ],
            [
                'nui'           => '100000003',
                'name'          => 'Carlos Andrés',
                'last_name'     => 'García Mora',
                'phone_number'  => '3001239876',
                'gender'        => 'Hombre',
                'tipo_ident_id' => $getTipoByDesc('CÉDULA DE EXTRANJERÍA'),
            ],
        ];

        // --- Lote Faker (es_CO) ---
        $faker = \Faker\Factory::create('es_CO');
        $faker->unique(true);

        $lote = [];
        for ($i = 0; $i < 50; $i++) {
            $gender = $faker->randomElement(['Hombre','Mujer']); // EXACTO (respeta migración)

            $lote[] = [
                'nui'           => $faker->unique()->numerify('###########'), // 11 dígitos como string
                'name'          => $gender === 'Mujer' ? $faker->firstNameFemale() : $faker->firstNameMale(),
                'last_name'     => $faker->lastName() . ' ' . $faker->lastName(),
                'phone_number'  => $faker->numerify('3#########'), // celular CO
                'gender'        => $gender,
                'tipo_ident_id' => (int) $tipoIds[array_rand($tipoIds)], // aleatorio real existente
                // created_at / updated_at -> nulos
            ];
        }

        DB::table('personas')->insert(array_merge($base, $lote));
    }
}
